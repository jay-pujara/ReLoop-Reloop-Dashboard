import React from "react";
import { HUBS, LAND_DOTS, MAP_COLS, MAP_ROWS } from "../content/world-map";

const STEP = 4;
const R = 1.15;

export function WorldMapDots({
  className = "",
  reveal = false,
  showHubs = false,
  opacity = 0.5,
}) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${MAP_COLS * STEP} ${MAP_ROWS * STEP}`}
      fill="none"
      aria-hidden
    >
      <g fill="currentColor" opacity={opacity}>
        {LAND_DOTS.map((d) => (
          <circle
            key={`${d.col}-${d.row}`}
            cx={d.x * STEP + STEP / 2}
            cy={d.y * STEP + STEP / 2}
            r={R}
            className={reveal ? "dot-reveal" : undefined}
            style={
              reveal
                ? { animationDelay: `${d.col * 14 + d.row * 6}ms` }
                : undefined
            }
          />
        ))}
      </g>

      {showHubs &&
        HUBS.map((h) => (
          <circle
            key={h.name}
            cx={h.col * STEP + STEP / 2}
            cy={h.row * STEP + STEP / 2}
            r={R * 1.9}
            fill="#FF5B14"
          />
        ))}
    </svg>
  );
}
