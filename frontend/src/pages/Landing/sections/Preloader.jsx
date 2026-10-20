import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { WorldMapDots } from "../art/WorldMapDots";
import { Marquee } from "../motion/Marquee";
import { useReveal } from "../motion/RevealProvider";
import { useScrollApi } from "../motion/LenisProvider";
import { brand, materials } from "../content/site";
import { EASE_OUT } from "../lib/motion";
import { usePrefersReducedMotion } from "../lib/hooks";

const COUNT_DURATION = 2.0;

export function Preloader() {
  const [open, setOpen] = useState(true);
  const { reveal } = useReveal();
  const { lock, unlock } = useScrollApi();
  const reduced = usePrefersReducedMotion();
  const countRef = useRef(null);

  const count = useMotionValue(0);
  const barScale = useTransform(count, [0, 100], [0, 1]);

  useMotionValueEvent(count, "change", (v) => {
    if (countRef.current) {
      countRef.current.textContent = String(Math.round(v)).padStart(3, "0");
    }
  });

  useEffect(() => {
    lock();
  }, [lock]);

  useEffect(() => {
    if (reduced) {
      setOpen(false);
      unlock();
      reveal();
      return;
    }

    const controls = animate(count, 100, {
      duration: COUNT_DURATION,
      ease: [0.22, 0.8, 0.2, 1],
    });

    const timer = window.setTimeout(
      () => setOpen(false),
      (COUNT_DURATION + 0.2) * 1000,
    );

    return () => {
      controls.stop();
      window.clearTimeout(timer);
    };
  }, [count, reduced, reveal, unlock]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        unlock();
        reveal();
      }}
    >
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#0b0b0b] px-6 py-6 text-[#f5f4f1] md:px-10 md:py-8"
          initial={{ y: 0 }}
          exit={{ y: "-101%" }}
          transition={{ duration: 0.95, ease: EASE_OUT }}
        >
          {/* top row */}
          <motion.div
            className="flex items-start justify-between"
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <div>
              <div className="text-[13px] font-semibold tracking-[0.22em]">
                {brand.wordmark}
              </div>
              <div className="eyebrow mt-2 !text-[#5c5c59]">
                {brand.descriptor}
              </div>
            </div>
            <div className="eyebrow !text-[#5c5c59]">
              {brand.founded}
            </div>
          </motion.div>

          {/* map */}
          <motion.div
            className="flex flex-1 items-center justify-center py-10"
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <WorldMapDots
              className="w-full max-w-[880px] text-[#f5f4f1]"
              reveal
              showHubs
              opacity={0.55}
            />
          </motion.div>

          {/* bottom row */}
          <motion.div
            className="flex items-end justify-between gap-8"
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <div className="h-[64px] w-[150px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]">
              <Marquee axis="y" duration={14} className="h-full">
                <div>
                  {materials.map((c, i) => (
                    <div
                      key={`${c}-${i}`}
                      className="text-[13px] leading-[21px] text-[#9a9a97]"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              </Marquee>
            </div>

            <div className="flex flex-1 items-end justify-end gap-6">
              <div className="hidden h-px flex-1 bg-[#5c5c59]/40 sm:block">
                <motion.div
                  className="h-full origin-left bg-[#f5f4f1]"
                  style={{ scaleX: barScale }}
                />
              </div>
              <div className="flex items-end gap-1">
                <span
                  ref={countRef}
                  className="tnum text-[clamp(3rem,10vw,7rem)] font-medium leading-[0.8] tracking-[-0.04em]"
                >
                  000
                </span>
                <span className="eyebrow mb-2 !text-[#5c5c59]">%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
