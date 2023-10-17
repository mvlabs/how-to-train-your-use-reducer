import { useReducer } from "react";

function useEnhancedReducer(reducer, initializerArg, initializer) {
  return useReducer(reducer, initializer(initializerArg));
}

export default useEnhancedReducer;
