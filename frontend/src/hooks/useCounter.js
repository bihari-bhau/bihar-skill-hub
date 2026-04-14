import { useState, useEffect, useRef } from "react";

export function useCounter(target, { decimal = false, duration = 2000, trigger = true } = {}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const real = decimal ? target * 10 : target;
    let cur = 0;
    const step = real / (duration / 16);
    const timer = setInterval(() => {
      cur += step;
      if (cur >= real) { setCount(real); clearInterval(timer); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(timer);
  }, [target, trigger]);
  return decimal ? (count / 10).toFixed(1) : count;
}