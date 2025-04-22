import React from "react";

export default function X({ size = 24, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: "block",
        marginBottom: "6px",
        ...style,
      }}
    >
      <rect width="192" height="192" rx="96" fill="black" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M42 47H76L100 78.5L127 47H144L107.5 88.5L150 145H117L91 111L61 145H44L83 100.5L42 47ZM62 57H71.5L130.5 135H121.5L62 57Z"
        fill="white"
      />
    </svg>
  );
}
