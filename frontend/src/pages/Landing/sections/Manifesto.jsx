import React from "react";
import { motion } from "framer-motion";
import { SplitText } from "../motion/SplitText";
import { manifesto } from "../content/site";
import { EASE_OUT, VIEWPORT_ONCE } from "../lib/motion";

export function Manifesto() {
  return (
    <section
      id="method"
      className="scroll-mt-24 border-t border-[var(--line)] px-4 py-24 md:px-8 md:py-36"
    >
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <div className="flex items-center gap-3">
            <span className="eyebrow tnum">01</span>
            <span className="eyebrow">{manifesto.eyebrow}</span>
          </div>
        </div>

        <div className="md:col-span-9">
          <SplitText
            as="h2"
            lines={manifesto.lines}
            className="display max-w-[14ch]"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
            className="mt-12 grid gap-8 border-t border-[var(--line)] pt-8 md:grid-cols-2"
          >
            <p className="body-copy">{manifesto.copy}</p>
            <div className="flex items-start justify-start md:justify-end">
              <div className="flex max-w-[260px] flex-col gap-3">
                <span className="eyebrow">Read the carbon method</span>
                <span className="h-px w-full bg-[var(--line)]" />
                <span className="text-[14px] text-[var(--muted)]">
                  ReLoop computes that distance for every listing and lets it
                  govern what the matching engine will show you.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
