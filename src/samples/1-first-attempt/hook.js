import { useReducer } from "react";

function useEnhancedReducer(reducer, initializerArg, initializer) {
  return useReducer(enhancedReducer(reducer), initializer(initializerArg));
}
/**
 * no switch, from reducer function to object
 *
 * example:
 *
 * const counterReducer = {
 *  increment: (state, _) => ({ ...state, count: state.count + 1 }),
 *  decrement: (state, _) => ({ ...state, count: state.count - 1 }),
 *  }
*/
const enhancedReducer = (reducer) => (state, action) => {
  return reducer[action?.type ?? ""](state, action);
};

export default useEnhancedReducer;
