import React from "react";
import { motion } from "framer-motion";
import { WorldMapDots } from "../art/WorldMapDots";
import { SplitText } from "../motion/SplitText";
import { features } from "../content/site";
import { EASE_OUT, VIEWPORT_ONCE } from "../lib/motion";

const VISUALS = [
  // live tracking: a leg of a journey with a live pulse on the current node
  <svg viewBox="0 0 260 80" className="h-20 w-full" aria-hidden key="track">
    <line x1="12" y1="46" x2="248" y2="46" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1.5" />
    <line x1="12" y1="46" x2="150" y2="46" stroke="currentColor" strokeWidth="1.5" />
    {[12, 81, 150, 219].map((cx, i) => (
      <g key={cx}>
        <circle cx={cx} cy={46} r={i === 2 ? 6 : 4} fill={i <= 2 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
        {i === 2 && <circle cx={cx} cy={46} r="6" className="ping" fill="none" stroke="#FF5B14" strokeWidth="1.5" />}
      </g>
    ))}
    <text x="140" y="26" fontSize="11" letterSpacing="1.6" fill="#FF5B14" fontFamily="inherit">NOW</text>
  </svg>,
  // owned network: the dot map, cropped
  <div className="flex h-20 w-full items-center overflow-hidden" key="net">
    <WorldMapDots className="w-full text-[var(--fg)]" opacity={0.32} showHubs />
  </div>,
  // named desk: a 24-hour bar, fully covered
  <svg viewBox="0 0 260 80" className="h-20 w-full" aria-hidden key="desk">
    {Array.from({ length: 24 }).map((_, i) => (
      <rect key={i} x={12 + i * 10} y={i % 6 === 0 ? 28 : 34} width="4" height={i % 6 === 0 ? 32 : 26} fill="currentColor" opacity={0.7} />
    ))}
    <line x1="12" y1="68" x2="248" y2="68" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
    <text x="12" y="22" fontSize="11" letterSpacing="1.6" fill="currentColor" opacity="0.5" fontFamily="inherit">00</text>
    <text x="222" y="22" fontSize="11" letterSpacing="1.6" fill="currentColor" opacity="0.5" fontFamily="inherit">24</text>
  </svg>,
];

export function FeatureCards() {
  return (
    <section
      id="platform"
      className="scroll-mt-24 border-t border-[var(--line)] px-4 py-20 md:px-8 md:py-28"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="eyebrow tnum">07</span>
        <span className="eyebrow">{features.eyebrow}</span>
      </div>

      <SplitText
        as="h2"
        lines={features.heading}
        className="display-sm max-w-[18ch]"
      />

      <div className="mt-14 grid gap-px bg-[var(--line)] md:grid-cols-3">
        {features.items.map((item, i) => (
          <motion.article
            key={item.index}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.85, delay: i * 0.09, ease: EASE_OUT }}
            className="group flex flex-col justify-between gap-10 bg-[var(--bg)] p-8 transition-colors duration-500 hover:bg-[var(--panel)]"
          >
            <div className="flex items-start justify-between">
              <span className="eyebrow tnum">{item.index}</span>
              <span className="eyebrow !text-[var(--fg)]">{item.meta}</span>
            </div>

            <div className="text-[var(--fg)]">{VISUALS[i]}</div>

            <div>
              <h3 className="text-[26px] font-medium leading-tight tracking-[-0.025em]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[32ch] text-[15px] leading-snug text-[var(--muted)]">
                {item.copy}
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
