import { useReducer, useCallback } from "react";

function useEnhancedReducer(reducer, initializerArg, initializer) {
  const memoizedReducer = useCallback(enhancedReducer(reducer), []);
  return useReducer(memoizedReducer, initializer(initializerArg));
}

const enhancedReducer = (reducer) => (state, action) => {
  return reducer[action?.type ?? ""](state, action);
};

export default useEnhancedReducer;
