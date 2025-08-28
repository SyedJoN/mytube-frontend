

export const SkipPreviousSvg = ({scale}) => {
  return (
    <svg
      width="100%"
      transform={`scale(${scale})`}
      height="100%"
      viewBox="0 0 36 36"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="control-svg-fill"
    >
      <use className="svg-shadow" href="#id-4"></use>
      <path
        className="control-svg-fill"
        d="m 12,12 h 2 v 12 h -2 z m 3.5,6 8.5,6 V 12 z"
        id="id-4"
      ></path>
    </svg>
  );
};
