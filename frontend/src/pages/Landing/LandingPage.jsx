import React, { useEffect } from "react";
import "./landing.css";
import { LenisProvider } from "./motion/LenisProvider";
import { RevealProvider } from "./motion/RevealProvider";
import { Preloader } from "./sections/Preloader";
import { UtilityBar } from "./sections/UtilityBar";
import { Nav } from "./sections/Nav";
import { Hero } from "./sections/Hero";
import { Manifesto } from "./sections/Manifesto";
import { StatsBand } from "./sections/StatsBand";
import { StageReachStacker } from "./sections/StageReachStacker";
import { ServicesGrid } from "./sections/ServicesGrid";
import { MaterialsGrid } from "./sections/MaterialsGrid";
import { StageTruck } from "./sections/StageTruck";
import { FeatureCards } from "./sections/FeatureCards";
import { Footer } from "./sections/Footer";

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.dataset.theme = "light";
    window.scrollTo(0, 0);

    return () => {
      document.documentElement.dataset.theme = "light";
    };
  }, []);

  return (
    <div className="landing-root min-h-screen">
      <RevealProvider>
        <LenisProvider>
          <Preloader />
          <UtilityBar />
          <Nav />
          <main>
            <Hero />
            <Manifesto />
            <StatsBand />
            <StageReachStacker />
            <ServicesGrid />
            <MaterialsGrid />
            <StageTruck />
            <FeatureCards />
          </main>
          <Footer />
        </LenisProvider>
      </RevealProvider>
    </div>
  );
}
