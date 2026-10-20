import React from "react";
import { Marquee } from "../motion/Marquee";
import { RollLink } from "../motion/SmoothLink";
import { tickerItems } from "../content/site";

export function UtilityBar() {
  return (
    <div className="relative z-50 border-b border-[var(--line)] bg-[var(--bg)] transition-colors duration-[600ms]">
      <div className="flex h-9 items-center gap-6 px-4 md:px-8">
        <div className="flex shrink-0 items-center gap-2">
          <span className="block h-1.5 w-1.5 rounded-full bg-[#ff5b14]" />
          <span className="eyebrow">Network:</span>
        </div>

        <Marquee duration={42} className="min-w-0 flex-1">
          <div className="flex items-center">
            {tickerItems.map((item) => (
              <span
                key={item}
                className="flex items-center whitespace-nowrap text-[12px] tracking-[0.02em] text-[var(--muted)]"
              >
                {item}
                <span className="mx-6 text-[var(--faint)]">/</span>
              </span>
            ))}
          </div>
        </Marquee>

        <RollLink
          label="Carbon method"
          href="#method"
          className="eyebrow shrink-0 !text-[var(--fg)] hover:!text-[var(--fg)]"
        />
      </div>
    </div>
  );
}
