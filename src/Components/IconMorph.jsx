
import { motion, AnimatePresence } from 'framer-motion';

const paths = {
  play: "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z",
  pause: "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z" 
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
  d={paths[isPlaying ? "pause" : "play"] ?? ""}
  initial={{ d: paths[isPlaying ? "pause" : "play"] ?? "" }}
  animate={{ d: paths[isPlaying ? "pause" : "play"] ?? "" }}
  transition={{ duration: 0.3 }}
  fill="white"
/>
    </motion.svg>
  );
};

