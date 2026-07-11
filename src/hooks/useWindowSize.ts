import { useState, useEffect } from "react";

export const useWindowSize = () => {
  const [winSize, setWinSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1000,
    h: typeof window !== "undefined" ? window.innerHeight : 1000,
  });

  useEffect(() => {
    const handleResize = () => {
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return winSize;
};
