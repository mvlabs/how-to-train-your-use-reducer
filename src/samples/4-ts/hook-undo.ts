/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useReducer } from "react";

/**
 * ts create an object iterating for every different type of Action
 */
type EnhanchedReducer<State, Actions extends { type: string }> = {
  [Act in Actions["type"]]: (
    state: State,
    action: Actions extends { type: Act } ? Actions : never
  ) => State;
};

type EnhanchedReducerState<R extends EnhanchedReducer<any, any>> =
  R extends EnhanchedReducer<infer S, any> ? S : never;
type EnhanchedReducerAction<R extends EnhanchedReducer<any, any>> =
  R extends EnhanchedReducer<any, infer A> ? A : never;

type EnhanchedReducerDispatch<R extends EnhanchedReducer<any, any>> = (
  action: EnhanchedReducerAction<R>
) => void;

interface UndoeableReducerOptions {
  historyLimit?: number;
}

type UndoeableReducerState = { canUndo?: boolean; canRedo?: boolean };
type UndoeableReducerAction =
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET" };
type UndoeableReducerDispatch<R extends EnhanchedReducer<any, any>> = (
  action: EnhanchedReducerAction<R> | UndoeableReducerAction
) => void;

function useEnhanchedReducer<R extends EnhanchedReducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => EnhanchedReducerState<R>,
  initialState: EnhanchedReducerState<R>,
  options?: UndoeableReducerOptions
): [
  EnhanchedReducerState<R> & UndoeableReducerState,
  UndoeableReducerDispatch<R>
] {
  const memoizedReducer = useCallback(
    enhancedReducer(reducer, initialState, options),
    []
  );
  return useReducer(memoizedReducer, initializer(initializerArg));
}

const enhancedReducer = <R extends EnhanchedReducer<any, any>>(
  reducer: R,
  initialState: EnhanchedReducerState<R>,
  options?: UndoeableReducerOptions
) => {
  // history
  let past: Array<EnhanchedReducerState<R>> = [];
  let future: Array<EnhanchedReducerState<R>> = [];

  const canDo = () => ({
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  });

  return (
    state: EnhanchedReducerState<R> & UndoeableReducerState,
    action: EnhanchedReducerAction<R> | UndoeableReducerAction
  ): EnhanchedReducerState<R> & UndoeableReducerState => {
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

    return reducer[(action as EnhanchedReducerAction<R>).type](state, action);
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
  EnhanchedReducer,
  EnhanchedReducerState,
  EnhanchedReducerAction,
  EnhanchedReducerDispatch,
};
export { useEnhanchedReducer };
