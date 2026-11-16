/* ============================================================================
 * AETERNA HDR ASTROPHOTOGRAPHY POST-FX ENGINE (WebGL2 Multi-Pass)
 * Adapted from Millennium 8K Studio (AETERNA_8K_WEB_SHOWCASE.html):
 *  - RGBA16F / RGBA8 Half-Float Luminance Threshold Extract
 *  - Separable 9-Tap Gaussian Anamorphic Bloom (H + V + Wide Pass)
 *  - 4-Spoke Telescope Spider-Vane Diffraction Spikes on Sub-1 Mag Stars
 *  - ACES Filmic Highlight Curve + High-Resolution Composite PNG Capture
 * ============================================================================ */
(function (global) {
  'use strict';

  const VS_FULLSCREEN = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aPos;
    out vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  // Pass 1: Extract bright stars/planets/nebula core luminance + 4-spoke diffraction seed
  const FS_EXTRACT = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uSrc;
    uniform vec2 uTexel;
    uniform float uThreshold;
    uniform float uDiffraction;

    void main() {
      vec3 c = texture(uSrc, vUv).rgb;
      float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float soft = max(lum - uThreshold, 0.0);
      vec3 bloom = (lum > 1e-4) ? c * (soft / lum) * 1.45 : vec3(0.0);

      // Telescope Newtonian/JWST 4-spoke diagonal diffraction spikes sampled from bright point peaks
      if (uDiffraction > 0.01) {
        vec3 spike = vec3(0.0);
        for (int i = 1; i <= 5; i++) {
          float stepR = float(i) * 2.4;
          float w = (1.0 - float(i) / 6.2) * 0.24;
          vec2 d1 = vec2(stepR, stepR) * uTexel;
          vec2 d2 = vec2(stepR, -stepR) * uTexel;
          vec3 s1 = texture(uSrc, vUv + d1).rgb;
          vec3 s2 = texture(uSrc, vUv - d1).rgb;
          vec3 s3 = texture(uSrc, vUv + d2).rgb;
          vec3 s4 = texture(uSrc, vUv - d2).rgb;
          float t1 = smoothstep(0.76, 1.0, dot(s1, vec3(0.299, 0.587, 0.114)));
          float t2 = smoothstep(0.76, 1.0, dot(s2, vec3(0.299, 0.587, 0.114)));
          float t3 = smoothstep(0.76, 1.0, dot(s3, vec3(0.299, 0.587, 0.114)));
          float t4 = smoothstep(0.76, 1.0, dot(s4, vec3(0.299, 0.587, 0.114)));
          spike += (s1 * t1 + s2 * t2 + s3 * t3 + s4 * t4) * w;
        }
        bloom += spike * uDiffraction;
      }

      fragColor = vec4(bloom, 1.0);
    }
  `;

  // Pass 2 & 3: Separable 9-tap Gaussian Blur (Exact Millennium Coefficients)
  const FS_BLUR = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTex;
    uniform vec2 uDir;
    const float w0 = 0.2270270270;
    const float w1 = 0.1945945946;
    const float w2 = 0.1216216216;
    const float w3 = 0.0540540541;
    const float w4 = 0.0162162162;

    void main() {
      vec3 res = texture(uTex, vUv).rgb * w0;
      res += texture(uTex, vUv + uDir * 1.0).rgb * w1;
      res += texture(uTex, vUv - uDir * 1.0).rgb * w1;
      res += texture(uTex, vUv + uDir * 2.0).rgb * w2;
      res += texture(uTex, vUv - uDir * 2.0).rgb * w2;
      res += texture(uTex, vUv + uDir * 3.0).rgb * w3;
      res += texture(uTex, vUv - uDir * 3.0).rgb * w3;
      res += texture(uTex, vUv + uDir * 4.0).rgb * w4;
      res += texture(uTex, vUv - uDir * 4.0).rgb * w4;
      fragColor = vec4(res, 1.0);
    }
  `;

  // Pass 4: ACES Filmic Bloom + Natural Milky Way Airglow Sheen Composite
  const FS_COMPOSITE = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uBloomNarrow;
    uniform sampler2D uBloomWide;
    uniform float uBloomStrength;

    vec3 acesFilmic(vec3 x) {
      return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
    }

    void main() {
      vec3 tight = texture(uBloomNarrow, vUv).rgb;
      vec3 wide = texture(uBloomWide, vUv).rgb;
      vec3 glow = (tight * 0.68 + wide * 0.48) * uBloomStrength;
      vec3 mapped = acesFilmic(glow);
      fragColor = vec4(mapped, 1.0);
    }
  `;

  class AeternaHdrPostFx {
    constructor(srcCanvas, fxCanvas) {
      this.srcCanvas = srcCanvas;
      this.fxCanvas = fxCanvas;
      this.enabled = true;
      this.bloomStrength = 0.42;
      this.threshold = 0.56;
      this.diffractionStrength = 0.65;

      this.gl = null;
      this.ok = false;
      this.w = 0;
      this.h = 0;
      this.initGL();
    }

    compile(type, src) {
      const gl = this.gl;
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh) || 'Shader compile error');
      }
      return sh;
    }

    link(fsSrc) {
      const gl = this.gl;
      const p = gl.createProgram();
      gl.attachShader(p, this.vs);
      gl.attachShader(p, this.compile(gl.FRAGMENT_SHADER, fsSrc));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p) || 'Program link error');
      }
      return p;
    }

    makeFbo(w, h) {
      const gl = this.gl;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFmt, w, h, 0, gl.RGBA, this.pixelType, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fbo, w, h };
    }

    initGL() {
      try {
        const gl = this.fxCanvas.getContext('webgl2', {
          alpha: true,
          premultipliedAlpha: false,
          antialias: false,
          preserveDrawingBuffer: true
        });
        if (!gl) return;
        this.gl = gl;

        const hasFloat = !!gl.getExtension('EXT_color_buffer_float');
        this.internalFmt = hasFloat ? gl.RGBA16F : gl.RGBA8;
        this.pixelType = hasFloat ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
        this.isHdrFloat = hasFloat;

        this.vs = this.compile(gl.VERTEX_SHADER, VS_FULLSCREEN);
        this.pExtract = this.link(FS_EXTRACT);
        this.pBlur = this.link(FS_BLUR);
        this.pComp = this.link(FS_COMPOSITE);

        this.uExtract = {
          uSrc: gl.getUniformLocation(this.pExtract, 'uSrc'),
          uTexel: gl.getUniformLocation(this.pExtract, 'uTexel'),
          uThreshold: gl.getUniformLocation(this.pExtract, 'uThreshold'),
          uDiffraction: gl.getUniformLocation(this.pExtract, 'uDiffraction')
        };
        this.uBlur = {
          uTex: gl.getUniformLocation(this.pBlur, 'uTex'),
          uDir: gl.getUniformLocation(this.pBlur, 'uDir')
        };
        this.uComp = {
          uBloomNarrow: gl.getUniformLocation(this.pComp, 'uBloomNarrow'),
          uBloomWide: gl.getUniformLocation(this.pComp, 'uBloomWide'),
          uBloomStrength: gl.getUniformLocation(this.pComp, 'uBloomStrength')
        };

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        this.srcTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        this.fbos = null;
        this.ok = true;
      } catch (_) {
        this.ok = false;
      }
    }

    ensureTargets(srcW, srcH) {
      const gl = this.gl;
      const halfW = Math.max(128, Math.floor(srcW * 0.5));
      const halfH = Math.max(128, Math.floor(srcH * 0.5));
      const qtrW = Math.max(64, Math.floor(srcW * 0.25));
      const qtrH = Math.max(64, Math.floor(srcH * 0.25));

      if (this.fbos && this.w === srcW && this.h === srcH) return;
      this.w = srcW;
      this.h = srcH;
      this.fxCanvas.width = srcW;
      this.fxCanvas.height = srcH;

      if (this.fbos) {
        [this.fbos.halfA, this.fbos.halfB, this.fbos.qtrA, this.fbos.qtrB].forEach((f) => {
          gl.deleteTexture(f.tex);
          gl.deleteFramebuffer(f.fbo);
        });
      }

      this.fbos = {
        halfA: this.makeFbo(halfW, halfH),
        halfB: this.makeFbo(halfW, halfH),
        qtrA: this.makeFbo(qtrW, qtrH),
        qtrB: this.makeFbo(qtrW, qtrH)
      };
    }

    render() {
      if (!this.ok || !this.srcCanvas.width || !this.srcCanvas.height) return;
      const gl = this.gl;

      if (!this.enabled || this.bloomStrength <= 0.01) {
        if (this.w !== 0) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          gl.viewport(0, 0, this.fxCanvas.width, this.fxCanvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        return;
      }

      this.ensureTargets(this.srcCanvas.width, this.srcCanvas.height);
      const { halfA, halfB, qtrA, qtrB } = this.fbos;

      gl.bindVertexArray(this.vao);

      // Upload latest Stellarium WebGL2 backbuffer directly on GPU
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.srcCanvas);

      // Pass 1: Extract HDR highlights + diffraction spider spikes -> halfA
      gl.bindFramebuffer(gl.FRAMEBUFFER, halfA.fbo);
      gl.viewport(0, 0, halfA.w, halfA.h);
      gl.useProgram(this.pExtract);
      gl.uniform1i(this.uExtract.uSrc, 0);
      gl.uniform2f(this.uExtract.uTexel, 1 / this.w, 1 / this.h);
      gl.uniform1f(this.uExtract.uThreshold, this.threshold);
      gl.uniform1f(this.uExtract.uDiffraction, this.diffractionStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Pass 2: Tight Separable Gaussian Blur H -> halfB, V -> halfA
      gl.useProgram(this.pBlur);
      gl.bindFramebuffer(gl.FRAMEBUFFER, halfB.fbo);
      gl.viewport(0, 0, halfB.w, halfB.h);
      gl.bindTexture(gl.TEXTURE_2D, halfA.tex);
      gl.uniform1i(this.uBlur.uTex, 0);
      gl.uniform2f(this.uBlur.uDir, 1.35 / halfA.w, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.bindFramebuffer(gl.FRAMEBUFFER, halfA.fbo);
      gl.bindTexture(gl.TEXTURE_2D, halfB.tex);
      gl.uniform2f(this.uBlur.uDir, 0, 1.35 / halfB.h);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Pass 3: Wide Atmospheric Airglow Gaussian Blur H -> qtrB, V -> qtrA
      gl.bindFramebuffer(gl.FRAMEBUFFER, qtrB.fbo);
      gl.viewport(0, 0, qtrB.w, qtrB.h);
      gl.bindTexture(gl.TEXTURE_2D, halfA.tex);
      gl.uniform2f(this.uBlur.uDir, 2.8 / qtrB.w, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      gl.bindFramebuffer(gl.FRAMEBUFFER, qtrA.fbo);
      gl.bindTexture(gl.TEXTURE_2D, qtrB.tex);
      gl.uniform2f(this.uBlur.uDir, 0, 2.8 / qtrA.h);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Pass 4: ACES Filmic Final Composite -> Default Screen-Blended Overlay
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.w, this.h);
      gl.useProgram(this.pComp);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, halfA.tex);
      gl.uniform1i(this.uComp.uBloomNarrow, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, qtrA.tex);
      gl.uniform1i(this.uComp.uBloomWide, 1);
      gl.uniform1f(this.uComp.uBloomStrength, this.bloomStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    captureCompositePNG(filename) {
      const w = this.srcCanvas.width || window.innerWidth;
      const h = this.srcCanvas.height || window.innerHeight;
      const out = document.createElement('canvas');
      out.width = w;
      out.height = h;
      const ctx = out.getContext('2d');
      ctx.drawImage(this.srcCanvas, 0, 0, w, h);
      if (this.ok && this.enabled && this.bloomStrength > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(this.fxCanvas, 0, 0, w, h);
        ctx.restore();
      }
      const link = document.createElement('a');
      link.download = filename || `stellarium-ultra-${Date.now()}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
    }
  }

  global.AeternaHdrPostFx = AeternaHdrPostFx;
})(window);
