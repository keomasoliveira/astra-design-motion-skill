#!/usr/bin/env node
// Chrome 150+ / Node 22+. Measures compositor events and visual changes in
// filmstrip screenshots; it does not claim physical display scans or device fps.

const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { execFileSync, spawn } = require("node:child_process");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(name);
  return at < 0 ? fallback : args[at + 1];
};
const durationMs = Number(option("--duration-ms", "2500"));
const filmstrip = !args.includes("--no-filmstrip");
const viewport = { width: 1600, height: 1000 };
const output = option("--output", "");
const pageInput = option("--page", path.join(__dirname, "../assets/frog-example/index.html"));
const pageUrl = /^https?:\/\/|^file:\/\//.test(pageInput)
  ? pageInput
  : pathToFileURL(path.resolve(pageInput)).href;
const chromeBin = process.env.CHROME_BIN || "google-chrome";
const profile = path.join("/tmp", `astra-frog-trace-${process.pid}`);

// CSS-pixel boxes for the 1600 px desktop scene. The core excludes the
// independent spark; the other two boxes distinguish its vicinity and target.
const regions = {
  characterCore: { x: 976, y: 246, width: 246, height: 490 },
  sparkVicinity: { x: 1216, y: 384, width: 96, height: 128 },
  target: { x: 1322, y: 560, width: 134, height: 144 },
};

async function compareRegion(shots, region, innerWidth, innerHeight) {
  const sharp = require("sharp");
  const first = await sharp(Buffer.from(shots[0].snapshot, "base64")).metadata();
  const box = {
    left: Math.round(region.x * first.width / innerWidth),
    top: Math.round(region.y * first.height / innerHeight),
    width: Math.round(region.width * first.width / innerWidth),
    height: Math.round(region.height * first.height / innerHeight),
  };
  const pixels = [];
  for (const shot of shots) {
    const { data } = await sharp(Buffer.from(shot.snapshot, "base64"))
      .extract(box).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    pixels.push(data);
  }
  const meanAbsoluteDifferences = [];
  for (let i = 1; i < pixels.length; i++) {
    let sum = 0;
    for (let j = 0; j < pixels[i].length; j++) {
      sum += Math.abs(pixels[i][j] - pixels[i - 1][j]);
    }
    meanAbsoluteDifferences.push(sum / pixels[i].length);
  }
  const threshold = 0.2; // 8-bit RGB mean difference; report it with the count.
  return {
    cssBox: region,
    filmstripPixelBox: box,
    changeThresholdMeanAbsoluteDifference: threshold,
    changedAdjacentPairs: meanAbsoluteDifferences.filter((x) => x > threshold).length,
    unchangedAdjacentPairs: meanAbsoluteDifferences.filter((x) => x <= threshold).length,
    exactRepeatedPairs: meanAbsoluteDifferences.filter((x) => x === 0).length,
    pairsCompared: meanAbsoluteDifferences.length,
  };
}

async function main() {
  if (!Number.isFinite(durationMs) || durationMs < 100) throw new Error("Invalid --duration-ms");
  if (filmstrip) {
    try { require.resolve("sharp"); }
    catch { throw new Error("Filmstrip pixel comparison requires sharp (npm install --no-save sharp)"); }
  }
  const chromeVersion = execFileSync(chromeBin, ["--version"], { encoding: "utf8" }).trim();
  const chrome = spawn(chromeBin, [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    `--window-size=${viewport.width},${viewport.height}`,
    "--remote-allow-origins=*", "--remote-debugging-port=0",
    `--user-data-dir=${profile}`, "about:blank",
  ], { stdio: "ignore" });
  let socket;
  try {
    const portFile = path.join(profile, "DevToolsActivePort");
    for (let attempt = 0; attempt < 100 && !fs.existsSync(portFile); attempt++) await wait(100);
    if (!fs.existsSync(portFile)) throw new Error("Chrome did not expose DevToolsActivePort");
    const port = Number(fs.readFileSync(portFile, "utf8").split("\n")[0]);
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = targets.find((target) => target.type === "page");
    if (!page) throw new Error("Chrome page target unavailable");
    socket = new WebSocket(page.webSocketDebuggerUrl);
    const pending = new Map();
    const counts = new Map();
    const shots = [];
    let commandId = 1;
    let finishTrace;
    const traceFinished = new Promise((resolve) => { finishTrace = resolve; });
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
      } else if (message.method === "Tracing.dataCollected") {
        for (const event of message.params.value) {
          counts.set(event.name, (counts.get(event.name) || 0) + 1);
          if (event.name === "Screenshot" && event.args?.snapshot) {
            shots.push({ ts: event.ts, snapshot: event.args.snapshot });
          }
        }
      } else if (message.method === "Tracing.tracingComplete") {
        finishTrace(message.params);
      }
    };
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = commandId++;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url: pageUrl });
    await wait(700); // lets the intersection observer mark the scene in view
    const before = await send("Runtime.evaluate", {
      expression: "({visibility:document.visibilityState, width:innerWidth, height:innerHeight, replayReady:!!document.getElementById('replay')})",
      returnByValue: true,
    });
    const pageState = before.result.value;
    if (!pageState.replayReady || pageState.visibility !== "visible") {
      throw new Error(`Scene unavailable: ${JSON.stringify(pageState)}`);
    }
    await send("Tracing.start", {
      categories: "devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame" +
        (filmstrip ? ",disabled-by-default-devtools.screenshot" : ""),
      options: "record-as-much-as-possible",
      transferMode: "ReportEvents",
      screenshotMaxCount: 450,
      screenshotMaxSize: 500,
    });
    await send("Runtime.evaluate", { expression: "document.getElementById('replay').click()" });
    await wait(durationMs);
    const after = await send("Runtime.evaluate", {
      expression: "({time:Number(document.getElementById('scrub').value),mode:document.querySelector('[data-mode]').dataset.mode})",
      returnByValue: true,
    });
    await send("Tracing.end");
    const completion = await traceFinished;
    const screenshotGaps = shots.slice(1).map((shot, index) => (shot.ts - shots[index].ts) / 1000);
    const visual = filmstrip && shots.length > 1
      ? Object.fromEntries(await Promise.all(Object.entries(regions).map(async ([name, box]) => [
        name, await compareRegion(shots, box, pageState.width, pageState.height),
      ])))
      : null;
    const result = {
      conditions: {
        browser: chromeVersion, headless: true, page: pageUrl, requestedDurationMs: durationMs,
        viewportWindow: viewport, innerViewport: { width: pageState.width, height: pageState.height },
        filmstrip, screenshotMaxSize: filmstrip ? 500 : null,
      },
      observed: {
        sceneTimeMs: after.result.value.time,
        sceneMode: after.result.value.mode,
        drawFrameEvents: counts.get("DrawFrame") || 0,
        droppedFrameEvents: counts.get("DroppedFrame") || 0,
        fireAnimationFrameEvents: counts.get("FireAnimationFrame") || 0,
        filmstripScreenshots: shots.length,
        screenshotSpanMs: shots.length > 1 ? (shots.at(-1).ts - shots[0].ts) / 1000 : null,
        screenshotGapsOver33Ms: screenshotGaps.filter((gap) => gap > 33.3).length,
        traceDataLoss: completion.dataLossOccurred,
        visual,
      },
      limitations: "Headless Chrome and filmstrip add overhead. DrawFrame/DroppedFrame are compositor events; screenshot changes are sampled visual evidence, not physical display scans or mobile fps. Run filmstrip on/off as an A/B pair.",
    };
    if (output) {
      fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true });
      fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
    }
    console.log(JSON.stringify(result, null, 2));
  } finally {
    if (socket) socket.close();
    chrome.kill();
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
