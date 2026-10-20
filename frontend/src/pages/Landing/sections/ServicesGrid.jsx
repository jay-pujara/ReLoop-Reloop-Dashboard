import React from "react";
import { motion } from "framer-motion";
import { RollLink } from "../motion/SmoothLink";
import { SplitText } from "../motion/SplitText";
import { services } from "../content/site";
import { EASE_OUT, VIEWPORT_ONCE } from "../lib/motion";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ICONS = [
  // ocean
  <>
    <path d="M3 19c1.6 0 1.6 1 3.2 1s1.6-1 3.2-1 1.6 1 3.2 1 1.6-1 3.2-1 1.6 1 3.2 1" {...stroke} />
    <path d="M5 16 6.4 10h11.2L19 16" {...stroke} />
    <path d="M12 10V5m0 0h4l-1.6 2.2L16 9" {...stroke} />
  </>,
  // road
  <>
    <path d="M2 16.5V8h11v8.5" {...stroke} />
    <path d="M13 11h4l3 3.2v2.3h-7" {...stroke} />
    <circle cx="6.5" cy="17" r="1.9" {...stroke} />
    <circle cx="16.5" cy="17" r="1.9" {...stroke} />
  </>,
  // rail
  <>
    <rect x="6" y="4" width="12" height="12" rx="2.5" {...stroke} />
    <path d="M6 10h12M9.5 20l2-3m3 3-2-3" {...stroke} />
    <path d="M9.5 13h.01M14.5 13h.01" {...stroke} />
  </>,
  // warehouse
  <>
    <path d="M3 20V9.5L12 5l9 4.5V20" {...stroke} />
    <path d="M8 20v-6h8v6" {...stroke} />
    <path d="M8 17h8" {...stroke} />
  </>,
  // customs
  <>
    <path d="M6 3h9l4 4v14H6z" {...stroke} />
    <path d="M14.5 3v4.5H19" {...stroke} />
    <path d="M9.5 13.5l1.8 1.8 3.4-3.6" {...stroke} />
  </>,
  // cold chain
  <>
    <path d="M12 3v18M5.5 6.8 18.5 17M18.5 6.8 5.5 17" {...stroke} />
    <path d="M12 7.6 9.9 5.5M12 7.6l2.1-2.1M12 16.4l-2.1 2.1M12 16.4l2.1 2.1" {...stroke} />
  </>,
];

export function ServicesGrid() {
  return (
    <section
      id="services"
      className="border-t border-[var(--line)] px-4 py-20 md:px-8 md:py-28"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="eyebrow tnum">04</span>
            <span className="eyebrow">{services.eyebrow}</span>
          </div>
          <SplitText
            as="h2"
            lines={services.heading}
            className="display-sm max-w-[22ch]"
          />
        </div>
        <RollLink
          label="See the method →"
          href="#method"
          className="shrink-0 text-[14px] font-medium text-[var(--fg)]"
        />
      </div>

      <div className="mt-14 grid border-t border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
        {services.items.map((item, i) => (
          <motion.article
            key={item.index}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.8, delay: (i % 3) * 0.07, ease: EASE_OUT }}
            className="group relative flex min-h-[248px] flex-col justify-between border-b border-[var(--line)] p-7 transition-colors duration-500 hover:bg-[var(--panel)] sm:border-r lg:[&:nth-child(3n)]:border-r-0"
          >
            <div className="flex items-start justify-between">
              <span className="text-[var(--fg)]">
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
                  {ICONS[i]}
                </svg>
              </span>
              <span className="eyebrow tnum">{item.index}</span>
            </div>

            <div>
              <h3 className="text-[22px] font-medium leading-tight tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-2 min-h-[2.7em] max-w-[34ch] text-[15px] leading-snug text-[var(--muted)]">
                {item.line}
              </p>
            </div>

            <span className="absolute bottom-7 right-7 translate-y-1 text-[var(--fg)] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              →
            </span>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
