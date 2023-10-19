import { useReducer, useCallback } from "react";
import { enhancedReducer } from "../1-first-attempt/hook-undo";

function useEnhancedReducer(reducer, initializerArg, initializer, options) {
  // cache reducer function on didMount to prevent non pure functions and reducer re-init on component re-render
  const memoizedReducer = useCallback(
    enhancedReducer(reducer, initializer(initializerArg), options),
    []
  );
  return useReducer(memoizedReducer, initializer(initializerArg));
}

export default useEnhancedReducer;
