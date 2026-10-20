import React, {
  createContext,
  useContext,
  useRef,
} from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
} from "framer-motion";
import { STAGE_SPRING } from "../lib/motion";
import { useIsMobile, usePrefersReducedMotion } from "../lib/hooks";

const StageContext = createContext(null);

export function useStage() {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage must be used inside a <PinnedStage>");
  return ctx;
}

export function PinnedStage({
  id,
  children,
  length = 300,
  mobileLength = 180,
  className = "",
  stickyClassName = "",
}) {
  const wrapperRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const active = useInView(wrapperRef, { margin: "20% 0px 20% 0px" });

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });
  const smoothed = useSpring(scrollYProgress, STAGE_SPRING);

  const settled = useMotionValue(1);
  const progress = reduced ? settled : smoothed;
  const raw = reduced ? settled : scrollYProgress;

  const wrapperStyle = reduced
    ? {}
    : { height: `${isMobile ? mobileLength : length}vh` };

  return (
    <StageContext.Provider
      value={{ progress, raw, active, reduced, isMobile }}
    >
      <section
        id={id}
        ref={wrapperRef}
        className={`relative ${className}`}
        style={wrapperStyle}
      >
        <div
          className={`${
            reduced ? "relative min-h-[80vh]" : "sticky top-0 h-screen"
          } w-full overflow-hidden ${stickyClassName}`}
        >
          {children}
        </div>
      </section>
    </StageContext.Provider>
  );
}

export function StageLayer({
  children,
  className = "",
  style,
  z = 0,
}) {
  const { active, reduced } = useStage();
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        zIndex: z,
        willChange: active && !reduced ? "transform" : "auto",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
