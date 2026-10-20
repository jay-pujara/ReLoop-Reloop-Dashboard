import React from "react";
import { motion } from "framer-motion";
import { RollLink } from "../motion/SmoothLink";
import { SplitText } from "../motion/SplitText";
import { materialCategories, materialsSection } from "../content/site";
import { EASE_OUT, VIEWPORT_ONCE } from "../lib/motion";

export function MaterialsGrid() {
  return (
    <section
      id="materials"
      className="border-t border-[var(--line)] px-4 py-20 md:px-8 md:py-28"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="eyebrow tnum">05</span>
            <span className="eyebrow">{materialsSection.eyebrow}</span>
          </div>
          <SplitText
            as="h2"
            lines={materialsSection.heading}
            className="display-sm max-w-[22ch]"
          />
          <p className="body-copy mt-6 max-w-[52ch]">{materialsSection.copy}</p>
        </div>
        <RollLink
          label="Browse open lots →"
          href="/listings"
          className="shrink-0 text-[14px] font-bold text-[var(--fg)]"
        />
      </div>

      <ul className="mt-14 border-t border-[var(--line)]">
        {materialCategories.map((category, i) => (
          <motion.li
            key={category.slug}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.7, delay: i * 0.06, ease: EASE_OUT }}
            className="grid gap-5 border-b border-[var(--line)] py-7 transition-colors duration-500 hover:bg-[var(--panel)] md:grid-cols-12 md:items-baseline"
          >
            <div className="flex items-baseline gap-3 md:col-span-4">
              <span className="eyebrow tnum">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[22px] font-medium leading-tight tracking-[-0.02em]">
                {category.label}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 md:col-span-6">
              {category.subtypes.map((subtype) => (
                <span
                  key={subtype}
                  className="border border-[var(--line)] px-3 py-1 text-[13px] text-[var(--muted)]"
                >
                  {subtype}
                </span>
              ))}
            </div>

            <div className="md:col-span-2 md:text-right">
              <span className="eyebrow">
                {category.subtypes.length} subtypes
              </span>
            </div>
          </motion.li>
        ))}
      </ul>

      <p className="mt-6 max-w-[62ch] text-[13px] text-[var(--muted)]">
        These are the material categories the exchange validates against. A listing or a
        standing requirement outside this taxonomy is rejected at the API.
      </p>
    </section>
  );
}
