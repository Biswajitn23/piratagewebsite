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
      depth: true,
      stencil: false,
      powerPreference: 'low-power'
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

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Iridescent Silk shader with Perlin noise deformation
    const vertexShaderSource = `
      precision mediump float;
      attribute vec2 position;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float time;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float time;
      uniform vec2 resolution;
      
      void main() {
        vec2 uv = vUv;
        
        // Iridescent color palette - shifting purples and metallics
        vec3 deepPlum = vec3(0.29, 0.0, 0.51);        // #4b0082
        vec3 electricViolet = vec3(0.54, 0.17, 0.89); // #8a2be2
        vec3 magenta = vec3(0.7, 0.1, 0.5);           // Bright magenta
        vec3 silver = vec3(0.75, 0.75, 0.8);          // Metallic silver
        vec3 darkBg = vec3(0.024, 0.008, 0.09);       // Deep background
        
        // Fresnel effect for iridescence (viewing angle dependent)
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0) - vPosition);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);
        
        // Animated iridescent shift
        float iridescent = sin(vPosition.z * 15.0 + time * 0.5 + uv.x * 3.0) * 0.5 + 0.5;
        iridescent += cos(vPosition.z * 20.0 - time * 0.4 + uv.y * 4.0) * 0.3;
        
        // Base metallic purple color
        vec3 baseColor = mix(deepPlum, electricViolet, iridescent);
        
        // Add iridescent highlights based on surface angle
        vec3 iridColor = mix(electricViolet, magenta, fresnel);
        iridColor = mix(iridColor, silver, fresnel * 0.4);
        
        // Combine base and iridescent colors
        vec3 col = mix(baseColor, iridColor, fresnel * 0.6);
        
        // Add shimmer/sparkle effect on peaks
        float shimmer = smoothstep(0.1, 0.3, vPosition.z);
        col += silver * shimmer * 0.3 * sin(time * 2.0 + uv.x * 10.0);
        
        // Flowing color waves
        float wave = sin(uv.x * 4.0 + time * 0.3 + vPosition.z * 10.0) * 0.5 + 0.5;
        col = mix(col, magenta, wave * 0.2);
        
        // Soft gradient from center
        float dist = length(uv - 0.5);
        float radialGlow = 1.0 - smoothstep(0.2, 0.8, dist);
        col += electricViolet * radialGlow * 0.15;
        
        // Vignette for depth
        float vignette = 1.0 - dist * 0.6;
        col *= vignette;
        
        // Ensure it blends with dark background
        col = mix(darkBg, col, 0.85
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      void main() {
        vec2 uv = vUv;
        vec2 p = uv * 3.0;
        
        // Website color palette - deep purples and dark tones
        vec3 deepPurple = vec3(0.29, 0.0, 0.51);      // #4b0082
        vec3 mediumPurple = vec3(0.54, 0.17, 0.89);   // #8a2be2
        vec3 darkCyan = vec3(0.0, 0.4, 0.5);          // Teal accent
        vec3 deepBg = vec3(0.024, 0.008, 0.09);       // Dark background
        
        // Flowing particles effect
        float n1 = smoothNoise(p + time * 0.3);
        float n2 = smoothNoise(p * 2.0 - vec2(time * 0.2, time * 0.4));
        float n3 = smoothNoise(p * 1.5 + vec2(-time * 0.15, time * 0.25));
        
        // Combine noise for flowing effect
        float flow = (n1 + n2 * 0.5 + n3 * 0.3) / 1.8;
        
        // Create depth layers
        float layer1 = sin(p.x * 2.0 + flow * 3.0 + time * 0.5) * 0.5 + 0.5;
        float layer2 = cos(p.y * 1.5 - flow * 2.0 - time * 0.4) * 0.5 + 0.5;
        
        // Mix colors based on flow
        vec3 col = mix(deepBg, deepPurple, flow * 0.6);
        col = mix(col, mediumPurple, layer1 * 0.4);
        col = mix(col, darkCyan, layer2 * n2 * 0.3);
        
        // Subtle scanlines
        float scanline = sin(uv.y * 150.0 + time * 2.0) * 0.02 + 0.98;
        col *= scanline;
        
        // Radial gradient from center
        float dist = length(uv - 0.5);
        float radial = 1.0 - smoothstep(0.0, 0.8, dist);
        col += mediumPurple * radial * 0.1 * sin(time * 0.5);
        
        // Subtle particle sparkles
        float sparkle = smoothNoise(p * 8.0 + time * 0.8);
        if (sparkle > 0.92) {
          col += mediumPurple * (sparkle - 0.92) * 5.0;
        }
        
        // Vignette matching website style
        float vignette = 1.0 - dist * 0.7;
        col *= vignette;
        
        // Ensure minimum darkness to match website
        col = max(col, deepBg * 0.8);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `;

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
