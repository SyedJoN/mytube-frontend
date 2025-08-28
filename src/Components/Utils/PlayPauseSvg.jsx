
import { motion, AnimatePresence } from 'framer-motion';

const paths = {
  play: "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z",
  pause: "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z" 
};
export const PlayPauseSvg = ({ isPlaying, scale = 1 }) => {

  return (
    <motion.svg
      width="100%"
      height="100%"
      transform={`scale(${scale})`}
      viewBox="0 0 36 36"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="control-svg-fill"
    >
        <use className="svg-shadow" href="#id-1"></use>

     <motion.path
     id="id-1"
  d={paths[isPlaying ? "play" : "pause"] ?? ""}
  initial={{ d: paths["pause"] ?? "" }}
  animate={{ d: paths[isPlaying ? "play" : "pause"] ?? "" }}
  transition={{ duration: 0.3 }}

/>
    </motion.svg>
  );
};

