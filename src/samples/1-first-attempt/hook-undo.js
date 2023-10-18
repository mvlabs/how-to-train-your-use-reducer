/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReducer } from "react";

function useEnhancedReducer(
  reducer,
  initializerArg,
  initializer,
  initialState,
  options
) {
  return useReducer(
    enhancedReducer(reducer, initialState, options),
    initializer(initializerArg)
  );
}

const enhancedReducer = (reducer, initialState, options) => {
  // history past
  let past = [];
  // history future
  let future = [];

  // added on state to known if canUndo, canRedo
  const canDo = () => ({
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  });

  return (state, action) => {
    console.log("STATE", state, "ACTIOn", action, "PAST", past);
    // intercept UNDO
    if (action.type === "UNDO") {
      if (past.length <= 0) {
        return { ...state };
      }

      const [newPresent, ...newPast] = past;
      future = ensureArrayLimit(options?.historyLimit, [state, ...future]);
      past = newPast;

      return { ...newPresent, ...canDo() };
    }

    // intercept REDO
    if (action.type === "REDO") {
      if (future.length <= 0) {
        return { ...state };
      }

      const [newPresent, ...newFuture] = future;
      past = ensureArrayLimit(options?.historyLimit, [state, ...past]);
      future = newFuture;

      return { ...newPresent, ...canDo() };
    }

    // intercept RESET
    if (action.type === "RESET") {
      past = [];
      future = [];
      return { ...initialState, ...canDo() };
    }

    // exec Reducer
    const present = reducer(state, action);
    past = ensureArrayLimit(options?.historyLimit, [state, ...past]);
    return { ...present, ...canDo() };
  };
};

function ensureArrayLimit(limit, arr) {
  const n = [...arr];

  if (!limit) return n;

  if (arr.length <= limit) {
    return n;
  }

  const exceedsBy = arr.length - limit;
  n.splice(0, exceedsBy);

  return n;
}

export { enhancedReducer };
export { useEnhancedReducer };
