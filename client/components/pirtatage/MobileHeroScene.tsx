import { useRef, useEffect, useMemo } from "react";

export type MobileHeroSceneProps = {
  fill?: boolean;
};

const MobileHeroScene = ({ fill }: MobileHeroSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const matricesRef = useRef<{ projection: Float32Array; view: Float32Array; model: Float32Array }>({
    projection: new Float32Array(16),
    view: new Float32Array(16),
    model: new Float32Array(16),
  });

  // Matrix utilities
  const matrixOps = useMemo(() => ({
    identity: (m: Float32Array) => {
      m[0] = 1; m[4] = 0; m[8] = 0; m[12] = 0;
      m[1] = 0; m[5] = 1; m[9] = 0; m[13] = 0;
      m[2] = 0; m[6] = 0; m[10] = 1; m[14] = 0;
      m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
    },
    perspective: (m: Float32Array, fov: number, aspect: number, near: number, far: number) => {
      const f = 1 / Math.tan(fov / 2);
      const nf = 1 / (near - far);
      m[0] = f / aspect; m[4] = 0; m[8] = 0; m[12] = 0;
      m[1] = 0; m[5] = f; m[9] = 0; m[13] = 0;
      m[2] = 0; m[6] = 0; m[10] = (far + near) * nf; m[14] = 2 * far * near * nf;
      m[3] = 0; m[7] = 0; m[11] = -1; m[15] = 0;
    },
    multiply: (out: Float32Array, a: Float32Array, b: Float32Array) => {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          out[i * 4 + j] = 0;
          for (let k = 0; k < 4; k++) {
            out[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
          }
        }
      }
    },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      desynchronized: true
    }) as WebGLRenderingContext | null;

    if (!gl) {
      console.warn('WebGL not supported on this mobile device');
      return;
    }
    glRef.current = gl;

    // Resize canvas
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // Disable depth testing for 2D shaders
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Randomly select an effect on each visit (20 total effects)
    const randomEffect = Math.floor(Math.random() * 20);
    console.log('Selected effect:', randomEffect);

    // Vertex shader
    const vertexShaderSource = `
      precision mediump float;
      attribute vec2 position;
      varying vec2 vUv;
      
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader variations - Enhanced intense effects for mobile
    const fragmentShaders = [
      // Effect 0: Void Tendrils (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        vec3 col = vec3(0.0);
        for(float i = 0.0; i < 8.0; i++) {
          float angle = i * 0.785 + time * 0.5;
          vec2 dir = vec2(cos(angle), sin(angle));
          float tentacle = sin(dot(p, dir) * 12.0 - time * 3.0) * 0.5 + 0.5;
          tentacle = pow(tentacle, 3.0);
          float glow = tentacle / (1.0 + length(p - dir * 0.4) * 2.0);
          col += vec3(0.5, 0.0, 0.8) * glow * 0.8 + vec3(0.9, 0.2, 1.0) * pow(glow, 2.0) * 0.6;
        }
        col *= 1.0 - length(p) * 0.2;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 1: Obsidian Veins (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 p = vUv * 10.0;
        vec2 id = floor(p), gv = fract(p) - 0.5;
        float cracks = 0.0;
        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y));
            float h = hash(id + offset);
            vec2 point = offset + sin(h * 6.28 + time * 0.8) * 0.4;
            cracks += 0.04 / length(gv - point);
          }
        }
        cracks = min(cracks, 1.5);
        vec3 col = mix(vec3(0.0, 0.0, 0.02), vec3(0.08, 0.08, 0.12), cracks * 0.5);
        vec3 glow = mix(vec3(0.7, 0.0, 1.0), vec3(0.0, 0.8, 1.0), sin(time + length(p)) * 0.5 + 0.5);
        col += glow * smoothstep(0.1, 0.6, cracks) * 0.7;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 2: Dark Matter Waves (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float dist = length(p);
        float ripple1 = sin(dist * 18.0 - time * 3.0) * 0.5 + 0.5;
        float ripple2 = sin(dist * 12.0 - time * 2.0 + 3.14) * 0.5 + 0.5;
        float waves = pow(ripple1 * ripple2, 2.0);
        vec3 col = vec3(0.0) + vec3(0.25, 0.0, 0.4) * waves * 0.9 + vec3(0.7, 0.2, 1.0) * waves * smoothstep(0.7, 1.0, waves) * 0.8;
        col *= 1.0 - dist * 0.3;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 3: Shadow Lattice (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 grid = fract(vUv * 18.0);
        float lines = min(smoothstep(0.08, 0.0, abs(grid.x - 0.5)), smoothstep(0.08, 0.0, abs(grid.y - 0.5)));
        vec2 cell = floor(vUv * 18.0);
        float h = hash(cell);
        float pulse = step(0.95, sin(time * 4.0 + h * 6.28) * 0.5 + 0.5) * step(h, 0.15);
        vec3 col = vec3(0.0, 0.0, 0.03) + vec3(0.6, 0.0, 0.9) * lines * 0.4 + vec3(1.0, 0.8, 1.0) * pulse * 1.0;
        col *= 1.0 - length(vUv - 0.5) * 0.6;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 4: Abyssal Smoke (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float noise(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float smoke = 0.0;
        for(float i = 0.0; i < 6.0; i++) {
          vec2 offset = vec2(sin(time * 0.5 + i), cos(time * 0.4 + i)) * 0.6;
          smoke += noise(p * (2.5 + i) + offset + time * 0.2) / (i + 1.0);
        }
        smoke = smoothstep(0.2, 0.8, smoke);
        vec3 col = mix(vec3(0.0), vec3(0.15, 0.12, 0.2), smoke * 0.8);
        col = mix(col, vec3(0.5, 0.2, 0.8), smoke * smoothstep(0.5, 1.0, smoke) * 0.7);
        col *= 1.0 - length(p) * 0.3;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 5: Midnight Prism (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float angle = atan(p.y, p.x), radius = length(p);
        float prism = pow(abs(sin(angle * 8.0 + time * 0.8) * sin(radius * 12.0 - time * 1.5)), 1.5);
        vec3 col = vec3(0.0) + vec3(0.4, 0.0, 0.7) * prism * 0.8;
        col = mix(col, vec3(0.6, 0.2, 0.9), prism * 0.6) + vec3(0.2, 0.6, 0.9) * smoothstep(0.7, 1.0, prism) * 0.6;
        col *= 1.0 - radius * 0.2;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 6: Phantom Circuit (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 grid = floor(vUv * 25.0), gv = fract(vUv * 25.0);
        float h = hash(grid), circuit = 0.0;
        if(h > 0.6) circuit = smoothstep(0.12, 0.0, abs(gv.x - 0.5));
        else if(h > 0.3) circuit = smoothstep(0.12, 0.0, abs(gv.y - 0.5));
        float pulse = sin(time * 3.0 + h * 6.28) * 0.5 + 0.5;
        float node = smoothstep(0.18, 0.0, length(gv - 0.5));
        vec3 col = vec3(0.0) + vec3(0.0, 0.08, 0.25) * circuit * 0.5 + vec3(0.2, 0.7, 1.0) * circuit * pulse * 0.8 + vec3(0.8, 1.0, 1.0) * node * pulse * 1.0;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 7: Eclipse Halo (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float dist = length(p);
        float eclipse = smoothstep(0.55, 0.6, dist) * smoothstep(0.85, 0.75, dist);
        float corona = 1.2 / (1.0 + abs(dist - 0.7) * 25.0);
        float flare = pow(sin(atan(p.y, p.x) * 12.0 + time * 1.5) * 0.5 + 0.5, 2.0) * eclipse;
        vec3 col = vec3(0.0) + vec3(0.5, 0.0, 0.8) * eclipse * 0.9 + vec3(1.0, 0.2, 0.9) * corona * 0.8 + vec3(1.0, 1.0, 1.0) * flare * 0.6;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 8: Starfield Warp (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        vec3 col = vec3(0.0);
        float speed = time * 0.8;
        for(float i = 0.0; i < 60.0; i++) {
          vec2 starPos = vec2(hash(vec2(i, 0.0)), hash(vec2(i, 1.0))) * 2.0 - 1.0;
          vec2 dir = normalize(starPos);
          float warp = fract(length(starPos) - speed + hash(vec2(i)) * 2.0);
          vec2 pos = dir * warp * 1.8;
          float size = mix(0.003, 0.012, warp);
          float star = smoothstep(size, 0.0, length(p - pos));
          float trail = smoothstep(0.015, 0.0, length(p - pos * 0.85)) * (1.0 - warp);
          col += vec3(1.0, 0.9, 1.0) * star * 1.2 + vec3(0.5, 0.6, 1.0) * trail * 0.6;
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 9: Glitch Matrix (Enhanced)
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        float glitchTime = floor(time * 12.0);
        vec2 glitchUv = vUv;
        if(hash(vec2(glitchTime, floor(vUv.y * 25.0))) > 0.85) glitchUv.x += (hash(vec2(glitchTime)) - 0.5) * 0.15;
        vec2 grid = floor(glitchUv * vec2(50.0, 30.0));
        float h = hash(grid + vec2(glitchTime * 0.15));
        float char = step(0.5, h);
        float glow = h * step(0.75, h);
        vec3 col = vec3(0.0) + vec3(0.3, 0.0, 0.5) * char * 0.25 + mix(vec3(0.9, 0.2, 1.0), vec3(0.2, 1.0, 1.0), h) * glow * 0.9;
        col *= sin(vUv.y * 250.0 + time * 8.0) * 0.05 + 0.95;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 10: Liquid Metal
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 p = vUv * 3.0;
        float liquid = 0.0;
        for(float i = 0.0; i < 4.0; i++) {
          vec2 offset = vec2(sin(time * 0.3 + i), cos(time * 0.25 + i * 1.5)) * 2.0;
          liquid += sin(length(p + offset) * 3.0 - time * 2.0) * 0.5 + 0.5;
        }
        liquid = liquid / 4.0;
        vec3 col = mix(vec3(0.6, 0.6, 0.7), vec3(0.9, 0.9, 1.0), liquid);
        col = mix(col, vec3(0.4, 0.3, 0.6), smoothstep(0.4, 0.6, liquid)) + vec3(1.0) * pow(liquid, 8.0) * 0.8;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 11: Neural Network
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 grid = floor(vUv * 12.0);
        vec3 col = vec3(0.0);
        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 neighbor = grid + vec2(float(x), float(y));
            float h = hash(neighbor);
            if(h > 0.7) {
              vec2 nodePos = (neighbor + 0.5) / 12.0;
              float dist = length(vUv - nodePos);
              float node = smoothstep(0.025, 0.0, dist);
              float pulse = sin(time * 2.0 + h * 6.28) * 0.5 + 0.5;
              col += vec3(0.0, 0.8, 1.0) * node * pulse;
              vec2 toNode = vUv - nodePos;
              float connection = exp(-dist * 15.0) * smoothstep(0.002, 0.0, abs(length(toNode) - fract(time * 0.5 + h) * 0.3));
              col += vec3(0.0, 0.5, 0.8) * connection * 0.5;
            }
          }
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 12: Aurora Borealis
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float noise(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 p = vUv;
        float aurora = 0.0;
        for(float i = 0.0; i < 5.0; i++) {
          float wave = sin(p.x * 8.0 + i + time * 0.5) * 0.1;
          aurora += smoothstep(0.15, 0.0, abs(p.y - 0.5 - wave)) / (i + 1.0);
        }
        vec3 col1 = vec3(0.0, 0.8, 0.6);
        vec3 col2 = vec3(0.4, 0.0, 0.8);
        vec3 col3 = vec3(0.0, 0.6, 1.0);
        vec3 col = mix(col1, col2, sin(time * 0.5 + vUv.x * 3.0) * 0.5 + 0.5);
        col = mix(col, col3, sin(time * 0.3 + vUv.x * 5.0) * 0.5 + 0.5);
        col *= aurora * 2.0;
        col += vec3(1.0) * pow(aurora, 3.0) * 0.5;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 13: Cyber Rain
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 grid = vec2(floor(vUv.x * 40.0), 0.0);
        float h = hash(grid);
        float speed = 0.3 + h * 0.4;
        float yPos = fract(vUv.y - time * speed + h);
        float trail = smoothstep(0.0, 0.15, yPos) * smoothstep(0.3, 0.15, yPos);
        float head = smoothstep(0.02, 0.0, abs(yPos - 0.15));
        vec3 col = vec3(0.0, 1.0, 0.6) * trail * 0.4 + vec3(0.5, 1.0, 0.8) * head;
        float flicker = step(0.5, hash(grid + floor(time * 10.0)));
        col *= flicker;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 14: Nebula Cloud
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        vec2 p = vUv * 4.0;
        float n = 0.0;
        for(float i = 1.0; i < 6.0; i++) {
          n += noise(p * i + time * 0.1) / i;
        }
        vec3 col1 = vec3(0.6, 0.0, 0.8);
        vec3 col2 = vec3(0.0, 0.3, 0.9);
        vec3 col3 = vec3(0.8, 0.1, 0.5);
        vec3 col = mix(col1, col2, n);
        col = mix(col, col3, smoothstep(0.4, 0.7, n));
        col *= smoothstep(0.0, 0.3, n) * 1.2;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 15: Holographic Interference
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      void main() {
        vec2 p = vUv * 20.0;
        float pattern = sin(p.x * 3.14159) * sin(p.y * 3.14159);
        pattern += sin((p.x + p.y) * 3.14159 + time * 2.0) * 0.5;
        pattern += sin((p.x - p.y) * 3.14159 - time * 1.5) * 0.5;
        pattern = abs(pattern);
        vec3 col = vec3(0.0);
        col += vec3(0.0, 0.8, 1.0) * smoothstep(0.5, 1.0, pattern);
        col += vec3(0.8, 0.0, 1.0) * smoothstep(1.0, 1.5, pattern);
        col += vec3(1.0, 0.8, 0.0) * smoothstep(1.5, 2.0, pattern);
        float scanline = sin(vUv.y * 100.0 + time * 5.0) * 0.05 + 0.95;
        col *= scanline;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 16: DNA Helix
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float angle = atan(p.y, p.x) + time * 0.5;
        float radius = length(p);
        float helix1 = sin(angle * 6.0 + vUv.y * 15.0 - time * 2.0) * 0.2 + 0.4;
        float helix2 = sin(angle * 6.0 + vUv.y * 15.0 - time * 2.0 + 3.14159) * 0.2 + 0.4;
        float strand1 = smoothstep(0.05, 0.0, abs(radius - helix1));
        float strand2 = smoothstep(0.05, 0.0, abs(radius - helix2));
        float bonds = smoothstep(0.015, 0.0, abs(sin(vUv.y * 15.0 - time * 2.0))) * smoothstep(0.6, 0.4, radius) * 0.5;
        vec3 col = vec3(0.0, 0.8, 1.0) * strand1 + vec3(1.0, 0.2, 0.6) * strand2 + vec3(0.5, 1.0, 0.5) * bonds;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 17: Quantum Foam
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 p = vUv * 15.0;
        vec3 col = vec3(0.0);
        for(float i = 0.0; i < 30.0; i++) {
          vec2 bubblePos = vec2(hash(vec2(i, 0.0)), hash(vec2(i, 1.0)));
          bubblePos += vec2(sin(time * 0.5 + i), cos(time * 0.3 + i)) * 0.3;
          bubblePos *= 15.0;
          float dist = length(p - bubblePos);
          float size = 0.2 + hash(vec2(i)) * 0.3;
          float bubble = smoothstep(size + 0.1, size, dist) - smoothstep(size, size - 0.05, dist);
          float pulse = sin(time * 2.0 + i) * 0.5 + 0.5;
          col += vec3(0.5, 0.3, 1.0) * bubble * pulse * 0.8 + vec3(0.8, 0.6, 1.0) * bubble * (1.0 - pulse) * 0.5;
        }
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 18: Energy Waves
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float angle = atan(p.y, p.x);
        float radius = length(p);
        float wave1 = sin(radius * 20.0 - time * 4.0 + angle * 3.0) * 0.5 + 0.5;
        float wave2 = sin(radius * 15.0 - time * 3.0 - angle * 2.0) * 0.5 + 0.5;
        float pattern = wave1 * wave2;
        vec3 col = vec3(0.0);
        col += vec3(1.0, 0.3, 0.0) * smoothstep(0.3, 0.6, pattern);
        col += vec3(1.0, 0.8, 0.0) * smoothstep(0.6, 0.8, pattern);
        col += vec3(1.0, 1.0, 1.0) * smoothstep(0.8, 1.0, pattern);
        col *= 1.0 - radius * 0.5;
        gl_FragColor = vec4(col, 1.0);
      }`,
      
      // Effect 19: Particle Swarm
      `precision mediump float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 col = vec3(0.0);
        for(float i = 0.0; i < 80.0; i++) {
          float h = hash(vec2(i));
          float angle = h * 6.28318 + time * 0.5;
          float radius = 0.3 + sin(time + i * 0.5) * 0.2;
          vec2 center = vec2(0.5) + vec2(cos(angle), sin(angle)) * radius;
          vec2 particlePos = center + vec2(sin(time * 2.0 + i), cos(time * 1.5 + i)) * 0.05;
          float dist = length(vUv - particlePos);
          float size = 0.008 + hash(vec2(i + 100.0)) * 0.006;
          float particle = smoothstep(size, 0.0, dist);
          float trail = exp(-dist * 30.0) * 0.3;
          vec3 color = mix(vec3(0.0, 0.6, 1.0), vec3(0.8, 0.2, 1.0), h);
          col += color * (particle + trail);
        }
        gl_FragColor = vec4(col, 1.0);
      }`
    ];

    const fragmentShaderSource = fragmentShaders[randomEffect];

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    programRef.current = program;

    // Create fullscreen quad for video shader
    const createQuad = () => {
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
      ]);
      return { positions, count: 4 };
    };

    const geometry = createQuad();

    // Create buffer
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);

    // Set up attributes
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLoc = gl.getUniformLocation(program, 'time');
    const resolutionLoc = gl.getUniformLocation(program, 'resolution');

    let startTime = Date.now();
    let lastFrameTime = startTime;

    const render = () => {
      const now = Date.now();

      // Throttle to 30fps max on mobile
      if (now - lastFrameTime < 33) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      lastFrameTime = now;
      const time = (now - startTime) * 0.001;

      // Skip frames if page is not visible
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      gl.clearColor(0.024, 0.004, 0.082, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Update uniforms
      gl.uniform1f(timeLoc, time);
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);

      // Draw fullscreen quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, geometry.count);

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [matrixOps]);

  const containerClass = fill
    ? "absolute inset-0 h-full w-full overflow-hidden border-0 rounded-none bg-gradient-to-br from-[#12062c] via-[#061127] to-[#080621]"
    : "relative h-[520px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-black/30";

  return (
    <div className={containerClass}>
      <canvas ref={canvasRef} className="w-full h-full block" style={{ display: 'block' }} />
    </div>
  );
};

export default MobileHeroScene;
