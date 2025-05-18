 const handleMouseDown = (e, expanded) => {
   if (e.button === 2) {
    return;
  }
 const target = e.currentTarget.querySelector(":scope > vt-interaction");

  if (!target) return;

  target.classList.add("down");
  target.classList.remove("animate");
   if (expanded) {
      target.classList.remove("down");
      target.classList.remove("animate");
    }
  
  const onMouseUp = () => {
    target.classList.remove("down");
    target.classList.add("animate");
 if (expanded) {
      target.classList.remove("animate");
    }
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("pointerup", onMouseUp);

};

export default handleMouseDown;