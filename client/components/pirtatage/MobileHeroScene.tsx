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

    if (!gl) return;
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

    // 3D shader with lighting
    const vertexShaderSource = `
      precision mediump float;
      attribute vec3 position;
      attribute vec3 normal;
      
      uniform mat4 projection;
      uniform mat4 view;
      uniform mat4 model;
      uniform float time;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDepth;
      
      void main() {
        vec3 pos = position;
        
        // Subtle animation
        pos.y += sin(time * 0.5 + pos.x * 3.0) * 0.1;
        pos.z += cos(time * 0.3 + pos.y * 2.0) * 0.08;
        
        vec4 worldPos = model * vec4(pos, 1.0);
        vec4 viewPos = view * worldPos;
        gl_Position = projection * viewPos;
        
        vNormal = normalize(mat3(model) * normal);
        vPosition = worldPos.xyz;
        vDepth = -viewPos.z;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying float vDepth;
      
      uniform float time;
      
      void main() {
        // Lighting
        vec3 light1 = normalize(vec3(1.0, 1.0, 1.0));
        vec3 light2 = normalize(vec3(-1.0, -0.5, -1.0));
        
        float diff1 = max(dot(vNormal, light1), 0.0) * 0.7;
        float diff2 = max(dot(vNormal, light2), 0.0) * 0.5;
        
        // Color gradient
        vec3 col1 = vec3(0.541, 0.169, 0.886); // #8a2be2
        vec3 col2 = vec3(0.294, 0.0, 0.510); // #4b0082
        
        vec3 col = mix(col1, col2, sin(vPosition.y * 2.0 + time * 0.3) * 0.5 + 0.5);
        
        float brightness = 0.4 + diff1 + diff2;
        col *= brightness;
        
        // Fade with depth
        float alpha = 0.6 * (1.0 - vDepth / 20.0);
        
        gl_FragColor = vec4(col, alpha);
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

    // Create torus knot (simplified)
    const createTorusKnot = () => {
      const p = 2, q = 3;
      const segments = 40;
      const rings = 20;
      
      const positions: number[] = [];
      const normals: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= segments; i++) {
        const u = (i / segments) * Math.PI * 2;
        for (let j = 0; j <= rings; j++) {
          const v = (j / rings) * Math.PI * 2;
          
          const r = Math.cos(q * u) + 2;
          const x = (r * Math.cos(p * u)) * 1.6;
          const y = (r * Math.sin(v)) * 1.6;
          const z = (r * Math.sin(q * u)) * 1.6;

          positions.push(x, y, z);
          
          // Approximate normal
          const eps = 0.01;
          const r2 = Math.cos(q * (u + eps)) + 2;
          const x2 = (r2 * Math.cos(p * (u + eps))) * 1.6;
          const y2 = (r2 * Math.sin(v + eps)) * 1.6;
          const z2 = (r2 * Math.sin(q * (u + eps))) * 1.6;
          
          let nx = x2 - x;
          let ny = y2 - y;
          let nz = z2 - z;
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
          normals.push(nx / len, ny / len, nz / len);
        }
      }

      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < rings; j++) {
          const a = i * (rings + 1) + j;
          const b = a + rings + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }

      return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
    };

    const geometry = createTorusKnot();

    // Create buffers
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

    // Set up attributes
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    const normLoc = gl.getAttribLocation(program, 'normal');
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.enableVertexAttribArray(normLoc);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const projLoc = gl.getUniformLocation(program, 'projection');
    const viewLoc = gl.getUniformLocation(program, 'view');
    const modelLoc = gl.getUniformLocation(program, 'model');
    const timeLoc = gl.getUniformLocation(program, 'time');

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

      // Set up matrices
      const matrices = matricesRef.current;
      matrixOps.perspective(matrices.projection, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
      matrixOps.identity(matrices.view);
      matrices.view[11] = -1;
      matrices.view[15] = 8;

      matrixOps.identity(matrices.model);
      matrices.model[0] = Math.cos(time * 0.3);
      matrices.model[2] = Math.sin(time * 0.3);
      matrices.model[8] = -Math.sin(time * 0.3);
      matrices.model[10] = Math.cos(time * 0.3);

      gl.uniformMatrix4fv(projLoc, false, matrices.projection);
      gl.uniformMatrix4fv(viewLoc, false, matrices.view);
      gl.uniformMatrix4fv(modelLoc, false, matrices.model);
      gl.uniform1f(timeLoc, time);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

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
    ? "absolute inset-0 h-full w-full overflow-hidden border-0 rounded-none"
    : "relative h-[520px] w-full overflow-hidden rounded-[32px] border border-white/10 bg-black/30";

  return (
    <div className={containerClass}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default MobileHeroScene;
