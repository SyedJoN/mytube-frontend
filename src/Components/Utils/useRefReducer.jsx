import { useRef } from "react";

export default function useRefReducer(initialState) {
  const refs = useRef({});
  
  if (Object.keys(refs.current).length === 0) {
    Object.keys(initialState).forEach(key => {
      refs.current[key] = { current: initialState[key] };
    });
  }
  

  const refObject = {};
  Object.keys(initialState).forEach(key => {
    refObject[key] = refs.current[key];
  });
  
  return refObject;
}