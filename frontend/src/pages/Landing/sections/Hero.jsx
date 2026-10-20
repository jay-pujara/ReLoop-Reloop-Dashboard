import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { SplitText } from "../motion/SplitText";
import { useReveal } from "../motion/RevealProvider";
import { hero } from "../content/site";
import { EASE_OUT, STAGE_SPRING } from "../lib/motion";
import { usePrefersReducedMotion } from "../lib/hooks";

const META = [
  { k: "Material", v: "Corrugated A" },
  { k: "Distance", v: "182 km" },
  { k: "Break-even", v: "421 km at 0.75 load" },
];

export function Hero() {
  const ref = useRef(null);
  const { revealed } = useReveal();
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const p = useSpring(scrollYProgress, STAGE_SPRING);

  const blobA = useTransform(p, [0, 1], ["0%", "-38%"]);
  const blobB = useTransform(p, [0, 1], ["0%", "22%"]);
  const blobC = useTransform(p, [0, 1], ["0%", "-14%"]);
  const copyY = useTransform(p, [0, 1], ["0%", "-18%"]);
  const copyFade = useTransform(p, [0, 0.8], [1, 0]);

  const still = reduced;

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[calc(100vh-6.75rem)] flex-col justify-end overflow-hidden px-4 pb-8 pt-10 md:px-8 md:pb-10"
    >
      {/* blur layers */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <motion.div
          style={{ y: still ? 0 : blobA }}
          className="absolute -left-[10%] top-[6%] h-[52vh] w-[52vh] rounded-full bg-[#1b4fd8]/18 blur-[110px]"
        />
        <motion.div
          style={{ y: still ? 0 : blobB }}
          className="absolute right-[4%] top-[26%] h-[44vh] w-[44vh] rounded-full bg-[#ff5b14]/16 blur-[120px]"
        />
        <motion.div
          style={{ y: still ? 0 : blobC }}
          className="absolute bottom-[-14%] left-[34%] h-[46vh] w-[62vh] rounded-full bg-[#0e2a6b]/12 blur-[130px]"
        />
      </div>

      {/* structural hairlines */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 mx-4 hidden grid-cols-4 md:mx-8 md:grid"
        aria-hidden
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={i === 0 ? "" : "border-l border-[var(--line)]"}
          />
        ))}
      </div>

      <motion.div
        style={still ? undefined : { y: copyY, opacity: copyFade }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="block h-px w-8 bg-[var(--fg)]" />
          <span className="eyebrow !text-[var(--fg)]">{hero.eyebrow}</span>
        </motion.div>

        <SplitText
          as="h1"
          lines={hero.headline}
          active={revealed}
          delay={0.15}
          className="display max-w-[16ch]"
        />

        <div className="mt-8 flex flex-col gap-6 border-t border-[var(--line)] pt-6 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE_OUT }}
            className="body-copy max-w-[46ch]"
          >
            {hero.subcopy}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.82, ease: EASE_OUT }}
            className="flex shrink-0 items-center gap-3"
          >
            <Link
              to={hero.primaryCta.href}
              className="group flex h-12 items-center gap-3 rounded-full bg-[var(--fg)] pl-6 pr-5 text-[14px] font-bold text-[var(--bg)] shadow-xs transition-opacity hover:opacity-85"
            >
              <span>{hero.primaryCta.label}</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              to={hero.secondaryCta.href}
              className="flex h-12 items-center rounded-full border border-[var(--line)] px-6 text-[14px] font-semibold text-[var(--fg)] transition-colors hover:border-[var(--fg)]"
            >
              {hero.secondaryCta.label}
            </Link>
          </motion.div>
        </div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 grid grid-cols-2 gap-y-4 border-t border-[var(--line)] pt-5 md:grid-cols-4"
        >
          {META.map((m) => (
            <div key={m.k} className="flex flex-col gap-1.5">
              <dt className="eyebrow">{m.k}</dt>
              <dd className="tnum text-[14px] text-[var(--fg)] font-medium">{m.v}</dd>
            </div>
          ))}
          <div className="flex items-end justify-start md:justify-end">
            <span className="eyebrow flex items-center gap-2">
              Scroll
              <span className="relative block h-px w-10 overflow-hidden bg-[var(--line)]">
                <span className="scroll-cue absolute inset-y-0 left-0 w-4 bg-[var(--fg)]" />
              </span>
            </span>
          </div>
        </motion.dl>
      </motion.div>
    </section>
  );
}
