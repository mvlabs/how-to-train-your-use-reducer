/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useReducer } from "react";

// TODO: create provider for useEnhancedReducer

// TODO: create useSelector with useEnhancedReducer or with state

// TODO: middleware reducer

type ErrorMessage = { errorMessage?: string };

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

function useEnhanchedReducer<R extends EnhanchedReducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => EnhanchedReducerState<R>
): [EnhanchedReducerState<R> & ErrorMessage, EnhanchedReducerDispatch<R>] {
  const memoizedReducer = useCallback(enhancedReducer(reducer), []);
  return useReducer(memoizedReducer, initializer(initializerArg));
}

const enhancedReducer =
  <R extends EnhanchedReducer<any, any>>(reducer: R) =>
  (
    state: EnhanchedReducerState<R> & ErrorMessage,
    action: EnhanchedReducerAction<R>
  ): EnhanchedReducerState<R> & ErrorMessage => {
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
  EnhanchedReducer,
  EnhanchedReducerState,
  EnhanchedReducerAction,
  EnhanchedReducerDispatch,
};
export { useEnhanchedReducer };
