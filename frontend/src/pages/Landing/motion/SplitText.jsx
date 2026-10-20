import React from "react";
import { motion } from "framer-motion";
import { LINE_REVEAL, LINE_STAGGER, VIEWPORT_ONCE } from "../lib/motion";
import { usePrefersReducedMotion } from "../lib/hooks";

export function SplitText({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  delay = 0,
  active,
}) {
  const reduced = usePrefersReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: LINE_STAGGER, delayChildren: delay },
    },
  };

  const line = reduced
    ? {
        hidden: { opacity: 0, y: "0%" },
        show: { opacity: 1, y: "0%", transition: { duration: 0.4 } },
      }
    : {
        hidden: { y: "110%" },
        show: { y: "0%", transition: LINE_REVEAL },
      };

  const driven =
    active === undefined
      ? { whileInView: "show", viewport: VIEWPORT_ONCE }
      : { animate: active ? "show" : "hidden" };

  return (
    <Tag className={className}>
      <motion.span
        className="block"
        initial="hidden"
        variants={container}
        {...driven}
      >
        {lines.map((content, i) => (
          <span
            key={i}
            className={`block overflow-hidden pb-[0.26em] -mb-[0.26em] ${lineClassName}`}
          >
            <motion.span
              className="block"
              variants={line}
              style={{ willChange: "transform" }}
            >
              {content}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
