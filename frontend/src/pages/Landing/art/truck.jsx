import React from "react";
import { motion, useTransform } from "framer-motion";

const VIEW = { w: 1200, h: 700 };
const GROUND = 600;

const WHEELS = [
  { cx: 1000, r: 52 }, // steer
  { cx: 852, r: 52 }, // drive
  { cx: 402, r: 48 }, // trailer rear
  { cx: 312, r: 48 }, // trailer front
];

const DARK = "#17171A";
const DARKER = "#0F0F12";
const PANEL = "#222227";
const EDGE = "#33333A";

const svgProps = {
  viewBox: `0 0 ${VIEW.w} ${VIEW.h}`,
  preserveAspectRatio: "xMidYMax meet",
  className: "absolute inset-0 h-full w-full",
  "aria-hidden": true,
};

export function useTruckMotion(progress) {
  const vehicleX = useTransform(progress, [0, 0.32, 1], [-720, 0, 150]);
  const boxY = useTransform(progress, [0.22, 0.5], [-840, 0]);
  const wheelRotate = useTransform(progress, [0, 1], [0, 720]);
  const blurOpacity = useTransform(progress, [0.5, 0.6], [0, 0.6]);
  const roadX = useTransform(progress, [0, 1], [0, -340]);
  const backdropX = useTransform(progress, [0, 1], [0, -120]);

  return { vehicleX, boxY, wheelRotate, blurOpacity, roadX, backdropX };
}

export function TruckBackdrop({ x }) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ x }} opacity={0.42}>
        {[
          { x: 60, w: 240, h: 120 },
          { x: 330, w: 150, h: 78 },
          { x: 700, w: 280, h: 140 },
          { x: 1010, w: 190, h: 96 },
        ].map((b) => (
          <g key={b.x}>
            <rect
              x={b.x}
              y={GROUND - b.h}
              width={b.w}
              height={b.h}
              fill="#DEDDD8"
            />
            <rect
              x={b.x}
              y={GROUND - b.h}
              width={b.w}
              height={7}
              fill="#CFCEC8"
            />
            {Array.from({ length: Math.floor(b.w / 34) }).map((_, i) => (
              <rect
                key={i}
                x={b.x + 14 + i * 34}
                y={GROUND - b.h + 26}
                width={18}
                height={26}
                fill="#EDECE7"
              />
            ))}
          </g>
        ))}
        {[210, 620, 940].map((px) => (
          <g key={px} stroke="#D5D4CE" strokeWidth={3} fill="none">
            <line x1={px} y1={GROUND} x2={GROUND - 210} />
            <line x1={px - 22} y1={GROUND - 210} x2={px + 22} y2={GROUND - 210} />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

export function RoadLayer({ x }) {
  return (
    <svg {...svgProps}>
      <line
        x1={0}
        x2={VIEW.w}
        y1={GROUND}
        y2={GROUND}
        stroke="#D8D7D2"
        strokeWidth={1.5}
      />
      <motion.g style={{ x }}>
        {Array.from({ length: 22 }).map((_, i) => (
          <rect
            key={i}
            x={-200 + i * 90}
            y={GROUND + 22}
            width={44}
            height={3}
            fill="#CFCEC8"
          />
        ))}
      </motion.g>
    </svg>
  );
}

export function TruckSpeedBlur({
  x,
  opacity,
}) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ x, opacity }}>
        {[
          { dx: -22, o: 0.13 },
          { dx: -52, o: 0.06 },
        ].map((g) => (
          <g key={g.dx} opacity={g.o}>
            <rect x={240 + g.dx} y={336} width={636} height={160} fill={DARK} />
            <rect x={876 + g.dx} y={330} width={194} height={190} fill={DARK} />
          </g>
        ))}

        {[
          { y: 352, w: 260 },
          { y: 376, w: 150 },
          { y: 412, w: 320 },
          { y: 444, w: 190 },
          { y: 478, w: 260 },
          { y: 512, w: 130 },
          { y: 552, w: 300 },
          { y: 578, w: 170 },
        ].map((s) => (
          <rect
            key={s.y}
            x={225 - s.w}
            y={s.y}
            width={s.w}
            height={2}
            fill="#9A9A97"
            opacity={0.75}
          />
        ))}
        <rect x={45} y={462} width={180} height={2} fill="#FF5B14" opacity={0.85} />
      </motion.g>
    </svg>
  );
}

export function TruckChassis({ x }) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ x }}>
        <rect x={236} y={496} width={648} height={22} fill={DARK} />
        <rect x={236} y={496} width={648} height={5} fill={EDGE} />
        <rect x={284} y={518} width={156} height={22} rx={3} fill={DARKER} />
        <rect x={520} y={518} width={15} height={58} fill={PANEL} />
        <rect x={552} y={518} width={15} height={58} fill={PANEL} />
        <rect x={512} y={572} width={62} height={9} fill={DARKER} />
        <rect x={228} y={500} width={12} height={52} fill={DARKER} />
        <rect x={230} y={528} width={8} height={10} fill="#FF5B14" />
        {[250, 500, 750, 862].map((tx) => (
          <rect key={tx} x={tx} y={488} width={14} height={10} fill={EDGE} />
        ))}
      </motion.g>
    </svg>
  );
}

export function TruckBox({
  x,
  y,
}) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ x }}>
        <motion.g style={{ y }}>
          <rect x={240} y={336} width={636} height={160} fill={DARK} />
          {Array.from({ length: 34 }).map((_, i) => (
            <line
              key={i}
              x1={254 + i * 18}
              x2={254 + i * 18}
              y1={350}
              y2={482}
              stroke="#000"
              strokeOpacity={0.45}
              strokeWidth={2}
            />
          ))}
          <rect x={240} y={336} width={636} height={13} fill={EDGE} />
          <rect x={240} y={483} width={636} height={13} fill={DARKER} />
          {[
            [240, 336],
            [854, 336],
            [240, 474],
            [854, 474],
          ].map(([cx, cy]) => (
            <rect key={`${cx}-${cy}`} x={cx} y={cy} width={22} height={22} fill={EDGE} />
          ))}
          <rect x={240} y={349} width={74} height={134} fill="#000" opacity={0.18} />
          <line x1={277} y1={349} x2={277} y2={483} stroke={EDGE} strokeWidth={2} />
          <text
            x={360}
            y={410}
            fill="#F5F4F1"
            fontSize={38}
            fontWeight={600}
            letterSpacing={9}
            fontFamily="inherit"
          >
            RELOOP
          </text>
          <text
            x={360}
            y={452}
            fill="#F5F4F1"
            opacity={0.55}
            fontSize={19}
            letterSpacing={4}
            fontFamily="inherit"
          >
            GRADE A 3,000 KG
          </text>
        </motion.g>
      </motion.g>
    </svg>
  );
}

export function TruckCab({ x }) {
  return (
    <svg {...svgProps}>
      <motion.g style={{ x }}>
        <rect x={864} y={296} width={14} height={48} fill={PANEL} />
        <path d="M876 330 L1046 330 L1058 352 L876 352 Z" fill={PANEL} />
        <path d="M876 336 L1062 336 Q1072 336 1072 348 L1072 508 L876 508 Z" fill={DARK} />
        <path d="M990 352 L1056 352 Q1064 352 1064 362 L1064 424 L990 424 Z" fill="#BFCEE0" />
        <path d="M990 352 L1024 352 L998 424 L990 424 Z" fill="#FFFFFF" opacity={0.22} />
        <rect x={900} y={356} width={72} height={64} rx={3} fill="#BFCEE0" opacity={0.5} />
        <rect x={1000} y={436} width={68} height={44} rx={3} fill={PANEL} />
        {[444, 456, 468].map((gy) => (
          <rect key={gy} x={1008} y={gy} width={52} height={5} fill={EDGE} />
        ))}
        <rect x={992} y={486} width={80} height={22} rx={3} fill={DARKER} />
        <rect x={1044} y={492} width={26} height={11} fill="#FFC700" opacity={0.9} />
        <rect x={1072} y={356} width={16} height={5} fill={EDGE} />
        <rect x={1084} y={356} width={6} height={26} fill={PANEL} />
        <rect x={884} y={512} width={180} height={7} fill="#FF5B14" />
        <rect x={892} y={508} width={86} height={26} rx={6} fill={PANEL} />
      </motion.g>
    </svg>
  );
}

export function TruckWheel({
  index,
  x,
  rotate,
}) {
  const w = WHEELS[index];
  const cy = GROUND - w.r;
  const r = w.r;
  return (
    <svg {...svgProps}>
      <motion.g style={{ x }}>
        <g transform={`translate(${w.cx} ${cy})`}>
          <motion.g
            style={{
              rotate,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          >
            <circle cx={0} cy={0} r={r} fill={DARKER} />
            <circle cx={0} cy={0} r={r * 0.52} fill={PANEL} />
            <circle cx={0} cy={0} r={r * 0.16} fill={EDGE} />
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={Math.round(Math.cos(a) * r * 0.34 * 100) / 100}
                  cy={Math.round(Math.sin(a) * r * 0.34 * 100) / 100}
                  r={4}
                  fill={EDGE}
                />
              );
            })}
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={Math.round(Math.cos(a) * r * 0.74 * 100) / 100}
                  y1={Math.round(Math.sin(a) * r * 0.74 * 100) / 100}
                  x2={Math.round(Math.cos(a) * r * 0.97 * 100) / 100}
                  y2={Math.round(Math.sin(a) * r * 0.97 * 100) / 100}
                  stroke="#000"
                  strokeOpacity={0.5}
                  strokeWidth={4}
                />
              );
            })}
          </motion.g>
        </g>
      </motion.g>
    </svg>
  );
}

export const WHEEL_COUNT = WHEELS.length;
