/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useReducer } from "react";

type ErrorMessage = { errorMessage?: string };

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

function useEnhancedReducer<R extends EnhancedReducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => EnhancedReducerState<R>
): [EnhancedReducerState<R> & ErrorMessage, EnhancedReducerDispatch<R>] {
  const memoizedReducer = useCallback(enhancedReducer(reducer), []);
  return useReducer(memoizedReducer, initializer(initializerArg));
}

const enhancedReducer =
  <R extends EnhancedReducer<any, any>>(reducer: R) =>
  (
    state: EnhancedReducerState<R> & ErrorMessage,
    action: EnhancedReducerAction<R>
  ): EnhancedReducerState<R> & ErrorMessage => {
    try {
      return reducer[action?.type ?? ""](state, action);
    } catch (e) {
      return {
        ...state,
        errorMessage: String(e),
      };
    }
  };

export type {
  EnhancedReducer,
  EnhancedReducerState,
  EnhancedReducerAction,
  EnhancedReducerDispatch,
};
export { useEnhancedReducer };
