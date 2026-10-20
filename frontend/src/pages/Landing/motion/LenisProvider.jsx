import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Lenis from "lenis";
import { LENIS_OPTIONS } from "../lib/motion";
import { usePrefersReducedMotion } from "../lib/hooks";

const ScrollContext = createContext({
  lock: () => {},
  unlock: () => {},
  scrollTo: () => {},
});

export const useScrollApi = () => useContext(ScrollContext);

export function LenisProvider({
  children,
  startLocked = false,
}) {
  const lenisRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [locked, setLocked] = useState(startLocked);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ ...LENIS_OPTIONS, autoRaf: false });
    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    if (locked) {
      lenisRef.current?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      document.documentElement.style.overflow = "";
    }
  }, [locked]);

  const api = useMemo(
    () => ({
      lock: () => setLocked(true),
      unlock: () => setLocked(false),
      scrollTo: (target) => {
        if (lenisRef.current) {
          lenisRef.current.scrollTo(target, { offset: 0 });
          return;
        }
        if (typeof target === "number") {
          window.scrollTo({ top: target });
          return;
        }
        document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      },
    }),
    [],
  );

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
