import { useState } from "react";

export default function useStateReducer(initialState) {
  const [state, setState] = useState(initialState);

  const updateState = (changes) =>
    setState((prev) => {
      if (typeof changes === "function") {
        const result = changes(prev);
        return { ...prev, ...result };
      }
      return { ...prev, ...changes };
    });
    return {state, updateState}
}
