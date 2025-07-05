import Slide from "@mui/material/Slide";
import { forwardRef } from "react";

const CustomSlide = forwardRef(function CustomSlide(props, ref) {
  const { in: inProp, timeout = 0, children, ...rest } = props;

  return (
    <Slide
      direction="right"
      in={inProp}
      timeout={timeout}
      ref={ref}
      mountOnEnter
      unmountOnExit 
      onEnter={(node) => {
        node.style.transform = "translate3d(-100%, 0, 0)";
        node.style.transition =
          "transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)";
      }}
      onEntering={(node) => {
        node.style.transition =
          "transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)";
        requestAnimationFrame(() => {
          node.style.transform = "translate3d(0, 0, 0)";
        });
      }}
      onExiting={(node) => {
        node.style.transform = "translate3d(-100%, 0, 0)";
        node.style.transition =
          "transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)";
      }}
      onExited={(node) => {
        node.style.transition =
          "transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)";

        node.style.transition = "";
        node.style.transform = "";
      }}
      {...rest}
    >
      {children}
    </Slide>
  );
});

export default CustomSlide;
