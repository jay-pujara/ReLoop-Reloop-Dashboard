import React from "react";

export function Marquee({
  children,
  duration = 30,
  direction = "left",
  axis = "x",
  className = "",
  trackClassName = "",
}) {
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div
        className={`marquee-track ${trackClassName}`}
        data-dir={direction}
        data-axis={axis}
        style={{ animationDuration: `${duration}s` }}
      >
        <div className={axis === "x" ? "flex shrink-0" : "block"} aria-hidden={false}>
          {children}
        </div>
        <div className={axis === "x" ? "flex shrink-0" : "block"} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
