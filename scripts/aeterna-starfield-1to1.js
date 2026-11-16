/* ============================================================================
 * AETERNA 1:1 MATHEMATICAL ALL-STAR & EXOPLANET SKY RENDERER
 * Architecture:
 *  - Receives exact ERFA (RA, Dec, plx, pmRA, pmDec) projected coordinates
 *    zero-copy from stellarium-web-engine.wasm every frame
 *  - Evaluates 32-band Planck + CIE 1931 + Ballesteros + Keplerian Orbits
 *    directly inside Rust WASM (exodus_astrophysics_engine.wasm)
 *  - Draws ALL visible catalog stars + Deep Exoplanet Hosts (TRAPPIST-1,
 *    Proxima, Kepler-186, Kepler-1649, Sirius A+B) in 1 single GLSL ES 3.00
 *    instanced draw call directly on the live sky canvas.
 * ============================================================================ */
(function (global) {
  'use strict';

  const EXOPLANET_SYSTEMS = [
    {
      hostId: 100001,
      matchHip: 0,
      name: 'NAME TRAPPIST-1|TRAPPIST-1|2MASS J23062928-0502285',
      sp: 'M8V (2566 K)',
      raDeg: 346.6223,
      decDeg: -5.0414,
      plxMas: 82.53,
      pmRaMas: 930.87,
      pmDecMas: -479.40,
      vmag: 18.80,
      bv: 1.90,
      incDeg: 68,
      planets: [
        { tag: 'b', a: 1.25, ecc: 0.006, P: 1.51087, phase0: 0.4, r: 0.058, col: [0.85, 0.56, 0.42] },
        { tag: 'c', a: 1.68, ecc: 0.006, P: 2.42193, phase0: 1.7, r: 0.058, col: [0.88, 0.72, 0.50] },
        { tag: 'd', a: 2.24, ecc: 0.008, P: 4.04921, phase0: 2.9, r: 0.046, col: [0.76, 0.68, 0.58] },
        { tag: 'e', a: 2.93, ecc: 0.005, P: 6.10101, phase0: 4.1, r: 0.064, col: [0.22, 0.74, 0.98] },
        { tag: 'f', a: 3.75, ecc: 0.010, P: 9.20754, phase0: 5.2, r: 0.062, col: [0.46, 0.80, 0.92] },
        { tag: 'g', a: 4.58, ecc: 0.002, P: 12.3524, phase0: 0.9, r: 0.066, col: [0.64, 0.78, 0.88] },
        { tag: 'h', a: 5.65, ecc: 0.005, P: 18.7679, phase0: 3.5, r: 0.044, col: [0.78, 0.86, 0.95] }
      ]
    },
    {
      hostId: 100002,
      matchHip: 70890,
      name: 'NAME Proxima Centauri|Proxima Centauri|Alpha Cen C',
      sp: 'M5.5Ve (3042 K)',
      raDeg: 217.4289,
      decDeg: -62.6795,
      plxMas: 768.07,
      pmRaMas: -3781.74,
      pmDecMas: 769.46,
      vmag: 11.13,
      bv: 1.81,
      incDeg: 58,
      planets: [
        { tag: 'd', a: 1.45, ecc: 0.04, P: 5.122, phase0: 1.2, r: 0.045, col: [0.76, 0.62, 0.52] },
        { tag: 'b', a: 2.40, ecc: 0.02, P: 11.186, phase0: 3.8, r: 0.064, col: [0.30, 0.72, 0.94] }
      ]
    },
    {
      hostId: 100003,
      matchHip: 0,
      name: 'NAME Kepler-1649|Kepler-1649|KOI-3138',
      sp: 'M5V (3240 K)',
      raDeg: 297.501,
      decDeg: 41.751,
      plxMas: 10.82,
      pmRaMas: -65.0,
      pmDecMas: -120.0,
      vmag: 16.3,
      bv: 1.62,
      incDeg: 64,
      planets: [
        { tag: 'b', a: 1.60, ecc: 0.02, P: 8.689, phase0: 0.8, r: 0.056, col: [0.84, 0.58, 0.42] },
        { tag: 'c', a: 2.75, ecc: 0.01, P: 19.535, phase0: 2.6, r: 0.066, col: [0.28, 0.76, 0.94] }
      ]
    },
    {
      hostId: 100004,
      matchHip: 0,
      name: 'NAME Kepler-186|Kepler-186|KOI-571',
      sp: 'M1V (3755 K)',
      raDeg: 298.653,
      decDeg: 43.955,
      plxMas: 5.60,
      pmRaMas: -4.2,
      pmDecMas: 11.4,
      vmag: 14.62,
      bv: 1.48,
      incDeg: 62,
      planets: [
        { tag: 'b', a: 1.25, ecc: 0.02, P: 3.887, phase0: 0.2, r: 0.048, col: [0.84, 0.62, 0.48] },
        { tag: 'c', a: 1.75, ecc: 0.02, P: 7.267, phase0: 1.9, r: 0.052, col: [0.82, 0.70, 0.54] },
        { tag: 'd', a: 2.30, ecc: 0.03, P: 13.343, phase0: 3.4, r: 0.056, col: [0.76, 0.72, 0.66] },
        { tag: 'e', a: 3.05, ecc: 0.03, P: 22.408, phase0: 4.8, r: 0.052, col: [0.68, 0.74, 0.78] },
        { tag: 'f', a: 4.25, ecc: 0.04, P: 129.94, phase0: 2.2, r: 0.066, col: [0.25, 0.74, 0.95] }
      ]
    },
    {
      hostId: 100005,
      matchHip: 87937,
      name: "NAME Barnard's Star|Barnard's Star|V2500 Oph",
      sp: 'M4V (3134 K)',
      raDeg: 269.4521,
      decDeg: 4.6934,
      plxMas: 546.98,
      pmRaMas: -801.55,
      pmDecMas: 10362.39,
      vmag: 9.51,
      bv: 1.73,
      incDeg: 55,
      planets: [
        { tag: 'b', a: 2.15, ecc: 0.03, P: 3.153, phase0: 1.1, r: 0.054, col: [0.76, 0.66, 0.60] }
      ]
    },
    {
      hostId: 100006,
      matchHip: 0,
      name: 'NAME Wolf 359|Wolf 359|CN Leo',
      sp: 'M6V (2800 K)',
      raDeg: 164.1203,
      decDeg: 7.0147,
      plxMas: 415.18,
      pmRaMas: -3866.3,
      pmDecMas: -2699.2,
      vmag: 13.51,
      bv: 2.01,
      incDeg: 48,
      planets: []
    },
    {
      hostId: 0,
      matchHip: 32349,
      name: 'Sirius A+B',
      incDeg: 52,
      planets: [
        { tag: 'Sirius B (WD)', a: 2.85, ecc: 0.59, P: 18300.0, phase0: 2.1, r: 0.068, col: [0.76, 0.89, 1.00], selfLum: true }
      ]
    },
    {
      hostId: 0,
      matchHip: 71683,
      name: 'Alpha Centauri AB',
      incDeg: 62,
      planets: [
        { tag: 'Alpha Cen B', a: 2.95, ecc: 0.52, P: 29189.0, phase0: 1.3, r: 0.145, col: [1.00, 0.82, 0.58], selfLum: true }
      ]
    },
    {
      hostId: 0,
      matchHip: 8102,
      name: 'Tau Ceti',
      incDeg: 35,
      planets: [
        { tag: 'g', a: 1.45, ecc: 0.06, P: 20.0, phase0: 0.4, r: 0.048, col: [0.78, 0.68, 0.58] },
        { tag: 'h', a: 2.05, ecc: 0.23, P: 49.4, phase0: 2.5, r: 0.052, col: [0.72, 0.74, 0.74] },
        { tag: 'e', a: 2.95, ecc: 0.18, P: 162.8, phase0: 4.1, r: 0.062, col: [0.28, 0.74, 0.92] },
        { tag: 'f', a: 3.90, ecc: 0.16, P: 636.1, phase0: 5.5, r: 0.062, col: [0.52, 0.78, 0.88] }
      ]
    },
    {
      hostId: 0,
      matchHip: 43587,
      name: '55 Cancri',
      incDeg: 46,
      planets: [
        { tag: 'e (Janssen)', a: 1.45, ecc: 0.03, P: 0.736, phase0: 0.9, r: 0.060, col: [1.00, 0.42, 0.16] },
        { tag: 'b', a: 2.25, ecc: 0.01, P: 14.65, phase0: 2.8, r: 0.088, col: [0.85, 0.72, 0.56] },
        { tag: 'c', a: 3.10, ecc: 0.05, P: 44.34, phase0: 4.9, r: 0.072, col: [0.58, 0.74, 0.86] }
      ]
    }
  ];

  const VS_STAR_1TO1 = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aQuad;       // [-1..1] quad corner
    layout(location = 1) in vec4 aUvSizeLum;  // u, v, size_px, lum
    layout(location = 2) in vec4 aPhysId;     // bv, vmag, plx_mas, signed_id

    uniform vec2 uViewport;       // CSS/framebuffer size matching quad scale
    uniform float uFovDeg;
    uniform float uResolveBoost;  // 1.0 = auto adaptive on zoom; >1.5 = all-star showcase

    out vec2 vLocal;
    out float vQuadPx;
    out float vLum;
    out float vBv;
    out float vVmag;
    out float vSelected;
    out float vIsHost;

    void main() {
      float lum = max(aUvSizeLum.w, 0.04);
      float baseSize = clamp(aUvSizeLum.z, 0.9, 14.0);
      float isSelected = aPhysId.w < 0.0 ? 1.0 : 0.0;
      float rawId = aPhysId.w < 0.0 ? (-aPhysId.w - 1.0) : aPhysId.w;
      float isHost = rawId >= 100000.0 ? 1.0 : 0.0;

      // Adaptive magnification: bright stars & zoomed FOV transition smoothly into 1:1 3D photospheres
      float fovZoom = clamp(24.0 / max(uFovDeg, 0.02), 1.0, 24.0);
      float magFactor = smoothstep(7.5, -1.5, aPhysId.y);
      float starMult = mix(1.0, 2.2, magFactor) * (1.0 + (fovZoom - 1.0) * (0.28 + 0.72 * magFactor));
      if (uResolveBoost > 1.2) {
        starMult = max(starMult, mix(2.2, 4.4, magFactor) * uResolveBoost);
      }
      if (isSelected > 0.5) {
        starMult = max(starMult, clamp(28.0 / max(baseSize, 1.0), 3.0, 20.0));
      } else if (isHost > 0.5) {
        starMult = max(starMult, clamp(10.0 / max(baseSize, 1.0), 2.4, 9.0));
      }

      // Quad half-radius in CSS pixels (includes outer corona margin)
      float radiusPx = clamp(baseSize * starMult + 2.2, 2.4, 150.0);
      vec2 clipCenter = aUvSizeLum.xy * 2.0 - 1.0;
      vec2 clipOffset = (aQuad * radiusPx * 2.0) / max(uViewport, vec2(1.0));

      gl_Position = vec4(clipCenter + clipOffset, 0.0, 1.0);
      vLocal = aQuad;
      vQuadPx = radiusPx;
      vLum = lum;
      vBv = aPhysId.x;
      vVmag = aPhysId.y;
      vSelected = isSelected;
      vIsHost = isHost;
    }
  `;

  const FS_STAR_1TO1 = `#version 300 es
    precision highp float;
    in vec2 vLocal;
    in float vQuadPx;
    in float vLum;
    in float vBv;
    in float vVmag;
    in float vSelected;
    in float vIsHost;

    uniform sampler2D uPlanckTex;
    uniform float uTime;

    out vec4 fragColor;

    float hash31(vec3 p) {
      p = fract(p * 0.1031);
      p += dot(p, p.zyx + 31.32);
      return fract((p.x + p.y) * p.z);
    }

    float noise3(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n000 = hash31(i);
      float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
      float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
      float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
      float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
      float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
      float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
      float n111 = hash31(i + vec3(1.0, 1.0, 1.0));
      return mix(
        mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
        mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
        f.z
      );
    }

    float fbm(vec3 p) {
      float sum = 0.0, amp = 0.5;
      for (int i = 0; i < 4; i++) {
        sum += amp * noise3(p);
        p = p * 2.08 + vec3(7.1, 13.7, 3.3);
        amp *= 0.5;
      }
      return sum;
    }

    void main() {
      float uSpec = clamp((vBv + 0.45) / 2.90, 0.0, 1.0);
      vec4 lut = texture(uPlanckTex, vec2(uSpec, 0.5));
      vec3 starRgb = lut.rgb;
      float tempK = clamp(lut.a * 42000.0, 2200.0, 42000.0);

      // Blend smoothly between crisp Airy PSF (small stars) and full 3D raycast photosphere
      float resolveMix = smoothstep(5.5, 16.0, vQuadPx);
      float rPix = length(vLocal);
      if (rPix > 1.0) discard;

      // 1. Optical Airy / Moffat PSF for sky-wide accuracy
      float rPsf = rPix * 2.4;
      float airy = pow(1.0 + rPsf * rPsf * 3.8, -2.4) + 0.08 * exp(-abs(rPsf - 1.15) * 7.0);
      float brightBoost = 0.72 + 1.15 * smoothstep(5.5, -1.5, vVmag);
      vec3 psfCol = mix(starRgb, vec3(1.0), 0.35 * airy) * airy * brightBoost * clamp(vLum * 1.25, 0.12, 2.5);
      float psfAlpha = clamp(airy * clamp(vLum * 1.35, 0.14, 1.0), 0.0, 1.0);

      // 2. 1:1 Raycast 3D Convective Photosphere + Von Zeipel + MHD Corona
      // Stellar disc fills inner 48% of quad; outer 48%..100% is MHD corona & flare filaments
      float discR = 0.46;
      // Von Zeipel rotational oblateness on fast hot rotators
      float oblate = smoothstep(6500.0, 16000.0, tempK) * 0.12;
      vec2 sp = vec2(vLocal.x, vLocal.y / (1.0 - oblate)) / discR;
      float spR2 = dot(sp, sp);

      vec3 sphereCol = vec3(0.0);
      float sphereAlpha = 0.0;

      if (spR2 <= 1.0) {
        float mu = sqrt(max(0.0, 1.0 - spR2));
        vec3 n = vec3(sp, mu);

        // Rotate surface slowly in 3D spherical coordinates
        float spin = uTime * mix(0.06, 0.22, smoothstep(4000.0, 12000.0, tempK));
        float cs = cos(spin), sn = sin(spin);
        vec3 nRot = vec3(n.x * cs + n.z * sn, n.y, -n.x * sn + n.z * cs);

        // Claret quadratic limb darkening (from T_eff)
        float tNorm = clamp((tempK - 3200.0) / 14000.0, 0.0, 1.0);
        float u1 = 0.72 - 0.34 * tNorm;
        float u2 = 0.14 + 0.14 * tNorm;
        float om = 1.0 - mu;
        float limb = clamp(1.0 - u1 * om - u2 * om * om, 0.08, 1.0);

        // Convective granulation: red dwarfs / supergiants have huge boiling convection cells
        float granScale = mix(11.5, 4.2, smoothstep(9500.0, 2600.0, tempK));
        float gNoise = fbm(nRot * granScale + vec3(uTime * 0.08));
        float granAmp = mix(0.08, 0.56, smoothstep(8500.0, 2600.0, tempK));
        float granules = 1.0 + (gNoise - 0.48) * granAmp;

        // Magnetic starspot complexes on convective K/M/G stars
        float spotField = fbm(nRot * 2.8 - vec3(uTime * 0.03));
        float spotMask = smoothstep(0.72, 0.85, spotField) * smoothstep(6600.0, 2500.0, tempK);
        float spotFactor = 1.0 - 0.55 * spotMask;

        // Von Zeipel hotter poles on rapid rotators
        float vz = 1.0 + 0.25 * oblate * n.y * n.y;
        float coreWhite = smoothstep(0.55, 1.0, mu) * 0.42 * brightBoost;

        sphereCol = mix(starRgb, vec3(1.0), coreWhite) * limb * granules * spotFactor * vz * (1.05 + 0.5 * brightBoost);
        // Antialiased photosphere limb edge
        float edgeAA = smoothstep(1.0, 0.92, sqrt(spR2));
        sphereAlpha = edgeAA;
      }

      // MHD Corona + Prominence Streamers around photosphere (r > discR)
      float rNorm = rPix / discR;
      float ang = atan(vLocal.y, vLocal.x);
      float streamer = fbm(vec3(cos(ang) * 2.5, sin(ang) * 2.5, uTime * 0.18 + rNorm * 2.0));
      float coronaFalloff = exp(-max(0.0, rNorm - 0.96) * 2.4) * smoothstep(2.15, 0.98, rNorm);
      float coronaWeight = (0.32 + 0.55 * streamer) * coronaFalloff;
      vec3 coronaRgb = mix(starRgb, vec3(1.0, 0.55, 0.35), smoothstep(4500.0, 2400.0, tempK) * 0.35);

      sphereCol += coronaRgb * coronaWeight * (0.75 + 0.45 * brightBoost);
      sphereAlpha = clamp(max(sphereAlpha, coronaWeight * 0.85), 0.0, 1.0);

      // Subtle golden/cyan reticle tick around selected star or Exoplanet Host
      if (vSelected > 0.5 || vIsHost > 0.5) {
        float ringDist = abs(rPix - 0.86);
        float dash = step(0.15, fract(ang * 2.546479));
        float reticle = smoothstep(0.025, 0.0, ringDist) * (vSelected > 0.5 ? 0.65 : 0.35 * dash);
        vec3 rCol = vSelected > 0.5 ? vec3(0.32, 0.72, 0.92) : vec3(0.96, 0.79, 0.37);
        sphereCol += rCol * reticle;
        sphereAlpha = max(sphereAlpha, reticle);
      }

      fragColor = mix(vec4(psfCol, psfAlpha), vec4(sphereCol, sphereAlpha), resolveMix);
    }
  `;

  const VS_PLANET_QUAD = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aQuad;
    uniform vec2 uCenterUv;
    uniform vec2 uBodySizeUv;
    out vec2 vQuad;
    void main() {
      vec2 ndc = uCenterUv * 2.0 - 1.0 + aQuad * uBodySizeUv * 2.0;
      gl_Position = vec4(ndc, 0.0, 1.0);
      vQuad = aQuad;
    }
  `;

  const FS_PLANET_QUAD = `#version 300 es
    precision highp float;
    in vec2 vQuad;
    uniform vec3 uColor;
    uniform vec2 uStarDir;
    uniform float uSelfLum;
    out vec4 fragColor;

    void main() {
      float r2 = dot(vQuad, vQuad);
      if (r2 > 1.0) discard;
      float z = sqrt(1.0 - r2);
      vec3 n = vec3(vQuad, z);
      vec3 l = normalize(vec3(uStarDir, 0.32));
      float ndl = max(0.0, dot(n, l));
      float limb = pow(z, 0.25);
      vec3 atmoRim = uColor * pow(1.0 - z, 2.2) * (0.35 + 0.65 * ndl);
      vec3 col = mix(uColor * (0.08 + 1.05 * ndl) * limb + atmoRim, uColor * 1.4 * limb, uSelfLum);
      float aa = smoothstep(1.0, 0.86, sqrt(r2));
      fragColor = vec4(col, aa);
    }
  `;

  const VS_ORBIT_LINE = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aPosNdc;
    void main() {
      gl_Position = vec4(aPosNdc, 0.0, 1.0);
    }
  `;

  const FS_ORBIT_LINE = `#version 300 es
    precision highp float;
    uniform vec4 uLineCol;
    out vec4 fragColor;
    void main() {
      fragColor = uLineCol;
    }
  `;

  class AeternaStarfield1to1 {
    constructor(srcCanvas, wasmUrl) {
      this.srcCanvas = srcCanvas;
      this.wasmUrl = wasmUrl || './engine/exodus_astrophysics_engine.wasm';
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'aeternaStars1to1Canvas';
      this.canvas.style.cssText = [
        'position:fixed',
        'inset:0',
        'width:100%',
        'height:100%',
        'pointer-events:none',
        'z-index:2'
      ].join(';');

      const parent = srcCanvas.parentElement || document.body;
      parent.insertBefore(this.canvas, srcCanvas.nextSibling);

      this.gl = this.canvas.getContext('webgl2', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: true,
        preserveDrawingBuffer: true
      });
      this.ok = false;
      this.enabled = true;
      this.showcaseBoost = 1.0; // 1.0 = auto adaptive zoom, 2.8 = all-star 1:1 resolved showcase
      this.wasm = null;
      this.hostsRegistered = false;
      this.maxStars = 16384;
      this.startMs = performance.now();

      if (this.gl) {
        this.initGL();
        this.loadRustWasm();
      }
    }

    async loadRustWasm() {
      try {
        const resp = await fetch(this.wasmUrl);
        if (!resp.ok) return;
        const { instance } = await WebAssembly.instantiate(await resp.arrayBuffer(), {});
        this.wasm = instance.exports;
        if (this.wasm.astro_generate_planck_lut && this.wasm.astro_planck_lut_ptr) {
          const len = this.wasm.astro_generate_planck_lut();
          const ptr = this.wasm.astro_planck_lut_ptr();
          const lutF32 = new Float32Array(this.wasm.memory.buffer, ptr, len * 4);
          this.uploadPlanckLut(lutF32, len);
        }
      } catch (_) {}
    }

    uploadPlanckLut(lutF32, len) {
      const gl = this.gl;
      if (!gl || !this.planckTex) return;
      const rgba8 = new Uint8Array(len * 4);
      for (let i = 0; i < len * 4; i++) {
        rgba8[i] = Math.max(0, Math.min(255, Math.round(lutF32[i] * 255)));
      }
      gl.bindTexture(gl.TEXTURE_2D, this.planckTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, len, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba8);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    compile(vsSrc, fsSrc) {
      const gl = this.gl;
      const mk = (t, s) => {
        const sh = gl.createShader(t);
        gl.shaderSource(sh, s);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          throw new Error(gl.getShaderInfoLog(sh));
        }
        return sh;
      };
      const p = gl.createProgram();
      gl.attachShader(p, mk(gl.VERTEX_SHADER, vsSrc));
      gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fsSrc));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p));
      }
      return p;
    }

    initGL() {
      const gl = this.gl;
      try {
        this.pStars = this.compile(VS_STAR_1TO1, FS_STAR_1TO1);
        this.pPlanet = this.compile(VS_PLANET_QUAD, FS_PLANET_QUAD);
        this.pOrbitLine = this.compile(VS_ORBIT_LINE, FS_ORBIT_LINE);

        this.uStars = {
          uViewport: gl.getUniformLocation(this.pStars, 'uViewport'),
          uFovDeg: gl.getUniformLocation(this.pStars, 'uFovDeg'),
          uResolveBoost: gl.getUniformLocation(this.pStars, 'uResolveBoost'),
          uPlanckTex: gl.getUniformLocation(this.pStars, 'uPlanckTex'),
          uTime: gl.getUniformLocation(this.pStars, 'uTime')
        };
        this.uPlanet = {
          uCenterUv: gl.getUniformLocation(this.pPlanet, 'uCenterUv'),
          uBodySizeUv: gl.getUniformLocation(this.pPlanet, 'uBodySizeUv'),
          uColor: gl.getUniformLocation(this.pPlanet, 'uColor'),
          uStarDir: gl.getUniformLocation(this.pPlanet, 'uStarDir'),
          uSelfLum: gl.getUniformLocation(this.pPlanet, 'uSelfLum')
        };
        this.uOrbit = {
          uLineCol: gl.getUniformLocation(this.pOrbitLine, 'uLineCol')
        };

        // Fallback procedural Planck LUT until Rust WASM finishes (~2ms)
        this.planckTex = gl.createTexture();
        const fallback = new Float32Array(256 * 4);
        for (let i = 0; i < 256; i++) {
          const t = i / 255;
          fallback[i * 4 + 0] = Math.min(1, 0.58 + 0.55 * t);
          fallback[i * 4 + 1] = Math.min(1, 0.72 + 0.28 * Math.sin(t * 2.2) - 0.35 * Math.max(0, t - 0.55));
          fallback[i * 4 + 2] = Math.max(0.12, 1.0 - 0.88 * Math.pow(t, 1.1));
          fallback[i * 4 + 3] = (0.75 * Math.exp(-t * 2.4) + 0.06);
        }
        this.uploadPlanckLut(fallback, 256);

        // Instanced star VAO
        this.starVao = gl.createVertexArray();
        gl.bindVertexArray(this.starVao);
        const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        this.quadVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVbo);
        gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        this.instVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instVbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.maxStars * 8 * 4, gl.DYNAMIC_DRAW);

        // Stride = 8 * 4 = 32 bytes
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);
        gl.vertexAttribDivisor(1, 1);

        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);
        gl.vertexAttribDivisor(2, 1);

        // Planet quad VAO
        this.planetVao = gl.createVertexArray();
        gl.bindVertexArray(this.planetVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVbo);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // Orbit ellipse VAO
        this.orbitVao = gl.createVertexArray();
        gl.bindVertexArray(this.orbitVao);
        this.orbitVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.orbitVbo);
        gl.bufferData(gl.ARRAY_BUFFER, 96 * 2 * 4, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
        this.ok = true;
      } catch (err) {
        console.warn('AeternaStarfield1to1 init failed:', err);
        this.ok = false;
      }
    }

    registerDeepHosts(stel) {
      if (this.hostsRegistered || !stel || typeof stel._swe_register_deep_star !== 'function') return;
      this.hostsRegistered = true;
      const fn = stel.cwrap('swe_register_deep_star', 'number', [
        'number', 'number', 'number', 'number', 'number', 'number', 'number', 'number', 'string', 'string'
      ]);
      EXOPLANET_SYSTEMS.forEach((sys) => {
        if (sys.hostId > 0) {
          fn(
            sys.raDeg, sys.decDeg, sys.plxMas, sys.pmRaMas, sys.pmDecMas,
            sys.vmag, sys.bv, sys.hostId, sys.name, sys.sp
          );
        }
      });
    }

    solveOrbit(aNorm, ecc, incRad, phase0, periodDays, tDays) {
      if (this.wasm && this.wasm.astro_solve_kepler_orbit && this.wasm.astro_orbit_out_ptr) {
        this.wasm.astro_solve_kepler_orbit(aNorm, ecc, incRad, 0.35, 0.15, phase0, periodDays, tDays);
        const o = new Float32Array(this.wasm.memory.buffer, this.wasm.astro_orbit_out_ptr(), 4);
        return [o[0], o[1], o[2], o[3]];
      }
      const m = phase0 + (2 * Math.PI / Math.max(0.05, periodDays)) * tDays;
      const x = aNorm * Math.cos(m);
      const y = aNorm * Math.sin(m) * Math.cos(incRad);
      return [x, y, Math.sin(m) * Math.sin(incRad), 0.75];
    }

    syncCMode(stel) {
      if (stel && typeof stel._swe_set_star_1to1_mode === 'function') {
        stel._swe_set_star_1to1_mode(this.ok && this.enabled ? 1 : 0);
      }
    }

    setEnabled(val) {
      this.enabled = !!val;
      this.canvas.style.display = this.enabled ? 'block' : 'none';
    }

    setShowcaseBoost(boost) {
      this.showcaseBoost = boost;
    }

    render(stel, cssW, cssH, dpr) {
      if (!this.ok || !stel) return;
      this.registerDeepHosts(stel);
      this.syncCMode(stel);

      if (!this.enabled) return;

      const gl = this.gl;
      const fbW = Math.max(2, Math.round(cssW * dpr));
      const fbH = Math.max(2, Math.round(cssH * dpr));
      if (this.canvas.width !== fbW || this.canvas.height !== fbH) {
        this.canvas.width = fbW;
        this.canvas.height = fbH;
      }

      gl.viewport(0, 0, fbW, fbH);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (typeof stel._swe_get_star_stream_count !== 'function') return;
      const count = Math.min(this.maxStars, stel._swe_get_star_stream_count());
      if (count <= 0) return;

      const ptr = stel._swe_get_star_stream_ptr();
      const fovRad = typeof stel._swe_get_star_stream_fov === 'function' ? stel._swe_get_star_stream_fov() : 1.0472;
      const fovDeg = (fovRad * 180) / Math.PI;
      const streamView = new Float32Array(stel.HEAPF32.buffer, ptr, count * 8);

      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      // Pass 1: Draw ALL visible stars at exact C/ERFA projected coordinates via 1 instanced draw call
      gl.useProgram(this.pStars);
      gl.uniform2f(this.uStars.uViewport, cssW, cssH);
      gl.uniform1f(this.uStars.uFovDeg, fovDeg);
      gl.uniform1f(this.uStars.uResolveBoost, this.showcaseBoost);
      gl.uniform1f(this.uStars.uTime, (performance.now() - this.startMs) * 0.001);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.planckTex);
      gl.uniform1i(this.uStars.uPlanckTex, 0);

      gl.bindVertexArray(this.starVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, streamView);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);

      // Pass 2: Render Keplerian Exoplanet & Binary Orbits around focused/zoomed host stars in view
      const drawOrbitsForSelectedOnly = fovDeg > 22.0 && this.showcaseBoost <= 1.2;
      const orbitScalePx = Math.min(26, Math.max(8, (22.0 / Math.max(fovDeg, 0.08)) * 5.0 * (this.showcaseBoost > 1.2 ? 1.5 : 1.0)));
      const tDays = (stel.observer ? stel.observer.utc : 60000) * 1.0 + (performance.now() - this.startMs) * 0.0008;
      const segs = 72;
      const ringVerts = new Float32Array(segs * 2);

      for (let i = 0; i < count; i++) {
        const base = i * 8;
        const signedId = streamView[base + 7];
        const isSel = signedId < 0;
        const rawId = Math.round(isSel ? (-signedId - 1) : signedId);
        if (rawId <= 0) continue;
        if (drawOrbitsForSelectedOnly && !isSel && rawId < 100000) continue;

        const sys = EXOPLANET_SYSTEMS.find((s) => (s.hostId && s.hostId === rawId) || (s.matchHip && s.matchHip === rawId));
        if (!sys || !sys.planets || sys.planets.length === 0) continue;

        const cx = streamView[base];
        const cy = streamView[base + 1];
        const incRad = (sys.incDeg * Math.PI) / 180;
        const pxScale = isSel ? Math.max(orbitScalePx, 19) : orbitScalePx;

        // Draw delicate Keplerian orbital ellipses
        gl.useProgram(this.pOrbitLine);
        gl.bindVertexArray(this.orbitVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.orbitVbo);

        sys.planets.forEach((pl) => {
          for (let k = 0; k < segs; k++) {
            const o = this.solveOrbit(pl.a, pl.ecc, incRad, pl.phase0, pl.P, (k / segs) * pl.P);
            ringVerts[k * 2] = (cx + (o[0] * pxScale) / cssW) * 2 - 1;
            ringVerts[k * 2 + 1] = (cy + (o[1] * pxScale) / cssH) * 2 - 1;
          }
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, ringVerts);
          gl.uniform4f(this.uOrbit.uLineCol, pl.col[0], pl.col[1], pl.col[2], isSel ? 0.38 : 0.24);
          gl.drawArrays(gl.LINE_LOOP, 0, segs);
        });

        // Draw orbiting exoplanet / companion spheres
        gl.useProgram(this.pPlanet);
        gl.bindVertexArray(this.planetVao);
        sys.planets.forEach((pl) => {
          const o = this.solveOrbit(pl.a, pl.ecc, incRad, pl.phase0, pl.P, tDays);
          const oxPx = o[0] * pxScale;
          const oyPx = o[1] * pxScale;
          const rPx = Math.max(2.6, pl.r * pxScale * 2.2);
          gl.uniform2f(this.uPlanet.uCenterUv, cx + oxPx / cssW, cy + oyPx / cssH);
          gl.uniform2f(this.uPlanet.uBodySizeUv, rPx / cssW, rPx / cssH);
          gl.uniform3fv(this.uPlanet.uColor, pl.col);
          const len = Math.hypot(oxPx, oyPx) || 1;
          gl.uniform2f(this.uPlanet.uStarDir, -oxPx / len, -oyPx / len);
          gl.uniform1f(this.uPlanet.uSelfLum, pl.selfLum ? 1.0 : 0.0);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
      }

      gl.bindVertexArray(null);
    }
  }

  global.AeternaStarfield1to1 = AeternaStarfield1to1;
})(window);
