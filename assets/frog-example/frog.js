(() => {
  "use strict";

  const DURATION = 5800;
  const RELEASE = 3450;
  const IMPACT = 4600;
  // Match #premium-position in index.html when its stage placement changes.
  const STAGE_X = 81;
  const STAGE_Y = 5;
  const STAGE_SCALE = .38;
  const scene = document.getElementById("frog-scene");
  const stage = document.getElementById("scene-frame");
  const hero = document.querySelector(".hero");
  const heroCopy = document.querySelector(".hero-copy");
  const demoPanel = document.querySelector(".demo-panel");
  const character = document.getElementById("premium-character");
  const head = document.getElementById("premium-head");
  const body = document.getElementById("premium-body");
  const armLeft = document.getElementById("premium-arm-left");
  const forearmLeft = document.getElementById("premium-forearm-left");
  const handLeft = document.getElementById("premium-hand-left");
  const armRight = document.getElementById("premium-arm-right");
  const handRight = document.getElementById("premium-hand-right");
  const armRightBridge = document.getElementById("premium-arm-right-bridge");
  const handRightBridge = document.getElementById("premium-hand-right-bridge");
  const armRightReach = document.getElementById("premium-arm-right-reach");
  const handRightReach = document.getElementById("premium-hand-right-reach");
  const legLeft = document.getElementById("premium-leg-left");
  const legRight = document.getElementById("premium-leg-right");
  const pupilLeft = document.getElementById("premium-pupil-left");
  const pupilRight = document.getElementById("premium-pupil-right");
  const lidLeft = document.getElementById("premium-lid-left");
  const lidRight = document.getElementById("premium-lid-right");
  const smile = document.getElementById("premium-mouth");
  const aha = document.getElementById("premium-mouth-aha");
  const thinkMouth = document.getElementById("premium-mouth-think");
  const grin = document.getElementById("premium-mouth-grin");
  const spark = document.getElementById("spark");
  const bursts = document.getElementById("spark-bursts");
  const target = document.getElementById("target");
  const targetGlow = document.getElementById("target-glow");
  const targetCore = document.getElementById("target-core");
  const shadow = document.getElementById("ground-shadow");
  const playToggle = document.getElementById("play-toggle");
  const playIcon = document.getElementById("play-icon");
  const playLabel = document.getElementById("play-label");
  const replay = document.getElementById("replay");
  const reducedInput = document.getElementById("reduced");
  const scrub = document.getElementById("scrub");
  const currentTime = document.getElementById("current-time");
  const beatChip = document.getElementById("beat-chip");
  const beatText = document.getElementById("beat-text");
  const status = document.getElementById("player-status");
  const beatCards = [...document.querySelectorAll("[data-seek]")];

  if (!scene || !stage || !character || !head || !body || !armRight || !spark || !playToggle) return;

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 720px)");
  const syncHeroOrder = () => {
    if (!hero || !heroCopy || !demoPanel) return;
    if (mobileLayout.matches) hero.insertBefore(demoPanel, heroCopy);
    else hero.insertBefore(heroCopy, demoPanel);
  };
  syncHeroOrder();
  mobileLayout.addEventListener("change", syncHeroOrder);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (a, b, p) => a + (b - a) * p;
  const ease = (p) => { const v = clamp(p, 0, 1); return v * v * (3 - 2 * v); };
  const windowed = (time, center, halfWidth) => clamp(1 - Math.abs(time - center) / halfWidth, 0, 1);
  const radians = (degrees) => degrees * Math.PI / 180;
  const formatTime = (ms) => `0:${String(Math.floor(ms / 1000)).padStart(2, "0")}.${Math.floor(ms % 1000 / 100)}`;
  const pointOnCurve = (a, b, c, d, t) => {
    const q = 1 - t;
    return q * q * q * a + 3 * q * q * t * b + 3 * q * t * t * c + t * t * t * d;
  };
  const rotatePoint = (x, y, pivotX, pivotY, degrees) => {
    const angle = radians(degrees);
    const dx = x - pivotX;
    const dy = y - pivotY;
    return {
      x: pivotX + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: pivotY + dx * Math.sin(angle) + dy * Math.cos(angle)
    };
  };
  const hasReachPose = Boolean(armRightReach && handRightReach);
  const hasBridgePose = Boolean(hasReachPose && armRightBridge && handRightBridge);
  const ARM_MORPH_START = 1400;
  const ARM_BRIDGE_TIME = 1750;
  const ARM_POSE_CUT = 1900;
  const ARM_RETURN_START = 3700;
  const ARM_RETURN_BRIDGE = 3950;
  const ARM_RETURN_END = 4300;

  const beats = [
    { at: 0, label: "Observa a faísca", card: 0 },
    { at: 1050, label: "Alcança a faísca", card: 1 },
    { at: 2200, label: "Descobre a possibilidade", card: 2 },
    { at: 2400, label: "Pensa antes de agir", card: 2 },
    { at: 3250, label: "Transforma a ideia", card: 3 },
    { at: IMPACT, label: "A ideia encontra seu lugar", card: 3 }
  ];

  let elapsed = 0;
  let lastTimestamp = 0;
  let animationId = 0;
  let mode = "idle";
  let inView = true;
  let manualMotionChoice = false;
  let activeBeat = -1;

  function armAngle(time) {
    if (time < 1050) return 0;
    if (time < 2200) return mix(0, -30, ease((time - 1050) / 1150));
    if (time < 2900) return -30;
    if (time < 3250) return mix(-30, -12, ease((time - 2900) / 350));
    if (time < RELEASE) return mix(-12, -35, ease((time - 3250) / (RELEASE - 3250)));
    if (time < 3700) return mix(-35, -20, ease((time - RELEASE) / 250));
    if (time < 4300) return mix(-20, 0, ease((time - 3700) / 600));
    return 0;
  }

  // The illustrated reach is a separate anatomical pose, with a bridge between
  // the folded and extended silhouettes.
  function reachAngle(time) {
    if (time < ARM_POSE_CUT) return 30;
    if (time < 2200) return mix(30, 0, ease((time - ARM_POSE_CUT) / 300));
    if (time < 2900) return 0;
    if (time < 3250) return mix(0, 20, ease((time - 2900) / 350));
    if (time < RELEASE) return mix(20, -4, ease((time - 3250) / (RELEASE - 3250)));
    if (time < ARM_RETURN_START) return mix(-4, 30, ease((time - RELEASE) / (ARM_RETURN_START - RELEASE)));
    return 30;
  }

  function characterPose(time) {
    const anticipation = windowed(time, 910, 270) + windowed(time, 3060, 220);
    const extension = windowed(time, 3380, 230);
    const landing = windowed(time, 5230, 180);
    const hop = time >= 4850 && time <= 5210 ? Math.sin(Math.PI * (time - 4850) / 360) * 9 : 0;
    const lean = time < 1050 ? 0
      : time < 2200 ? mix(0, 2, ease((time - 1050) / 1150))
      : time < 2900 ? 2
      : time < 3250 ? mix(2, -1, ease((time - 2900) / 350))
      : time < RELEASE ? mix(-1, 3, ease((time - 3250) / (RELEASE - 3250)))
      : time < 4300 ? mix(3, 0, ease((time - RELEASE) / (4300 - RELEASE))) : 0;
    return { hop, lean, bodyOffset: anticipation * 3 - extension * 4 + landing * 5 };
  }

  // Visible fingertip, transformed through its wrist, shoulder and character pivots.
  function rightHand(angle, pose, gripAngle, reaching = false) {
    const fingertip = reaching
      ? rotatePoint(765, 422, 725, 434, gripAngle)
      : rotatePoint(680, 615, 610, 566, gripAngle);
    const armPoint = rotatePoint(fingertip.x, fingertip.y, 564, 412, angle);
    const worldPoint = rotatePoint(armPoint.x, armPoint.y, 511, 925, pose.lean);
    return {
      x: STAGE_X + STAGE_SCALE * worldPoint.x,
      y: STAGE_Y + STAGE_SCALE * worldPoint.y - pose.hop
    };
  }

  function createArmMorph() {
    if (!hasBridgePose || !armRight.firstElementChild?.getTotalLength) return null;
    const svgNS = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgNS, "g");
    group.setAttribute("aria-hidden", "true");
    group.setAttribute("pointer-events", "none");
    group.setAttribute("opacity", "0");
    armRightReach.parentNode.insertBefore(group, armRightReach.nextSibling);
    const defs = document.createElementNS(svgNS, "defs");
    const makeClip = (id) => {
      const clip = document.createElementNS(svgNS, "clipPath");
      clip.setAttribute("id", id);
      const outline = document.createElementNS(svgNS, "path");
      clip.appendChild(outline);
      defs.appendChild(clip);
      return outline;
    };
    const armClip = makeClip("frog-morph-arm-clip");
    const handClip = makeClip("frog-morph-hand-clip");
    group.appendChild(defs);

    const sources = [
      { arm: armRight, hand: handRight, angle: armAngle(ARM_MORPH_START), wrist: [610, 566] },
      { arm: armRightBridge, hand: handRightBridge, angle: 0, wrist: [699, 522] },
      { arm: armRightReach, hand: handRightReach, angle: 30, wrist: [725, 434] },
      { arm: armRight, hand: handRight, angle: 0, wrist: [610, 566] }
    ];
    const layers = [
      { source: (s) => s.arm.children[0], count: 96, closed: true, hand: false },
      { source: (s) => s.arm.children[1], count: 32, closed: false, hand: false },
      { source: (s) => s.arm.children[2], count: 24, closed: false, hand: false },
      { source: (s) => s.hand.children[0], count: 56, closed: true, hand: true },
      { source: (s) => s.hand.children[1], count: 20, closed: false, hand: true }
    ];
    const pointSets = [];
    const outputPaths = [];
    try {
      layers.forEach((layer) => {
        const reference = layer.source(sources[1]);
        if (!reference) throw new Error("Missing arm morph layer");
        const output = reference.cloneNode(false);
        if (outputPaths.length === 1 || outputPaths.length === 2) {
          output.setAttribute("clip-path", "url(#frog-morph-arm-clip)");
        } else if (outputPaths.length === 4) {
          output.setAttribute("clip-path", "url(#frog-morph-hand-clip)");
        }
        group.appendChild(output);
        outputPaths.push(output);
        pointSets.push(sources.map((source) => {
          const path = layer.source(source);
          const length = path.getTotalLength();
          return Array.from({ length: layer.count }, (_, i) => {
            const point = path.getPointAtLength(length * i / (layer.closed ? layer.count : layer.count - 1));
            const wristPoint = layer.hand
              ? rotatePoint(point.x, point.y, source.wrist[0], source.wrist[1], 0)
              : point;
            return rotatePoint(wristPoint.x, wristPoint.y, 564, 412, source.angle);
          });
        }));
      });
    } catch {
      group.remove();
      return null;
    }

    return {
      group,
      render(time) {
        let from;
        let to;
        let progress;
        if (time < ARM_BRIDGE_TIME) {
          from = 0; to = 1;
          progress = ease((time - ARM_MORPH_START) / (ARM_BRIDGE_TIME - ARM_MORPH_START));
        } else if (time < ARM_POSE_CUT) {
          from = 1; to = 2;
          progress = ease((time - ARM_BRIDGE_TIME) / (ARM_POSE_CUT - ARM_BRIDGE_TIME));
        } else if (time < ARM_RETURN_BRIDGE) {
          from = 2; to = 1;
          progress = ease((time - ARM_RETURN_START) / (ARM_RETURN_BRIDGE - ARM_RETURN_START));
        } else {
          from = 1; to = 3;
          progress = ease((time - ARM_RETURN_BRIDGE) / (ARM_RETURN_END - ARM_RETURN_BRIDGE));
        }
        outputPaths.forEach((path, layerIndex) => {
          const a = pointSets[layerIndex][from];
          const b = pointSets[layerIndex][to];
          const coordinates = a.map((point, i) => `${i ? "L" : "M"}${mix(point.x, b[i].x, progress).toFixed(1)} ${mix(point.y, b[i].y, progress).toFixed(1)}`);
          path.setAttribute("d", coordinates.join("") + (layers[layerIndex].closed ? "Z" : ""));
        });
        armClip.setAttribute("d", outputPaths[0].getAttribute("d"));
        handClip.setAttribute("d", outputPaths[3].getAttribute("d"));
      }
    };
  }

  const armMorph = createArmMorph();

  function sparkAt(time, hand) {
    const hover = { x: 386 + Math.sin(time / 230) * 2, y: 199 + Math.sin(time / 200) * 3 };
    if (time < 1900) return hover;
    if (time < 2200) {
      const p = ease((time - 1900) / 300);
      return { x: mix(hover.x, hand.x, p), y: mix(hover.y, hand.y, p) };
    }
    if (time < RELEASE) return hand;
    if (time < IMPACT) {
      const p = clamp((time - RELEASE) / (IMPACT - RELEASE), 0, 1);
      const releaseHand = hasReachPose
        ? rightHand(reachAngle(RELEASE), characterPose(RELEASE), 0, true)
        : rightHand(armAngle(RELEASE), characterPose(RELEASE), 0);
      return {
        x: pointOnCurve(releaseHand.x, 440, 500, 497, p),
        y: pointOnCurve(releaseHand.y, 115, 220, 303, p)
      };
    }
    return { x: 497, y: 303 };
  }

  function updateBeat(time) {
    let index = 0;
    for (let i = beats.length - 1; i >= 0; i--) {
      if (time >= beats[i].at) { index = i; break; }
    }
    if (index === activeBeat) return;
    activeBeat = index;
    beatChip.querySelector(".chip-index").textContent = String(index + 1).padStart(2, "0");
    beatText.textContent = beats[index].label;
    beatCards.forEach((card, cardIndex) => {
      if (cardIndex === beats[index].card) card.setAttribute("aria-current", "step");
      else card.removeAttribute("aria-current");
    });
    scene.dataset.beat = String(index + 1);
  }

  function render(time) {
    const t = clamp(time, 0, DURATION);
    const pose = characterPose(t);
    const angleRight = armMorph
      ? t < ARM_MORPH_START ? armAngle(t) : 0
      : hasReachPose && t >= ARM_POSE_CUT ? 0 : armAngle(t);
    const angleReach = hasReachPose ? reachAngle(t) : 0;
    const grip = ease((t - 2080) / 160) * (1 - ease((t - 3310) / 140));
    const handAngle = -9 * grip;
    const hand = hasReachPose && t >= ARM_POSE_CUT && (!armMorph || t < ARM_RETURN_END)
      ? rightHand(angleReach, pose, handAngle, true)
      : rightHand(angleRight, pose, handAngle);
    const idea = sparkAt(t, hand);
    const wave = t < 4830 ? 0 : t < 5110 ? mix(0, -18, ease((t - 4830) / 280))
      : t < 5400 ? -18 : mix(-18, 0, ease((t - 5400) / 400));
    const tilt = t < 650 ? -1 * ease(t / 650)
      : t < 2200 ? mix(-1, -2, ease((t - 650) / 1550))
      : t < 2900 ? mix(-2, 0, ease((t - 2200) / 700))
      : t < RELEASE ? mix(0, 2, ease((t - 2900) / (RELEASE - 2900)))
      : t < 4300 ? mix(2, 0, ease((t - RELEASE) / (4300 - RELEASE)))
      : t < 5000 ? 0 : -2 * windowed(t, 5260, 390);
    const impactIn = ease((t - IMPACT) / 140);
    const burstOut = 1 - ease((t - (IMPACT + 180)) / 520);
    const impactPulse = windowed(t, IMPACT + 150, 160);
    const blink = Math.max(windowed(t, 620, 90), windowed(t, 3310, 85), windowed(t, 5660, 100));
    const wink = windowed(t, 5250, 200);
    const discovery = ease((t - 2200) / 100) * (1 - ease((t - 2390) / 80));
    const thinking = ease((t - 2390) / 80) * (1 - ease((t - 2860) / 80));
    const success = ease((t - 4800) / 140);
    const gaze = t >= 2420 && t < RELEASE ? { x: 497, y: 303 } : idea;
    const dx = clamp((gaze.x - 280) / 160, -1, 1) * 5;
    const dy = clamp((gaze.y - 180) / 160, -1, 1) * 6;
    const sparkleScale = t < IMPACT ? 1 + Math.sin(t / 170) * .045 : mix(1, .72, ease((t - IMPACT) / 300));
    const legPush = windowed(t, 3370, 230) * 5;
    const hopTuck = windowed(t, 5030, 300) * 7;

    character.setAttribute("transform", `translate(0 ${(-pose.hop / STAGE_SCALE).toFixed(2)}) rotate(${pose.lean.toFixed(2)} 511 925)`);
    body.setAttribute("transform", `translate(0 ${pose.bodyOffset.toFixed(2)})`);
    head.setAttribute("transform", `rotate(${tilt.toFixed(2)} 505 372)`);
    armRight.setAttribute("transform", `rotate(${angleRight.toFixed(2)} 564 412)`);
    if (hasReachPose) {
      const entryMorph = Boolean(armMorph && t >= ARM_MORPH_START && t < ARM_POSE_CUT);
      const returnMorph = Boolean(armMorph && t >= ARM_RETURN_START && t < ARM_RETURN_END);
      // Only one complete arm is visible: rest, interpolated bridge, or reach.
      armRight.setAttribute("opacity", armMorph
        ? t < ARM_MORPH_START || t >= ARM_RETURN_END ? "1" : "0"
        : t < ARM_POSE_CUT ? "1" : "0");
      if (armRightBridge) armRightBridge.setAttribute("opacity", "0");
      armRightReach.setAttribute("opacity", t >= ARM_POSE_CUT && (!armMorph || t < ARM_RETURN_START) ? "1" : "0");
      armRightReach.setAttribute("transform", `rotate(${angleReach.toFixed(2)} 564 412)`);
      handRightReach.setAttribute("transform", `rotate(${handAngle.toFixed(2)} 725 434)`);
      if (armMorph) {
        armMorph.group.setAttribute("opacity", entryMorph || returnMorph ? "1" : "0");
        if (entryMorph || returnMorph) armMorph.render(t);
      }
    }
    if (handRight) handRight.setAttribute("transform", `rotate(${hasReachPose ? 0 : handAngle} 610 566)`);
    if (armLeft) armLeft.setAttribute("transform", `rotate(${(wave * .12).toFixed(2)} 391 374)`);
    if (forearmLeft) forearmLeft.setAttribute("transform", `rotate(${wave.toFixed(2)} 360 475)`);
    if (handLeft) handLeft.setAttribute("transform", `rotate(${wave.toFixed(2)} 360 475)`);
    if (legLeft) legLeft.setAttribute("transform", `rotate(${(-legPush + hopTuck).toFixed(2)} 452 658)`);
    if (legRight) legRight.setAttribute("transform", `translate(0 ${pose.bodyOffset.toFixed(2)}) rotate(${(legPush - hopTuck).toFixed(2)} 625 756)`);
    pupilLeft.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
    pupilRight.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
    lidLeft.setAttribute("opacity", blink.toFixed(3));
    lidRight.setAttribute("opacity", Math.max(blink, wink).toFixed(3));
    aha.setAttribute("opacity", discovery.toFixed(3));
    if (thinkMouth) thinkMouth.setAttribute("opacity", thinking.toFixed(3));
    if (grin) grin.setAttribute("opacity", success.toFixed(3));
    smile.setAttribute("opacity", Math.max(0, 1 - discovery - thinking - success).toFixed(3));
    spark.setAttribute("transform", `translate(${idea.x.toFixed(2)} ${idea.y.toFixed(2)}) scale(${sparkleScale.toFixed(3)})`);
    if (target) target.setAttribute("transform", `translate(497 310) scale(${(1 + impactPulse * .1).toFixed(3)} ${(1 - impactPulse * .17).toFixed(3)})`);
    targetGlow.setAttribute("opacity", (impactIn * (.56 + impactPulse * .18)).toFixed(3));
    targetCore.setAttribute("opacity", (.38 + impactIn * .62).toFixed(3));
    targetCore.setAttribute("r", (11 + impactPulse * 6).toFixed(2));
    bursts.setAttribute("opacity", (impactIn * burstOut).toFixed(3));
    bursts.setAttribute("transform", `translate(497 303) scale(${(1 + impactIn * .26).toFixed(3)}) translate(-497 -303)`);
    if (shadow) {
      const shadowScale = 1 - pose.hop * .008;
      shadow.setAttribute("transform", `translate(515 930) scale(${shadowScale.toFixed(3)} 1) translate(-515 -930)`);
      shadow.setAttribute("opacity", (1 - pose.hop * .035).toFixed(3));
    }
    scrub.value = String(Math.round(t));
    scrub.style.setProperty("--progress", `${(t / DURATION * 100).toFixed(2)}%`);
    currentTime.textContent = formatTime(t);
    scene.dataset.time = String(Math.round(t));
    updateBeat(t);
    scrub.setAttribute("aria-valuetext", `${formatTime(t)} — ${beats[activeBeat].label}`);
  }

  function syncControls() {
    const reduced = reducedInput.checked;
    playToggle.disabled = reduced;
    replay.disabled = reduced;
    if (reduced) {
      playIcon.textContent = "▶";
      playLabel.textContent = "Reproduzir";
      playToggle.setAttribute("aria-label", "Reproduzir animação indisponível com movimento reduzido");
    } else if (mode === "playing") {
      playIcon.textContent = "Ⅱ";
      playLabel.textContent = "Pausar";
      playToggle.setAttribute("aria-label", "Pausar animação");
    } else {
      playIcon.textContent = "▶";
      playLabel.textContent = mode === "paused" && elapsed > 0 ? "Retomar" : "Reproduzir";
      playToggle.setAttribute("aria-label", `${playLabel.textContent} animação`);
    }
    scene.dataset.mode = mode;
  }

  function stopFrame() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
    lastTimestamp = 0;
  }

  function requestFrame() {
    if (mode === "playing" && !reducedInput.checked && inView && !document.hidden && !animationId) {
      animationId = requestAnimationFrame(tick);
    }
  }

  function tick(timestamp) {
    animationId = 0;
    if (mode !== "playing" || reducedInput.checked || !inView || document.hidden) { lastTimestamp = 0; return; }
    if (lastTimestamp) elapsed = Math.min(DURATION, elapsed + Math.max(0, timestamp - lastTimestamp));
    lastTimestamp = timestamp;
    render(elapsed);
    if (elapsed >= DURATION) {
      mode = "ended";
      lastTimestamp = 0;
      status.textContent = "A ideia chegou ao destino. Use Repetir para ver novamente.";
      syncControls();
    } else requestFrame();
  }

  function play() {
    if (reducedInput.checked) return;
    if (elapsed >= DURATION) { elapsed = 0; render(elapsed); }
    mode = "playing";
    lastTimestamp = 0;
    status.textContent = "Sapinho em movimento. Você pode pausar a qualquer momento.";
    syncControls();
    requestFrame();
  }

  function pause(message = "Animação pausada no quadro escolhido.") {
    stopFrame();
    mode = "paused";
    status.textContent = message;
    syncControls();
  }

  function seek(time) {
    if (mode === "playing") pause();
    else if (mode !== "reduced") { mode = "paused"; syncControls(); }
    elapsed = clamp(Number(time) || 0, 0, DURATION);
    render(elapsed);
  }

  playToggle.addEventListener("click", () => mode === "playing" ? pause() : play());
  replay.addEventListener("click", () => {
    if (reducedInput.checked) return;
    stopFrame();
    elapsed = 0;
    render(0);
    play();
  });
  scrub.addEventListener("input", (event) => {
    seek(event.target.value);
    status.textContent = "Posição escolhida na linha do tempo.";
  });
  beatCards.forEach((card) => card.addEventListener("click", () => {
    seek(card.dataset.seek);
    status.textContent = `Etapa: ${beatText.textContent}.`;
    stage.scrollIntoView({ behavior: reducedInput.checked ? "auto" : "smooth", block: "center" });
  }));
  reducedInput.addEventListener("change", () => {
    manualMotionChoice = true;
    stopFrame();
    if (reducedInput.checked) {
      mode = "reduced";
      elapsed = DURATION;
      render(elapsed);
      status.textContent = "Movimento reduzido: o resultado da cena aparece sem reprodução automática.";
    } else {
      mode = "paused";
      elapsed = 0;
      render(elapsed);
      status.textContent = "Movimento completo disponível. Pressione Reproduzir.";
    }
    syncControls();
  });
  mediaQuery.addEventListener("change", () => {
    if (manualMotionChoice) return;
    reducedInput.checked = mediaQuery.matches;
    reducedInput.dispatchEvent(new Event("change"));
    manualMotionChoice = false;
  });
  document.addEventListener("visibilitychange", () => {
    lastTimestamp = 0;
    if (document.hidden) stopFrame();
    else requestFrame();
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry && entry.isIntersecting);
      lastTimestamp = 0;
      if (inView) requestFrame();
      else stopFrame();
    }, { threshold: .5 });
    observer.observe(stage);
  }

  reducedInput.checked = mediaQuery.matches;
  if (reducedInput.checked) {
    mode = "reduced";
    elapsed = DURATION;
    render(elapsed);
    status.textContent = "Movimento reduzido: pose final e resultado visíveis.";
  } else {
    mode = "playing";
    render(0);
    status.textContent = "Sapinho em movimento. Você pode pausar a qualquer momento.";
    requestFrame();
  }
  syncControls();
})();
