

export const SkipNextSvg = ({scale}) => {
  return (
    <svg
      width="100%"
      height="100%"
      transform={`scale(${scale})`}
      viewBox="0 0 36 36"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="control-svg-fill"
    >
      <use className="svg-shadow" href="#id-5"></use>
      <path
        className="control-svg-fill"
        d="M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z"
        id="id-5"
      ></path>
    </svg>
  );
};
