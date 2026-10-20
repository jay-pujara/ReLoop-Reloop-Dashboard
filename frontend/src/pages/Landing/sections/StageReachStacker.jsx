import React, { useRef, useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import {
  StackerBody,
  StackerBoom,
  StackerDust,
  StackerGround,
  StackerLoad,
  YardBackdrop,
  useStackerMotion,
} from "../art/reach-stacker";
import { PinnedStage, StageLayer, useStage } from "../motion/PinnedStage";
import { SplitText } from "../motion/SplitText";
import { stageStacker } from "../content/site";

function StageScene() {
  const { progress, isMobile, reduced } = useStage();
  const m = useStackerMotion(progress);

  return (
    <div className="absolute inset-x-0 bottom-[14%] top-[34%] md:bottom-[13%] md:left-[26%] md:top-[20%]">
      {!isMobile && (
        <StageLayer z={0}>
          <YardBackdrop x={m.backdropX} />
        </StageLayer>
      )}

      <StageLayer z={1}>
        <StackerGround
          loadX={m.loadShadowX}
          loadScale={m.loadShadowScale}
          loadOpacity={m.loadShadowOp}
        />
      </StageLayer>

      {!isMobile && !reduced && (
        <StageLayer z={2}>
          <StackerDust opacity={m.dustOp} />
        </StageLayer>
      )}

      <StageLayer z={3}>
        <StackerBody />
      </StageLayer>

      <StageLayer z={4}>
        <StackerBoom rotate={m.rotate} />
      </StageLayer>

      <StageLayer z={5}>
        <StackerLoad
          x={m.tipX}
          y={m.tipY}
          whiteOp={m.whiteOp}
          blueOp={m.blueOp}
          orangeOp={m.orangeOp}
        />
      </StageLayer>
    </div>
  );
}

function StageReadout() {
  const { raw } = useStage();
  const [step, setStep] = useState(0);
  const valueRef = useRef(null);

  useMotionValueEvent(raw, "change", (v) => {
    const next = v < 0.33 ? 0 : v < 0.66 ? 1 : 2;
    setStep((cur) => (cur === next ? cur : next));
    if (valueRef.current) {
      valueRef.current.textContent = String(
        Math.round(Math.min(Math.max(v, 0), 1) * 100),
      ).padStart(3, "0");
    }
  });

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-8 md:px-8 md:pb-10">
      <div className="flex flex-col gap-5 border-t border-[var(--line)] pt-5 md:flex-row md:items-end md:justify-between">
        <ol className="flex flex-wrap gap-x-8 gap-y-2">
          {stageStacker.steps.map((s, i) => (
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
                  className={`max-w-[30ch] text-[13px] leading-snug transition-opacity duration-500 ${
                    i === step ? "text-[var(--muted)] opacity-100" : "opacity-0"
                  } hidden md:block`}
                >
                  {s.note}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div className="flex items-baseline gap-2 self-start md:self-auto">
          <span className="eyebrow">Confidence</span>
          <span
            ref={valueRef}
            className="tnum text-[22px] font-medium leading-none tracking-[-0.02em]"
          >
            000
          </span>
          <span className="eyebrow">%</span>
        </div>
      </div>
    </div>
  );
}

export function StageReachStacker() {
  return (
    <PinnedStage
      id="terminal"
      length={320}
      mobileLength={200}
      className="border-t border-[var(--line)]"
      stickyClassName="bg-[var(--bg)]"
    >
      <StageScene />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-10 md:px-8 md:pt-14">
        <div className="flex items-center gap-3">
          <span className="eyebrow tnum">03</span>
          <span className="eyebrow">{stageStacker.eyebrow}</span>
        </div>

        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <SplitText
            as="h2"
            lines={stageStacker.heading}
            className="display max-w-[8ch]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="body-copy max-w-[38ch] md:text-right"
          >
            {stageStacker.copy}
          </motion.p>
        </div>
      </div>

      <StageReadout />
    </PinnedStage>
  );
}
