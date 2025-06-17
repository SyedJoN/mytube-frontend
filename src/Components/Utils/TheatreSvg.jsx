export function TheatreSvg({ isTheatre }) {
  return isTheatre ? (
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <use className="svg-shadow" xlink:href="#id-14"></use>
      <path
        d="m 26,13 0,10 -16,0 0,-10 z m -14,2 12,0 0,6 -12,0 0,-6 z"
        fill="#fff"
        fill-rule="evenodd"
        id="id-14"
      ></path>
    </svg>
  ) : (
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <use className="svg-shadow" xlink:href="#id-15"></use>
      <path
        d="m 28,11 0,14 -20,0 0,-14 z m -18,2 16,0 0,10 -16,0 0,-10 z"
        fill="#fff"
        fill-rule="evenodd"
        id="id-15"
      ></path>
    </svg>
  );
}
