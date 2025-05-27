import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const paths = {
  play: "M 12 26 16 26 16 10 12 10 z M 21 26 25 26 25 10 21 10 z", // morph-compatible triangle
  pause: "M 12 26 L 18.5 22 L 18.5 14 L 12 10 Z M 18.5 22 L 25 18 L 25 18 L 18.5 14 Z" // morph-compatible pause
};

export const MorphingIcon = ({ isPlaying }) => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 36 36"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d={isPlaying ? paths.pause : paths.play}
        animate={{ d: isPlaying ? paths.pause : paths.play }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};
