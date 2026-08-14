/* ══════════════════════════════════════════════════════════════
   LIQUID · interactive rainbow fluid simulation (home page)
   Real-time Navier–Stokes (Stam-style) GPU solver on WebGL2.
   Cursor injects velocity + rainbow dye; the faster you move,
   the brighter the colour that lights up.
   Exposes window.LiquidSim = { start, stop, resize, active }.
   Falls back silently (leaves the particle canvas) if WebGL2
   or float render targets are unavailable.
   ══════════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('liquid-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2', {
    alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: false
  });
  if (!gl) return;                                   // no WebGL2 → bail
  const floatExt = gl.getExtension('EXT_color_buffer_float');
  if (!floatExt) return;                             // can't render to float → bail

  /* ── tunables ──────────────────────────────────────────────── */
  const CFG = {
    SIM_RES: 128,          // velocity/pressure grid resolution
    DYE_RES: 1024,         // colour field resolution
    DENSITY_DISSIPATION: 0.28,   // how fast colour fades (higher = faster)
    VELOCITY_DISSIPATION: 0.7,   // how fast motion settles
    PRESSURE: 0.8,
    PRESSURE_ITER: 20,
    CURL: 30,              // vorticity / swirliness
    SPLAT_RADIUS: 0.32,    // cursor blob size
    SPLAT_FORCE: 6600,     // push strength
    DPR_CAP: 1.5
  };

  /* ── shaders (GLSL ES 1.00 — accepted by WebGL2) ───────────── */
  const baseVert = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

  const clearFrag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

  const splatFrag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }`;

  const advectionFrag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      vec4 result = texture2D(uSource, coord);
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }`;

  const divergenceFrag = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x;
      if (vR.x > 1.0) R = -C.x;
      if (vT.y > 1.0) T = -C.y;
      if (vB.y < 0.0) B = -C.y;
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }`;

  const curlFrag = `
    precision highp float;
    varying vec2 vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }`;

  const vorticityFrag = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy;
      vel += force * dt;
      vel = clamp(vel, -1000.0, 1000.0);
      gl_FragColor = vec4(vel, 0.0, 1.0);
    }`;

  const pressureFrag = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }`;

  const gradientFrag = `
    precision highp float;
    varying vec2 vUv, vL, vR, vT, vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 vel = texture2D(uVelocity, vUv).xy;
      vel -= vec2(R - L, T - B);
      gl_FragColor = vec4(vel, 0.0, 1.0);
    }`;

  // Display: colour comes from dye; motion adds a glow so faster = brighter.
  const displayFrag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uDye;
    uniform sampler2D uVelocity;
    void main () {
      vec3 c = texture2D(uDye, vUv).rgb;
      float speed = length(texture2D(uVelocity, vUv).xy);
      float glow = clamp(speed * 0.11, 0.0, 1.1);
      c += c * glow;                 // faster motion → brighter light-up
      gl_FragColor = vec4(c, 1.0);   // opaque over the page's black
    }`;

  /* ── GL helpers ────────────────────────────────────────────── */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.error('[liquid] shader:', gl.getShaderInfoLog(s), src);
    return s;
  }
  function Program(fragSrc) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, baseVert));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragSrc));
    gl.bindAttribLocation(p, 0, 'aPosition');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      console.error('[liquid] link:', gl.getProgramInfoLog(p));
    const uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(p, i).name;
      uniforms[name] = gl.getUniformLocation(p, name);
    }
    return { program: p, uniforms };
  }

  const prog = {
    clear: Program(clearFrag),
    splat: Program(splatFrag),
    advection: Program(advectionFrag),
    divergence: Program(divergenceFrag),
    curl: Program(curlFrag),
    vorticity: Program(vorticityFrag),
    pressure: Program(pressureFrag),
    gradient: Program(gradientFrag),
    display: Program(displayFrag)
  };

  const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    return (target) => {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  })();

  function createFBO(w, h, internal, format, type, filter) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      tex, fbo, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
    };
  }
  function createDoubleFBO(w, h, internal, format, type, filter) {
    let fbo1 = createFBO(w, h, internal, format, type, filter);
    let fbo2 = createFBO(w, h, internal, format, type, filter);
    return {
      width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      get read() { return fbo1; }, set read(v) { fbo1 = v; },
      get write() { return fbo2; }, set write(v) { fbo2 = v; },
      swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; }
    };
  }

  const RG = gl.RG16F, RGBA = gl.RGBA16F, R = gl.R16F;
  const HALF = gl.HALF_FLOAT;
  let dye, velocity, divergence, curl, pressure;

  function getRes(res) {
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(res), max = Math.round(res * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min } : { width: min, height: max };
  }

  function initFramebuffers() {
    const sim = getRes(CFG.SIM_RES);
    const dyeR = getRes(CFG.DYE_RES);
    dye = createDoubleFBO(dyeR.width, dyeR.height, RGBA, gl.RGBA, HALF, gl.LINEAR);
    velocity = createDoubleFBO(sim.width, sim.height, RG, gl.RG, HALF, gl.LINEAR);
    divergence = createFBO(sim.width, sim.height, R, gl.RED, HALF, gl.NEAREST);
    curl = createFBO(sim.width, sim.height, R, gl.RED, HALF, gl.NEAREST);
    pressure = createDoubleFBO(sim.width, sim.height, R, gl.RED, HALF, gl.NEAREST);
  }

  /* ── sizing ───────────────────────────────────────────────── */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, CFG.DPR_CAP);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h || !dye) {
      canvas.width = w; canvas.height = h;
      initFramebuffers();
    }
  }

  /* ── simulation step ──────────────────────────────────────── */
  function step(dt) {
    gl.disable(gl.BLEND);

    // curl
    gl.useProgram(prog.curl.program);
    gl.uniform2f(prog.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(prog.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    // vorticity
    gl.useProgram(prog.vorticity.program);
    gl.uniform2f(prog.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(prog.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(prog.vorticity.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(prog.vorticity.uniforms.curl, CFG.CURL);
    gl.uniform1f(prog.vorticity.uniforms.dt, dt);
    blit(velocity.write); velocity.swap();

    // divergence
    gl.useProgram(prog.divergence.program);
    gl.uniform2f(prog.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(prog.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    // clear pressure (dampen)
    gl.useProgram(prog.clear.program);
    gl.uniform1i(prog.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(prog.clear.uniforms.value, CFG.PRESSURE);
    blit(pressure.write); pressure.swap();

    // pressure solve
    gl.useProgram(prog.pressure.program);
    gl.uniform2f(prog.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(prog.pressure.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < CFG.PRESSURE_ITER; i++) {
      gl.uniform1i(prog.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write); pressure.swap();
    }

    // subtract gradient
    gl.useProgram(prog.gradient.program);
    gl.uniform2f(prog.gradient.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(prog.gradient.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(prog.gradient.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write); velocity.swap();

    // advect velocity
    gl.useProgram(prog.advection.program);
    gl.uniform2f(prog.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(prog.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(prog.advection.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(prog.advection.uniforms.dt, dt);
    gl.uniform1f(prog.advection.uniforms.dissipation, CFG.VELOCITY_DISSIPATION);
    blit(velocity.write); velocity.swap();

    // advect dye
    gl.uniform1i(prog.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(prog.advection.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(prog.advection.uniforms.dissipation, CFG.DENSITY_DISSIPATION);
    blit(dye.write); dye.swap();
  }

  function render() {
    gl.disable(gl.BLEND);
    gl.useProgram(prog.display.program);
    gl.uniform1i(prog.display.uniforms.uDye, dye.read.attach(0));
    gl.uniform1i(prog.display.uniforms.uVelocity, velocity.read.attach(1));
    blit(null);
  }

  /* ── splats ───────────────────────────────────────────────── */
  function splat(x, y, dx, dy, color) {
    // velocity
    gl.disable(gl.BLEND);
    gl.useProgram(prog.splat.program);
    gl.uniform1i(prog.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(prog.splat.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(prog.splat.uniforms.point, x, y);
    gl.uniform3f(prog.splat.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(prog.splat.uniforms.radius, radius());
    blit(velocity.write); velocity.swap();
    // dye
    gl.uniform1i(prog.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(prog.splat.uniforms.color, color[0], color[1], color[2]);
    blit(dye.write); dye.swap();
  }
  function radius() {
    let r = CFG.SPLAT_RADIUS / 100.0;
    const ar = canvas.width / canvas.height;
    if (ar > 1) r *= ar;
    return r * r;
  }

  // HSV → RGB, h in [0,1]
  function hsv(h, s, v) {
    const i = Math.floor(h * 6), f = h * 6 - i;
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: return [v, t, p]; case 1: return [q, v, p]; case 2: return [p, v, t];
      case 3: return [p, q, v]; case 4: return [t, p, v]; default: return [v, p, q];
    }
  }

  /* ── pointer + hue ────────────────────────────────────────── */
  let hue = Math.random();
  let last = null, lastMove = 0;

  function pointerColor(speed) {
    // faster drag → brighter, more saturated rainbow
    const gain = Math.min(0.14 + speed * 34.0, 1.15);
    const c = hsv(hue, 1.0, 1.0);
    return [c[0] * gain, c[1] * gain, c[2] * gain];
  }

  function onMove(clientX, clientY) {
    const x = clientX / window.innerWidth;
    const y = 1.0 - clientY / window.innerHeight;
    if (!last) { last = { x, y }; return; }
    let dx = x - last.x, dy = y - last.y;
    const speed = Math.hypot(dx, dy);
    last = { x, y };
    lastMove = performance.now();
    if (speed < 0.00001) return;
    hue = (hue + speed * 3.0 + 0.004) % 1.0;
    splat(x, y, dx * CFG.SPLAT_FORCE, dy * CFG.SPLAT_FORCE, pointerColor(speed));
  }

  window.addEventListener('mousemove', (e) => { if (running) onMove(e.clientX, e.clientY); });
  window.addEventListener('touchmove', (e) => {
    if (!running) return;
    const t = e.targetTouches[0];
    if (t) onMove(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('mousedown', (e) => { last = null; });

  // Ambient life: gentle drifting rainbow splats when idle, so it invites play.
  function idleSplat() {
    const x = Math.random(), y = Math.random();
    const ang = Math.random() * Math.PI * 2;
    const mag = 0.0016;
    hue = (hue + 0.03) % 1.0;
    const c = hsv(hue, 1.0, 1.0);
    splat(x, y, Math.cos(ang) * mag * CFG.SPLAT_FORCE, Math.sin(ang) * mag * CFG.SPLAT_FORCE,
      [c[0] * 0.4, c[1] * 0.4, c[2] * 0.4]);
  }

  function seedBurst() {
    for (let i = 0; i < 9; i++) {
      const x = 0.5 + (Math.random() - 0.5) * 0.7;
      const y = 0.5 + (Math.random() - 0.5) * 0.7;
      const ang = Math.random() * Math.PI * 2, mag = 0.003;
      hue = (hue + 0.11) % 1.0;
      const c = hsv(hue, 1.0, 1.0);
      splat(x, y, Math.cos(ang) * mag * CFG.SPLAT_FORCE, Math.sin(ang) * mag * CFG.SPLAT_FORCE,
        [c[0] * 0.7, c[1] * 0.7, c[2] * 0.7]);
    }
  }

  /* ── loop ─────────────────────────────────────────────────── */
  let running = false, rafId = null, lastTime = 0, seeded = false, idleTimer = 0;

  function frame(now) {
    if (!running) return;
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (!(dt > 0)) dt = 0.016;
    dt = Math.min(dt, 0.0166);

    // idle animation when the cursor has been still for a bit
    if (now - lastMove > 1200) {
      idleTimer += dt;
      if (idleTimer > 0.12) { idleSplat(); idleTimer = 0; }
    }

    step(dt);
    render();
    rafId = requestAnimationFrame(frame);
  }

  const api = {
    active: false,
    start() {
      if (running) return;
      resize();
      running = true; api.active = true;
      canvas.style.display = 'block';
      if (!seeded) { seedBurst(); seeded = true; }
      lastTime = performance.now(); lastMove = 0; last = null;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false; api.active = false;
      if (rafId) cancelAnimationFrame(rafId), rafId = null;
      canvas.style.display = 'none';
    },
    resize() { if (running) resize(); },
    _step: step, _render: render   // used only for verification in throttled preview panes
  };

  window.addEventListener('resize', () => api.resize());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (running) { running = false; if (rafId) cancelAnimationFrame(rafId), rafId = null; } }
    else if (api.active && !running) { running = true; lastTime = performance.now(); rafId = requestAnimationFrame(frame); }
  });

  window.LiquidSim = api;

  // Start immediately if the home section is the active one on load.
  const home = document.getElementById('home');
  if (home && home.classList.contains('active')) api.start();
})();
