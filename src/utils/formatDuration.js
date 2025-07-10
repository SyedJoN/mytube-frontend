const formatDuration = (duration = 0) => {
  const clamped = Math.max(0, Math.floor(duration));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default formatDuration;
