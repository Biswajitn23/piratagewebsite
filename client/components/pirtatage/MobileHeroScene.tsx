import { useRef, useEffect } from "react";

export type MobileHeroSceneProps = {
  fill?: boolean;
};

const MobileHeroScene = ({ fill }: MobileHeroSceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power'
    });

    if (!gl) return;

    // Resize canvas
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    // Simple gradient shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        vec3 color1 = vec3(0.071, 0.004, 0.082); // #12062c
        vec3 color2 = vec3(0.024, 0.067, 0.153); // #061127
        vec3 color3 = vec3(0.031, 0.024, 0.129); // #080621
        
        float t = time * 0.1;
        float wave = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
        
        vec3 color = mix(color1, color2, uv.y);
        color = mix(color, color3, wave * 0.3);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
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
    gl.useProgram(program);

    // Create quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');

    let startTime = Date.now();
    let frameCount = 0;
    let lastFrameTime = startTime;

    const render = () => {
      const now = Date.now();
      frameCount++;

      // Throttle to 30fps max on mobile
      if (now - lastFrameTime < 33) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      lastFrameTime = now;
      const time = (now - startTime) * 0.001;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
