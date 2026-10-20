import React, { useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import {
  RoadLayer,
  TruckBackdrop,
  TruckBox,
  TruckCab,
  TruckChassis,
  TruckSpeedBlur,
  TruckWheel,
  WHEEL_COUNT,
  useTruckMotion,
} from "../art/truck";
import {
  PinnedStage,
  StageLayer,
  useStage,
} from "../motion/PinnedStage";
import { SplitText } from "../motion/SplitText";
import { stageTruck } from "../content/site";

function TruckScene() {
  const { progress, isMobile, reduced } = useStage();
  const m = useTruckMotion(progress);

  const wheels = Array.from({ length: WHEEL_COUNT }, (_, i) => i);

  return (
    <div className="absolute inset-x-0 bottom-[14%] top-[36%] md:bottom-[12%] md:left-[20%] md:top-[32%]">
      {!isMobile && (
        <StageLayer z={0}>
          <TruckBackdrop x={m.backdropX} />
        </StageLayer>
      )}

      <StageLayer z={1}>
        <RoadLayer x={m.roadX} />
      </StageLayer>

      {!isMobile && !reduced && (
        <StageLayer z={2}>
          <TruckSpeedBlur x={m.vehicleX} opacity={m.blurOpacity} />
        </StageLayer>
      )}

      <StageLayer z={3}>
        <TruckChassis x={m.vehicleX} />
      </StageLayer>

      {wheels.map((i) => (
        <StageLayer key={i} z={4}>
          <TruckWheel index={i} x={m.vehicleX} rotate={m.wheelRotate} />
        </StageLayer>
      ))}

      <StageLayer z={5}>
        <TruckBox x={m.vehicleX} y={m.boxY} />
      </StageLayer>

      <StageLayer z={6}>
        <TruckCab x={m.vehicleX} />
      </StageLayer>
    </div>
  );
}

function TruckReadout() {
  const { raw } = useStage();
  const [step, setStep] = useState(0);
  const speedRef = useRef(null);

  useMotionValueEvent(raw, "change", (v) => {
    const next = v < 0.34 ? 0 : v < 0.64 ? 1 : 2;
    setStep((cur) => (cur === next ? cur : next));
    if (speedRef.current) {
      const speed = v < 0.6 ? 0 : Math.round(((v - 0.6) / 0.4) * 88);
      speedRef.current.textContent = String(speed).padStart(2, "0");
    }
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-8 md:px-8 md:pb-10">
      <div className="flex flex-col gap-5 border-t border-[var(--line)] pt-5 md:flex-row md:items-end md:justify-between">
        <ol className="flex flex-wrap gap-x-8 gap-y-2">
          {stageTruck.steps.map((s, i) => (
            <li key={s.at} className="flex items-baseline gap-3">
              <span
                className={`tnum text-[12px] tracking-[0.12em] transition-colors duration-500 ${
                  i === step ? "text-[#ff5b14]" : "text-[var(--faint)]"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col">
                <span
                  className={`text-[14px] font-medium transition-colors duration-500 ${
                    i === step ? "text-[var(--fg)]" : "text-[var(--faint)]"
                  }`}
                >
                  {s.at}
                </span>
                <span
                  className={`hidden max-w-[30ch] text-[13px] leading-snug transition-opacity duration-500 md:block ${
                    i === step ? "text-[var(--muted)] opacity-100" : "opacity-0"
                  }`}
                >
                  {s.note}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="flex items-baseline gap-2 self-start md:self-auto">
          <span className="eyebrow">Road speed</span>
          <span
            ref={speedRef}
            className="tnum text-[22px] font-medium leading-none tracking-[-0.02em]"
          >
            00
          </span>
          <span className="eyebrow">km/h</span>
        </div>
      </div>
    </div>
  );
}

export function StageTruck() {
  return (
    <PinnedStage
      id="haulage"
      length={340}
      mobileLength={210}
      className="border-t border-[var(--line)]"
      stickyClassName="bg-[var(--bg)]"
    >
      <TruckScene />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-10 md:px-8 md:pt-14">
        <div className="flex items-center gap-3">
          <span className="eyebrow tnum">06</span>
          <span className="eyebrow">{stageTruck.eyebrow}</span>
        </div>

        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <SplitText
            as="h2"
            lines={stageTruck.heading}
            className="display max-w-[8ch]"
          />
          <p className="body-copy max-w-[38ch] md:text-right mt-4">
            {stageTruck.copy}
          </p>
        </div>
      </div>

      <TruckReadout />
    </PinnedStage>
  );
}
