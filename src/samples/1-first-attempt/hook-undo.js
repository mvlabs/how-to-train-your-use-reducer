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
  let pastHistory = [];

  // store actions undone
  let futureHistory = [];

  // utility used to know if undo or redo are possible
  const can = () => ({
    undo: pastHistory.length > 0,
    redo: futureHistory.length > 0,
  });

  return (state, action) => {
    
    console.log("STATE", state, "ACTION", action, "PAST", pastHistory);
    
    // intercept UNDO
    if (action.type === "UNDO") { 
      
      // if undo is not possible, no change is possible 
      if (!can().undo) {
        return { ...state };
      }

      // if undo is possible
      // first element in the past is the new present
      const [newPresent, ...newPast] = pastHistory;
      // new future is current state plus old future
      // avoid forward history (future states) to become endless via options
      futureHistory = ensureHistoryLimit(options?.historyLimit, [state, ...futureHistory]);
      // update past without its first element
      pastHistory = newPast;

      // return new state and utility
      return { ...newPresent, ...canDo() };
    
    }

    // intercept REDO
    // same as UNDO
    if (action.type === "REDO") {
      if (!canDo().canRedo) {
        return { ...state };
      }

      const [newPresent, ...newFuture] = futureHistory;
      pastHistory = ensureHistoryLimit(options?.historyLimit, [state, ...pastHistory]);
      futureHistory = newFuture;

      return { ...newPresent, ...canDo() };
    }

    // intercept RESET
    if (action.type === "RESET") {
      // reset both histories and return
      pastHistory = [];
      futureHistory = [];
      return { ...initialState, ...canDo() };
    }

    // if passing through with no action provided for this reducer
    // exec Reducer
    const present = reducer(state, action);

    // update past history with present state
    pastHistory = ensureHistoryLimit(options?.historyLimit, [state, ...pastHistory]);
    // clear future history
    futureHistory = [];
    return { ...present, ...canDo() };
  };
};

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
