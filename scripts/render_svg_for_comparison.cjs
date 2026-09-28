#!/usr/bin/env node
// Render an editable SVG on the transparent canvas of its raster master.
// Uses sharp when installed, or headless Chrome through CDP (Node 22+).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pngDimensions(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 26 || buffer.subarray(0, 8).toString('hex') !== signature ||
      buffer.subarray(12, 16).toString() !== 'IHDR') {
    throw new Error('The master and output must be PNG files');
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (!width || !height) throw new Error('Invalid PNG canvas dimensions');
  return { width, height, colorType: buffer[25] };
}

async function renderWithChrome(svg, width, height, outputPngPath) {
  if (typeof WebSocket !== 'function') {
    throw new Error('Chrome fallback requires Node 22+ with the built-in WebSocket API');
  }
  const chromeBin = process.env.CHROME_BIN || 'google-chrome';
  execFileSync(chromeBin, ['--version'], { stdio: 'ignore' });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'astra-svg-render-'));
  const chrome = spawn(chromeBin, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--hide-scrollbars', '--remote-allow-origins=*', '--remote-debugging-port=0',
    '--window-size=' + Math.max(500, width) + ',' + Math.max(500, height),
    '--user-data-dir=' + profile, 'about:blank',
  ], { stdio: 'ignore' });
  let socket;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let attempt = 0; attempt < 100 && !fs.existsSync(portFile); attempt++) {
      if (chrome.exitCode !== null) throw new Error('Chrome exited before DevTools started');
      await wait(100);
    }
    if (!fs.existsSync(portFile)) throw new Error('Chrome did not expose DevToolsActivePort');
    const port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]);
    const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    const page = targets.find((target) => target.type === 'page');
    if (!page) throw new Error('Chrome page target unavailable');
    socket = new WebSocket(page.webSocketDebuggerUrl);
    const pending = new Map();
    let nextId = 1;
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (!pending.has(message.id)) return;
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    };
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: false,
    });
    await send('Emulation.setDefaultBackgroundColorOverride', {
      color: { r: 0, g: 0, b: 0, a: 0 },
    });
    const image = 'data:image/svg+xml;base64,' + svg.toString('base64');
    const html = '<meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}img{display:block;width:' +
      width + 'px;height:' + height + 'px;object-fit:contain}</style><img src="' + image + '">';
    await send('Page.navigate', { url: 'data:text/html;base64,' + Buffer.from(html).toString('base64') });
    const decoded = await send('Runtime.evaluate', {
      expression: 'document.images[0].decode().then(() => true)',
      awaitPromise: true, returnByValue: true,
    });
    if (decoded.result.value !== true) throw new Error('Chrome did not decode the SVG');
    const screenshot = await send('Page.captureScreenshot', {
      format: 'png', fromSurface: true, captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    fs.writeFileSync(outputPngPath, Buffer.from(screenshot.data, 'base64'));
  } finally {
    if (socket) socket.close();
    chrome.kill();
    if (chrome.exitCode === null) {
      await Promise.race([new Promise((resolve) => chrome.once('exit', resolve)), wait(2000)]);
    }
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const [svgPath, masterPngPath, outputPngPath, option, requestedEngine] = argv;
  if (!svgPath || !masterPngPath || !outputPngPath || argv.length > 5 ||
      (option && (option !== '--engine' || !['auto', 'sharp', 'chrome'].includes(requestedEngine)))) {
    throw new Error('Usage: node scripts/render_svg_for_comparison.cjs <editable.svg> <master.png> <render.png> [--engine auto|sharp|chrome]');
  }
  if ([svgPath, masterPngPath].some((source) => path.resolve(source) === path.resolve(outputPngPath))) {
    throw new Error('Output path must differ from the SVG and approved raster master');
  }
  const svg = fs.readFileSync(svgPath);
  if (/<(?:[\w-]+:)?(?:image|foreignObject)\b|data:image\//i.test(svg.toString('utf8'))) {
    throw new Error('SVG embeds raster or foreign content; this gate requires native editable vector artwork');
  }
  const { width, height } = pngDimensions(fs.readFileSync(masterPngPath));
  let sharp;
  try { sharp = require('sharp'); } catch { /* Chrome is a fallback. */ }
  const engine = requestedEngine && requestedEngine !== 'auto'
    ? requestedEngine : sharp ? 'sharp' : 'chrome';
  if (engine === 'sharp') {
    if (!sharp) throw new Error('sharp is not installed; use --engine chrome with Node 22+ and Chrome');
    await sharp(svg, { density: 144 })
      .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .png()
      .toFile(outputPngPath);
  } else {
    await renderWithChrome(svg, width, height, outputPngPath);
  }
  const output = pngDimensions(fs.readFileSync(outputPngPath));
  if (output.width !== width || output.height !== height || output.colorType !== 6) {
    throw new Error('Output must be ' + width + 'x' + height + ' RGBA PNG; got ' +
      output.width + 'x' + output.height + ' PNG color type ' + output.colorType);
  }
  console.log(JSON.stringify({ svgPath, masterPngPath, outputPngPath, canvas: [width, height], engine, alphaChannel: true }));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
