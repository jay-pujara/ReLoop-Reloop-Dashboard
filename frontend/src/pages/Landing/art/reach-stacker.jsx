import React from "react";
import { motion, useTransform } from "framer-motion";

export const VIEW = { w: 1200, h: 700 };
const PIVOT = { x: 600, y: 450 };
const TIP_ARC = {
  x: [156.3, 186.8, 229.8, 285.5],
  y: [310.4, 236.2, 168.3, 107.3],
};
const STOPS = [0, 0.33, 0.66, 1];

export function useStackerMotion(progress) {
  const rotate = useTransform(progress, [0, 1], [-8, 22]);
  const tipX = useTransform(progress, STOPS, TIP_ARC.x);
  const tipY = useTransform(progress, STOPS, TIP_ARC.y.map((y) => y + 100));

  const whiteOp = useTransform(progress, [0, 0.3, 0.37], [1, 1, 0]);
  const blueOp = useTransform(
    progress,
    [0.3, 0.37, 0.63, 0.7],
    [0, 1, 1, 0],
  );
  const orangeOp = useTransform(progress, [0.63, 0.7], [0, 1]);

  const loadShadowX = tipX;
  const loadShadowScale = useTransform(progress, [0, 1], [1, 0.55]);
  const loadShadowOp = useTransform(progress, [0, 1], [0.16, 0.03]);
  const backdropX = useTransform(progress, [0, 1], [0, -60]);
  const dustOp = useTransform(progress, [0, 0.25, 0.6, 1], [0, 0.5, 0.28, 0]);

  return {
    rotate,
    tipX,
    tipY,
    whiteOp,
    blueOp,
    orangeOp,
    loadShadowX,
    loadShadowScale,
    loadShadowOp,
    backdropX,
    dustOp,
  };
}

const svgProps = {
  viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
  preserveAspectRatio: "xMidYMax meet",
  className: "absolute inset-0 h-full w-full",
  "aria-hidden": true,
};

const STACKS = [
  { x: 40, rows: 3, w: 150 },
  { x: 210, rows: 2, w: 130 },
  { x: 820, rows: 4, w: 160 },
  { x: 1000, rows: 2, w: 140 },
];

export function YardBackdrop({ x }) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ x }} opacity={0.5}>
        {STACKS.map((s, si) =>
          Array.from({ length: s.rows }).map((_, r) => {
            const h = 34;
            const y = 600 - (r + 1) * (h + 3);
            return (
              <g key={`${si}-${r}`}>
                <rect
                  x={s.x}
                  y={y}
                  width={s.w}
                  height={h}
                  fill="#DDDCD7"
                  stroke="#CFCEC8"
                  strokeWidth={1}
                />
                {Array.from({ length: Math.floor(s.w / 14) }).map((__, c) => (
                  <line
                    key={c}
                    x1={s.x + 7 + c * 14}
                    x2={s.x + 7 + c * 14}
                    y1={y + 4}
                    y2={y + h - 4}
                    stroke="#CFCEC8"
                    strokeWidth={1}
                  />
                ))}
              </g>
            );
          }),
        )}

        {[130, 930].map((mx) => (
          <g key={mx} stroke="#D5D4CE" strokeWidth={3} fill="none">
            <line x1={mx} y1={600} x2={mx} y2={300} />
            <line x1={mx - 26} y1={300} x2={mx + 26} y2={300} />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

export function StackerGround({
  loadX,
  loadScale,
  loadOpacity,
}) {
  return (
    <svg {...svgProps}>
      <line
        x1={0}
        x2={VIEW.w}
        y1={600}
        y2={600}
        stroke="#D8D7D2"
        strokeWidth={1.5}
      />
      <ellipse cx={420} cy={606} rx={260} ry={13} fill="#0B0B0B" opacity={0.1} />
      <motion.ellipse
        cy={606}
        rx={150}
        ry={11}
        fill="#0B0B0B"
        style={{ x: loadX, scaleX: loadScale, opacity: loadOpacity }}
      />
    </svg>
  );
}

const r2 = (n) => Math.round(n * 100) / 100;

function Wheel({ cx, cy, r }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#111114" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#232327" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#3A3A40" />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={r2(cx + Math.cos(a) * r * 0.72)}
            y1={r2(cy + Math.sin(a) * r * 0.72)}
            x2={r2(cx + Math.cos(a) * r * 0.97)}
            y2={r2(cy + Math.sin(a) * r * 0.97)}
            stroke="#000"
            strokeOpacity={0.55}
            strokeWidth={4}
          />
        );
      })}
    </g>
  );
}

export function StackerBody() {
  return (
    <svg {...svgProps}>
      <rect x={596} y={432} width={78} height={118} rx={4} fill="#1B1B1F" />
      <rect x={606} y={452} width={58} height={8} fill="#2E2E34" />
      <rect x={606} y={470} width={58} height={8} fill="#2E2E34" />

      <path
        d="M196 470 L648 470 L648 556 L228 556 Q200 556 196 532 Z"
        fill="#17171A"
      />
      <rect x={196} y={470} width={452} height={7} fill="#2E2E34" />

      <g>
        <rect x={212} y={520} width={120} height={16} fill="#FF5B14" />
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M${218 + i * 17} 520 l12 0 l-12 16 l-12 0 Z`}
            fill="#17171A"
            opacity={0.85}
          />
        ))}
      </g>

      <path d="M338 330 L452 330 L462 452 L330 452 Z" fill="#1B1B1F" />
      <path d="M348 344 L442 344 L450 404 L344 404 Z" fill="#BFCEE0" opacity={0.92} />
      <path d="M348 344 L392 344 L364 404 L344 404 Z" fill="#FFFFFF" opacity={0.22} />
      <rect x={330} y={446} width={132} height={10} fill="#2E2E34" />
      <rect x={452} y={352} width={8} height={96} fill="#2E2E34" />

      <rect x={470} y={398} width={122} height={74} rx={3} fill="#1B1B1F" />
      {[410, 424, 438].map((y) => (
        <rect key={y} x={486} y={y} width={90} height={4} fill="#33333A" />
      ))}

      <rect x={556} y={352} width={13} height={50} rx={3} fill="#2E2E34" />

      <Wheel cx={300} cy={540} r={58} />
      <Wheel cx={556} cy={552} r={46} />

      <text
        x={360}
        y={502}
        fill="#F5F4F1"
        fontSize={19}
        letterSpacing={5}
        fontWeight={600}
        fontFamily="inherit"
        opacity={0.9}
      >
        RELOOP
      </text>
    </svg>
  );
}

export function StackerBoom({ rotate }) {
  return (
    <svg {...svgProps}>
      <motion.g
        style={{
          rotate,
          transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`,
          transformBox: "view-box",
        }}
      >
        <path
          d="M613.8 421.1 L188.6 231.9 L171.4 268.1 L586.2 478.9 Z"
          fill="#1B1B1F"
        />
        <path
          d="M420 330 L196 240 L186 262 L410 352 Z"
          fill="#2E2E34"
        />
        {Array.from({ length: 9 }).map((_, i) => {
          const t = 0.12 + i * 0.085;
          const x1 = 613.8 + (188.6 - 613.8) * t;
          const y1 = 421.1 + (231.9 - 421.1) * t;
          const x2 = 586.2 + (171.4 - 586.2) * t;
          const y2 = 478.9 + (268.1 - 478.9) * t;
          return (
            <line
              key={i}
              x1={r2(x1)}
              y1={r2(y1)}
              x2={r2(x2)}
              y2={r2(y2)}
              stroke="#000"
              strokeOpacity={0.35}
              strokeWidth={2}
            />
          );
        })}
        <path d="M196 232 L214 226 L224 258 L206 264 Z" fill="#FF5B14" />

        <g>
          <rect
            x={452}
            y={392}
            width={132}
            height={26}
            rx={13}
            fill="#2E2E34"
            transform="rotate(-24 584 405)"
          />
          <rect
            x={520}
            y={397}
            width={78}
            height={16}
            rx={8}
            fill="#4A4A52"
            transform="rotate(-24 584 405)"
          />
        </g>

        <circle cx={PIVOT.x} cy={PIVOT.y} r={17} fill="#3A3A40" />
        <circle cx={PIVOT.x} cy={PIVOT.y} r={6} fill="#0B0B0B" />
      </motion.g>
    </svg>
  );
}

function ContainerBody({ fill, ink }) {
  return (
    <g>
      <rect x={-160} y={-70} width={320} height={140} rx={2} fill={fill} />
      {Array.from({ length: 19 }).map((_, i) => (
        <line
          key={i}
          x1={-150 + i * 16}
          x2={-150 + i * 16}
          y1={-58}
          y2={58}
          stroke={ink}
          strokeOpacity={0.16}
          strokeWidth={2}
        />
      ))}
      <rect x={-160} y={-70} width={320} height={12} fill={ink} opacity={0.14} />
      <rect x={-160} y={58} width={320} height={12} fill={ink} opacity={0.18} />
      {[
        [-160, -70],
        [140, -70],
        [-160, 50],
        [140, 50],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={20} height={20} fill="#1B1B1F" />
      ))}
      <rect x={104} y={-58} width={54} height={116} fill={ink} opacity={0.08} />
      <line x1={131} y1={-58} x2={131} y2={58} stroke={ink} strokeOpacity={0.3} strokeWidth={2} />
      <text
        x={-140}
        y={-24}
        fill={ink}
        fontSize={20}
        fontWeight={600}
        letterSpacing={4}
        fontFamily="inherit"
      >
        RELOOP
      </text>
      <text
        x={-140}
        y={36}
        fill={ink}
        opacity={0.75}
        fontSize={15}
        letterSpacing={2}
        fontFamily="inherit"
      >
        GRADE A 3,000 KG
      </text>
    </g>
  );
}

export function StackerLoad({
  x,
  y,
  whiteOp,
  blueOp,
  orangeOp,
}) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ x, y }}>
        <rect x={-120} y={-110} width={240} height={22} rx={4} fill="#2E2E34" />
        <rect x={-34} y={-124} width={68} height={16} rx={3} fill="#3A3A40" />
        {[-112, 96].map((lx) => (
          <rect key={lx} x={lx} y={-92} width={16} height={26} fill="#1B1B1F" />
        ))}

        <motion.g style={{ opacity: whiteOp }}>
          <ContainerBody fill="#F5F4F1" ink="#0B0B0B" />
        </motion.g>
        <motion.g style={{ opacity: blueOp }}>
          <ContainerBody fill="#1B4FD8" ink="#FFFFFF" />
        </motion.g>
        <motion.g style={{ opacity: orangeOp }}>
          <ContainerBody fill="#FF5B14" ink="#FFFFFF" />
        </motion.g>
      </motion.g>
    </svg>
  );
}

export function StackerDust({ opacity }) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ opacity }}>
        <ellipse cx={300} cy={596} rx={120} ry={26} fill="#C9C8C2" opacity={0.5} />
        <ellipse cx={556} cy={598} rx={90} ry={18} fill="#C9C8C2" opacity={0.35} />
      </motion.g>
    </svg>
  );
}
