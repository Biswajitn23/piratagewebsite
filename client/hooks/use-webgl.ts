import { useEffect, useState } from "react";

const checkSupport = () => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error experimental-webgl still widely used for detection
      canvas.getContext("experimental-webgl");
    return Boolean(gl && gl instanceof WebGLRenderingContext);
  } catch (error) {
    console.warn("WebGL unavailable", error);
    return false;
  }
};

const useWebGL = () => {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(checkSupport());
  }, []);

  return supported;
};

export default useWebGL;
