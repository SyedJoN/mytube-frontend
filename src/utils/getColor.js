 import React from "react";
 import {
   deepPurple,
   indigo,
   blue,
   teal,
   green,
   amber,
   orange,
   red,
 } from "@mui/material/colors";


 function getColor(name = "") {
    const colors = [
      deepPurple[500],
      indigo[500],
      blue[500],
      teal[500],
      green[500],
      amber[500],
      orange[500],
      red[500],
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index] || blue[500]; // Default to blue if something goes wrong
  }

  export {
    getColor
  }