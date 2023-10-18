/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useReducer } from "react";

/**
 * ts create an object iterating for every different type of Action
 */
type EnhancedReducer<State, Actions extends { type: string }> = {
  [Act in Actions["type"]]: (
    state: State,
    action: Actions extends { type: Act } ? Actions : never
  ) => State;
};

type EnhancedReducerState<R extends EnhancedReducer<any, any>> =
  R extends EnhancedReducer<infer S, any> ? S : never;
type EnhancedReducerAction<R extends EnhancedReducer<any, any>> =
  R extends EnhancedReducer<any, infer A> ? A : never;

type EnhancedReducerDispatch<R extends EnhancedReducer<any, any>> = (
  action: EnhancedReducerAction<R>
) => void;

interface UndoeableReducerOptions {
  historyLimit?: number;
}

type UndoeableReducerState = { canUndo?: boolean; canRedo?: boolean };
type UndoeableReducerAction =
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET" };
type UndoeableReducerDispatch<R extends EnhancedReducer<any, any>> = (
  action: EnhancedReducerAction<R> | UndoeableReducerAction
) => void;

function useEnhancedReducer<R extends EnhancedReducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => EnhancedReducerState<R>,
  initialState: EnhancedReducerState<R>,
  options?: UndoeableReducerOptions
): [
  EnhancedReducerState<R> & UndoeableReducerState,
  UndoeableReducerDispatch<R>
] {
  const memoizedReducer = useCallback(
    enhancedReducer(reducer, initialState, options),
    []
  );
  return useReducer(memoizedReducer, initializer(initializerArg));
}

const enhancedReducer = <R extends EnhancedReducer<any, any>>(
  reducer: R,
  initialState: EnhancedReducerState<R>,
  options?: UndoeableReducerOptions
) => {
  // history
  let past: Array<EnhancedReducerState<R>> = [];
  let future: Array<EnhancedReducerState<R>> = [];

  const canDo = () => ({
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  });

  return (
    state: EnhancedReducerState<R> & UndoeableReducerState,
    action: EnhancedReducerAction<R> | UndoeableReducerAction
  ): EnhancedReducerState<R> & UndoeableReducerState => {
    if (!("type" in action)) {
      return state;
    }

    if (action.type === "UNDO") {
      if (past.length <= 0) {
        return { ...state };
      }

      const [newPresent, ...newPast] = past;
      future = ensureArrayLimit(options?.historyLimit, [state, ...future]);
      past = newPast;

      return { ...newPresent, ...canDo() };
    }

    if (action.type === "REDO") {
      if (future.length <= 0) {
        return { ...state };
      }

      const [newPresent, ...newFuture] = future;
      past = ensureArrayLimit(options?.historyLimit, [state, ...past]);
      future = newFuture;

      return { ...newPresent, ...canDo() };
    }

    if (action.type === "RESET") {
      past = [];
      future = [];
      return { ...initialState, ...canDo() };
    }

    return reducer[(action as EnhancedReducerAction<R>).type](state, action);
  };
};

function ensureArrayLimit<T>(limit: number | undefined, arr: T[]): T[] {
  const n = [...arr];

  if (!limit) return n;

  if (arr.length <= limit) {
    return n;
  }

  const exceedsBy = arr.length - limit;
  n.splice(0, exceedsBy);

  return n;
}

export type {
  EnhancedReducer,
  EnhancedReducerState,
  EnhancedReducerAction,
  EnhancedReducerDispatch,
};
export { useEnhancedReducer };
