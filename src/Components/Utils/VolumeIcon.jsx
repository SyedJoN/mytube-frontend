import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export const MorphingVolIcon = ({
  volume,
  muted,
  jumpedToMax,
  isIncreased,
}) => {
  const isMuted = muted || volume === 0;

  const speakerPath =
    "M 8 21 L 12 21 L 17 26 L 17 10 L 12 15 L 8 15 L 8 21 19 14 L 19 22 C 20.48 21.32 21.5 19.77 21.5 18 C 21.5 16.26 20.48 14.74 19 14 Z";

  const highWave =
    "M 8 21 L 12 21 L 17 26 L 17 10 L 12 15 L 8 15 L 8 21 Z M 19 14 L 19 22 C 20.48 21.32 21.5 19.77 21.5 18 C 21.5 16.26 20.48 14.74 19 14 Z M 19 11.29 L 19 11.29 L 19 9.23 C 23.01 10.14 26 13.72 26 18 C 26 22.28 23.01 25.86 19 26.77 L 19 24.71 C 21.89 23.85 24 21.17 24 18 C 24 14.83 21.89 12.15 19 11.29";
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  React.useEffect(()=> {
    console.log("isINcreased",isIncreased)
    console.log("jumpedToMax",jumpedToMax)
    console.log("volume",volume)
  }, [isIncreased, jumpedToMax, volume])
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
            {/* Full white background to start with full visibility */}
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
                  exit={{ pathLength: 0, }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
            </AnimatePresence>
          </mask>
        </defs>
      <AnimatePresence>
          <motion.path
            d={speakerPath}
            initial={false}
            mask={"url(#diagonal-cutout)"}
          />
      </AnimatePresence>
        <AnimatePresence>
  {isIncreased && (
     
    <motion.path
            mask={"url(#diagonal-cutout)"}
      d={highWave}
      initial={
        hasMounted ? { clipPath: "ellipse(38% 38% at 50% 50%)" } : false
      }
      animate={{ clipPath: "ellipse(50% 50% at 50% 50%)" }}
      exit={{ clipPath: "ellipse(38% 38% at 50% 50%)" }}
       transition={{
      animate: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },  // Slow grow
      exit: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }       // Fast exit
      
    }}
    />
 
  )}
</AnimatePresence>

        {volume > 0 && (
          <>
            <motion.path
              d="M 8.6 10 L 25.3 26.6"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1]}}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="butt"
            />
            <motion.path
              d={highWave}
              initial={{ clipPath: "ellipse(50% 50% at 50% 50%)" }}
              animate={{ clipPath: "ellipse(38% 38% at 50% 50%)" }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1]}}
              mask={"url(#diagonal-cutout)"}
            />
          </>
        )}

        {isMuted && !jumpedToMax && (
          <>
            <motion.path
              d="M 8.6 10 L 25.3 26.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="butt"
            />
            <motion.path
              d={highWave}
              initial={{ clipPath: "ellipse(38% 38% at 50% 50%)" }}
              animate={{ clipPath: "ellipse(50% 50% at 50% 50%)" }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1]  }}
              mask="url(#diagonal-cutout)"
            />
          </>
        )}

        {isMuted && jumpedToMax && (
          <>
            {/* Diagonal line */}
            <motion.path
              d="M 8.6 10 L 25.3 26.6"
              initial={{ pathLength: 0, opacity: 0,}}
              animate={{ pathLength: 1, opacity: 1}}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              stroke="white"
              strokeWidth={2}
              strokeLinecap="butt"
            />

            {/* High wave with mask */}
            <motion.path
              d={highWave}
              initial={false}
              mask="url(#diagonal-cutout)"
            />
          </>
        )}

        {!isMuted && jumpedToMax && (
          <>
            <motion.path
              d="M 8.6 10 L 25.3 26.6"
              initial={{ pathLength: 1, opacity: 1, }}
              animate={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="butt"
            />

            <motion.path
              d={highWave}
              initial={false}
              mask="url(#diagonal-cutout)"
            />
          </>
        )}
      </motion.svg>
    </div>
  );
};
