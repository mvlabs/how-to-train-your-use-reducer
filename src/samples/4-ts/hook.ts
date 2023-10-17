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

function useEnhanchedReducer<R extends EnhanchedReducer<any, any>, I>(
  reducer: R,
  initializerArg: I,
  initializer: (arg: I) => EnhanchedReducerState<R>
): [EnhanchedReducerState<R>, EnhanchedReducerDispatch<R>] {
  const memoizedReducer = useCallback(enhanchedReducer(reducer), []);
  return useReducer(memoizedReducer, initializer(initializerArg));
}

const enhanchedReducer =
  <R extends EnhanchedReducer<any, any>>(reducer: R) =>
  (
    state: EnhanchedReducerState<R>,
    action: EnhanchedReducerAction<R>
  ): EnhanchedReducerState<R> => {
    return reducer[action?.type ?? ""](state, action);
  };

export type {
  EnhanchedReducer,
  EnhanchedReducerState,
  EnhanchedReducerAction,
  EnhanchedReducerDispatch,
};
export { useEnhanchedReducer };
