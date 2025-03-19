const formatDuration = (duration) => {
    const totalSeconds = Math.floor(duration); // Remove decimals
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
  
    return `${minutes}:${seconds.toString().padStart(2, "0")}`; // Ensures 2-digit seconds
  };
  

  export default formatDuration