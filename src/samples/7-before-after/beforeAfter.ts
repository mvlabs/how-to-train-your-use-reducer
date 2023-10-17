/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  EnhanchedReducer,
  EnhanchedReducerAction,
  EnhanchedReducerState,
} from "../6-split-in-reducers/useEnhancedReducer";

export interface StepsBaseAction<R extends EnhanchedReducer<any, any>> {
  callback: (state: EnhanchedReducerState<R>) => EnhanchedReducerState<R>;
  /**
   * default = whitelist
   */
  actions?: { [Act in EnhanchedReducerAction<R>["type"]]?: boolean };
}
type Before<R extends EnhanchedReducer<any, any>> = StepsBaseAction<R>;
type After<R extends EnhanchedReducer<any, any>> = StepsBaseAction<R>;

interface Options<R extends EnhanchedReducer<any, any>> {
  /**
   * Must be a pure function.
   *
   * Before actions are executes in order. Every (before) action use the state processed by the previous (before) action
   */
  before?: Before<R>[];
  /**
   * Must be a pure function
   *
   * After actions are executes in order. Every (after) action use the state processed by the previous (after) action
   */
  after?: After<R>[];
}

const beforeAfterReducer = <R extends EnhanchedReducer<any, any>>(
  reducer: R,
  options?: Options<R>
): R => {
  const newReducer = { ...reducer };

  // update past on reducer updates
  for (const [key, value] of Object.entries(reducer)) {
    (newReducer[key] as any) = (
      state: EnhanchedReducerState<R>,
      action: EnhanchedReducerAction<R>
    ): EnhanchedReducerState<R> => {
      let newState = state;
      const type = action.type as EnhanchedReducerAction<R>["type"];

      // before
      for (const before of options?.before ?? []) {
        if (before.actions?.[type] ?? true) {
          newState = before.callback(newState);
        }
      }

      // current
      newState = value(newState, action);

      // after
      for (const after of options?.after ?? []) {
        if (after.actions?.[type] ?? true) {
          newState = after.callback(newState);
        }
      }

      return newState;
    };
  }

  return newReducer;
};

export default beforeAfterReducer;
