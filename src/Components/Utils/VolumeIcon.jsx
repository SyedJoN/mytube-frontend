import { motion, AnimatePresence } from "framer-motion";
import { animate, createScope, createSpring, createDraggable } from "animejs";
import React from "react";

export const MorphingVolIcon = ({
  volume,
  muted,
  jumpedToMax,
  isIncreased,
  isAnimating,
}) => {
  const isMuted = muted || volume === 0;

  const initialPath =
    "M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z";
  const speakerPath =
    "M 8 21 L 12 21 L 17 26 L 17 10 L 12 15 L 8 15 L 8 21 Z M 19 14 L 19 22 C 20.48 21.32 21.5 19.77 21.5 18 C 21.5 16.26 20.48 14.74 19 14 Z M 18.8 11.29 L 18.8 11.29 C 18.8 11.238 18.8 11.185 18.8 11.133 C 21.875 11.997 24.052 14.745 24.052 18 C 24.052 21.255 21.875 24.003 18.8 24.922 L 18.8 24.71 C 21.79 23.85 23.9 21.17 23.9 18 C 23.9 16.415 23.373 14.953 22.484 13.779 C 21.595 12.605 20.345 11.72 18.8 11.29 Z";

  const highWave =
    "M 8 21 L 12 21 L 17 26 L 17 10 L 12 15 L 8 15 L 8 21 Z M 19 14 L 19 22 C 20.48 21.32 21.5 19.77 21.5 18 C 21.5 16.26 20.48 14.74 19 14 Z M 19 11.29 L 19 11.29 C 19 10.603 19 9.917 19 9.23 C 23.01 10.14 26 13.72 26 18 C 26 22.28 23.01 25.86 19 26.77 L 19 24.71 C 21.89 23.85 24 21.17 24 18 C 24 16.415 23.473 14.953 22.584 13.779 C 21.695 12.605 20.445 11.72 19 11.29 Z";

  const mutedPath =
    "m 21.48,17.98 c 0,-1.77 -1.02,-3.29 -2.5,-4.03 v 2.21 l 2.45,2.45 c .03,-0.2 .05,-0.41 .05,-0.63 z m 2.5,0 c 0,.94 -0.2,1.82 -0.54,2.64 l 1.51,1.51 c .66,-1.24 1.03,-2.65 1.03,-4.15 0,-4.28 -2.99,-7.86 -7,-8.76 v 2.05 c 2.89,.86 5,3.54 5,6.71 z M 9.25,8.98 l -1.27,1.26 4.72,4.73 H 7.98 v 6 H 11.98 l 5,5 v -6.73 l 4.25,4.25 c -0.67,.52 -1.42,.93 -2.25,1.18 v 2.06 c 1.38,-0.31 2.63,-0.95 3.69,-1.81 l 2.04,2.05 1.27,-1.27 -9,-9 -7.72,-7.72 z m 7.72,.99 -2.09,2.08 2.09,2.09 V 9.98 z";
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(() => {
    console.log("isIncreased", isIncreased);
    console.log("jumpedToMax", jumpedToMax);
    console.log("muted", isMuted);

  }, [isIncreased, jumpedToMax, isMuted]);

  const pathArray = React.useMemo(() => {
    if (isMuted && jumpedToMax) return [highWave, highWave, mutedPath];
    if (!isMuted && jumpedToMax) return [highWave, highWave, highWave];
    if (isIncreased && !jumpedToMax) return [speakerPath, highWave, highWave];
    if (isMuted && !jumpedToMax)
      return [speakerPath, highWave, mutedPath];
    return [highWave, speakerPath, initialPath];
  }, [isMuted, isIncreased, jumpedToMax]);

  return (
    <div style={{ width: 36, height: 36 }}>
      <motion.svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="control-svg"
      >
        {!isAnimating && (
          <defs key={isMuted ? "muted" : "unmuted"}>
            <clipPath id="svg-volume-animation-mask">
              <path d="m 14.35,-0.14 -5.86,5.86 20.73,20.78 5.86,-5.91 z"></path>
              <path d="M 7.07,6.87 -1.11,15.33 19.61,36.11 27.80,27.60 z"></path>
              <path
                className={`svg-volume-animation-mover ${isMuted ? "muted" : "unmuted"}`}
                d="M 9.09,5.20 6.47,7.88 26.82,28.77 29.66,25.99 z"
              ></path>
            </clipPath>
            <clipPath id="svg-volume-animation-slash-mask">
              <path
                className={`svg-volume-animation-mover ${isMuted ? "muted" : "unmuted"}`}
                d="m -11.45,-15.55 -4.44,4.51 20.45,20.94 4.55,-4.66 z"
              ></path>
            </clipPath>
          </defs>
        )}

        <use className="svg-shadow" href="#id-2"></use>
        <use className="svg-shadow" href="#id-3"></use>

        <>
          <motion.path
            id="id-2"
            initial={{
              d: pathArray[0],
            }}
            animate={{
              d: pathArray,
            }}
            transition={{
              duration: 0.5,
              times: [0, 0.5, 1],
              ease: [0.5, 0.1, 0.8, 0.6],
            }}
            clipPath={!isMuted ? "url(#svg-volume-animation-mask)" : undefined}
          />

          {!isAnimating && (
            <path
              className="ytp-svg-fill ytp-svg-volume-animation-hider"
              clipPath="url(#svg-volume-animation-slash-mask)"
              d="M 9.25,9 7.98,10.27 24.71,27 l 1.27,-1.27 Z"
              fill="#fff"
              id="id-3"
              style={{ display: hasMounted ? "block" : "none" }}
            ></path>
          )}
        </>
      </motion.svg>
    </div>
  );
};
