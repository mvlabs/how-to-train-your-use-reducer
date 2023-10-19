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
  // store every state  passing by
  let past = [];

  // store actions undone
  let future = [];

  // utility used to know if undo or redo are possible
  const can = () => ({
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  });

  return (state, action) => {
    // ignore action without key type
    if (!("type" in action)) {
      return state;
    }

    // intercept UNDO
    if (action.type === "UNDO") {
      // if undo is not possible, no change is possible
      if (!can().canUndo) {
        return { ...state };
      }

      // if undo is possible
      // first element in the past is the new present
      const [newPresent, ...newPast] = past;
      // new future is current state plus old future
      future = ensureHistoryLimit(options?.historyLimit, [state, ...future]);
      // update past without its first element
      past = newPast;

      // return new state and utility
      return { ...newPresent, ...can() };
    }

    // intercept REDO
    // same as UNDO
    if (action.type === "REDO") {
      if (!can().canRedo) {
        return { ...state };
      }

      const [newPresent, ...newFuture] = future;
      past = ensureHistoryLimit(options?.historyLimit, [state, ...past]);
      future = newFuture;

      return { ...newPresent, ...can() };
    }

    // intercept RESET
    if (action.type === "RESET") {
      // reset both histories and return initial state
      past = [];
      future = [];
      return { ...initialState, ...can() };
    }

    // reducer actions
    const present = reducer(state, action);
    // update past history with present state
    past = ensureHistoryLimit(options?.historyLimit, [state, ...past]);
    return { ...present, ...can() };
  };
};

/**
 *  avoid array (past/future history) to become endless via limit
 */
function ensureHistoryLimit(limit, arr) {
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
