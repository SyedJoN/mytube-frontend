import { motion, AnimatePresence } from "framer-motion";
import { animate, createScope, createSpring, createDraggable } from "animejs";
import React from "react";

export const MorphingVolIcon = ({
  volume,
  muted,
  jumpedToMax,
  isIncreased,
}) => {
  const isMuted = muted || volume === 0;

  const initialPath =
    "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z";
  const speakerPath =
    "M 8 21 L 12 21 L 17 26 L 17 10 L 12 15 L 8 15 L 8 21 Z M 19 14 L 19 22 C 20.48 21.32 21.5 19.77 21.5 18 C 21.5 16.26 20.48 14.74 19 14 Z M 19 11.29 L 19 11.29 C 19 11.238 19 11.185 19 11.133 C 21.975 11.997 24.152 14.745 24.152 18 C 24.152 21.255 21.975 24.003 19 24.922 L 19 24.71 C 21.89 23.85 24 21.17 24 18 C 24 16.415 23.473 14.953 22.584 13.779 C 21.695 12.605 20.445 11.72 19 11.29 Z";

  const highWave =
    "M 8 21 L 12 21 L 17 26 L 17 10 L 12 15 L 8 15 L 8 21 Z M 19 14 L 19 22 C 20.48 21.32 21.5 19.77 21.5 18 C 21.5 16.26 20.48 14.74 19 14 Z M 19 11.29 L 19 11.29 C 19 10.603 19 9.917 19 9.23 C 23.01 10.14 26 13.72 26 18 C 26 22.28 23.01 25.86 19 26.77 L 19 24.71 C 21.89 23.85 24 21.17 24 18 C 24 16.415 23.473 14.953 22.584 13.779 C 21.695 12.605 20.445 11.72 19 11.29 Z";
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    console.log("isIncreased", isIncreased);
  }, [isIncreased]);

  return (
    <div style={{ width: 36, height: 36 }}>
      <motion.svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        className="volSvg"
      >
        <defs>
          <mask id="diagonal-cutout" maskUnits="userSpaceOnUse">
            <rect width="36" height="36" fill="white" />
            <AnimatePresence>
              {isMuted && (
                <motion.path
                  key="mask-line" // Required for AnimatePresence to track it properly
                  d="M 8.6 10 L 25.3 26.6"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="butt"
                  transform={"translate(2, 0)"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  exit={{ pathLength: 0 }}
                  transition={{
                    duration: !jumpedToMax ? 0.7 : 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              )}
            </AnimatePresence>
          </mask>
        </defs>

        <use className="ytp-svg-shadow" href="#ytp-id-85"></use>
        <use className="ytp-svg-shadow" href="#ytp-id-86"></use>
        <use className="ytp-svg-shadow" href="#ytp-id-87"></use>
        <use className="ytp-svg-shadow" href="#ytp-id-88"></use>
        <use className="ytp-svg-shadow" href="#ytp-id-89"></use>

        <motion.path
          id="ytp-id-85"
          d={speakerPath}
          initial={{ d: speakerPath }}
          animate={{
            d: isIncreased
              ? [speakerPath, highWave, highWave]
              : [highWave, speakerPath, initialPath],
          }}
          transition={{ duration: 0.8, times: [0, 0.5, 1], ease: [0.7, 0, 0.3, 1]  }}
          mask="url(#diagonal-cutout)"
        />

        <AnimatePresence>
          {isMuted && !jumpedToMax && (
            <>
              <motion.path
                d="M 8.6 10 L 25.3 26.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                stroke="white"
                exit={{ pathLength: 0 }}
                strokeWidth="2"
                strokeLinecap="butt"
              />
              <motion.path
                d={speakerPath}
                initial={{
                  d: speakerPath,
                }}
                animate={{ d: [speakerPath, highWave, highWave] }}
                exit={{ d: [speakerPath, speakerPath, initialPath] }}
               transition={{ duration: 0.8, times: [0, 0.5, 1], ease: [0.7, 0, 0.3, 1]  }}
                mask="url(#diagonal-cutout)"
              />
            </>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isMuted && jumpedToMax && (
            <>
              <motion.path
                id="ytp-id-89"
                d="m -11,-11.45 -1.22, 1.22 18, 18 1.22,-1.22 z"
                initial={{ transform: "translate(-10px, -10px)" }}
                animate={{ transform: "translate(20px, 20px)" }}
                exit={{
                  transform: [
                    "translate(10px, 10px)",
                    "translate(2px, 2px)",
                    "translate(-10px, -10px)",
                  ],
                }}
                transition={{ duration: 0.4, times: [0, 0.5, 1] }}
              />

              <motion.path
                d={highWave}
                initial={highWave}
                mask="url(#diagonal-cutout)"
              />
            </>
          )}
        </AnimatePresence>
      </motion.svg>
    </div>
  );
};
