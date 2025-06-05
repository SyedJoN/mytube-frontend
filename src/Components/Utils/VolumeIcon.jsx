import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";

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
    "M 19 11.29 C 21.89 12.15 24 14.83 24 18 C 24 21.17 21.89 23.85 19 24.71 L 19 26.77 C 23.01 25.86 26 22.28 26 18 C 26 13.72 23.01 10.14 19 9.23 L 19 11.29 Z";


  return (
    <div style={{ width: 36, height: 36 }}>
      <motion.svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {isMuted && jumpedToMax && (
            <mask id="diagonal-cutout" maskUnits="userSpaceOnUse">
              <rect width="36" height="36" fill="white" />
            
              <polygon
                fill="black"
                points="  9.3,9.8 11.8,9.8 28.3,26.5 26.3,26.5"
              />
            </mask>
          )}
        </defs>

        <motion.path
          d={speakerPath}
          initial={false}
          mask="url(#diagonal-cutout)"
        />

        <AnimatePresence>
          {isIncreased && (
            <motion.path
              d={highWave}
              initial={{ opacity: 0, clipPath: "ellipse(0% 0% at 0% 50%)" }}
              animate={{ opacity: 1, clipPath: "ellipse(100% 50% at 0% 50%)" }}
              exit={{ opacity: 0, clipPath: "ellipse(0% 0% at 0% 50%)" }}
              transition={{ duration: 0.7 }}
              mask="url(#diagonal-cutout)"
            />
          )}
        </AnimatePresence>
        {/* Volume waves - shown when not muted */}

        {/* {isIncreased && !jumpedToMax && (
          <>
            <motion.path
              d={highWave}
              initial={{ opacity: 0, transform: "scale(0)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              transition={{ duration: 0.3 }}
            />
          </>
        )} */}

        {volume > 0 && (
          <>
            <motion.path
              d="M 8.6 10 L 25.3 26.6"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 0 }}
              transition={{ duration: 0.3 }}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="butt"
            />
            <motion.path
              d={highWave}
              initial={{ opacity: 1, clipPath: "ellipse(100% 50% at 0% 50%)" }}
              animate={{ opacity: 0, clipPath: "ellipse(0% 0% at 0% 50%)" }}
              transition={{ duration: 0.7 }}
            />
          </>
        )}

        {isMuted && !jumpedToMax && (
          <>
            <motion.path
              d="M 8.6 10 L 25.3 26.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="butt"
            />
            <motion.path
              d={highWave}
              initial={{ opacity: 0, clipPath: "ellipse(0% 0% at 0% 50%)" }}
              animate={{ opacity: 1, clipPath: "ellipse(100% 50% at 0% 50%)" }}
              transition={{ duration: 0.5 }}
            />
          </>
        )}

        {isMuted && jumpedToMax && (
          <>
            {/* Diagonal line */}
            <motion.path
              d="M 8.6 10 L 25.3 26.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4 }}
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
            {volume === 1 && (
              <motion.path
                d="M 8.6 10 L 25.3 26.6"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: 0 }}
                transition={{ duration: 0.3 }}
                stroke="white"
                strokeWidth="2"
                strokeLinecap="butt"
              />
            )}
            <motion.path d={highWave} initial={false} />
          </>
        )}
      </motion.svg>
    </div>
  );
};
