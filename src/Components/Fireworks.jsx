import { useEffect, useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadFireworksPreset } from "@tsparticles/preset-fireworks";

const Fireworks = ({ onComplete }) => {
  const particlesInit = useCallback(async (engine) => {
    await loadFireworksPreset(engine);
  }, []);

  return (
    <Particles
      init={particlesInit}
      options={{
        preset: "fireworks",
        fullScreen: { enable: false }, // Keeps fireworks inside the container
        detectRetina: true,
        background: { color: "transparent" },
      }}
    />
  );
};

export default Fireworks;
