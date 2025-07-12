import React from "react";

export const FullScreenSvg = React.memo(({ isFullscreen }) => {
  return isFullscreen ? (
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <g className="fullscreen-btn-corner-2">
        <use className="svg-shadow" href="#id-10"></use>
        <path
          className="control-svg-fill"
          d="m 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z"
          id="id-10"
        ></path>
      </g>
      <g className="fullscreen-btn-corner-3">
        <use className="svg-shadow" href="#id-11"></use>
        <path
          className="control-svg-fill"
          d="m 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z"
          id="id-11"
        ></path>
      </g>
      <g className="fullscreen-btn-corner-0">
        <use className="svg-shadow" href="#id-12"></use>
        <path
          className="control-svg-fill"
          d="m 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z"
          id="id-12"
        ></path>
      </g>
      <g className="fullscreen-btn-corner-1">
        <use className="svg-shadow" href="#id-13"></use>
        <path
          className="control-svg-fill"
          d="m 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z"
          id="id-13"
        ></path>
      </g>
    </svg>
  ) : (
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <g className="fullscreen-btn-corner-0">
        <use className="svg-shadow" href="#id-6"></use>
        <path
          className="control-svg-fill"
          d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"
          id="id-6"
        ></path>
      </g>
      <g className="fullscreen-btn-corner-1">
        <use className="svg-shadow" href="#id-7"></use>
        <path
          className="control-svg-fill"
          d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"
          id="id-7"
        ></path>
      </g>
      <g className="fullscreen-btn-corner-2">
        <use className="svg-shadow" href="#id-8"></use>
        <path
          className="control-svg-fill"
          d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"
          id="id-8"
        ></path>
      </g>
      <g className="fullscreen-btn-corner-3">
        <use className="svg-shadow" href="#id-9"></use>
        <path
          className="control-svg-fill"
          d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"
          id="id-9"
        ></path>
      </g>
    </svg>
  );
});
