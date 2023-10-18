/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  EnhancedReducer,
  EnhancedReducerAction,
  EnhancedReducerState,
} from "../5-split-in-reducers/useEnhancedReducer";

export interface StepsBaseAction<R extends EnhancedReducer<any, any>> {
  callback: (state: EnhancedReducerState<R>) => EnhancedReducerState<R>;
  /**
   * default = whitelist
   */
  actions?: { [Act in EnhancedReducerAction<R>["type"]]?: boolean };
}
type Before<R extends EnhancedReducer<any, any>> = StepsBaseAction<R>;
type After<R extends EnhancedReducer<any, any>> = StepsBaseAction<R>;

interface Options<R extends EnhancedReducer<any, any>> {
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

const beforeAfterReducer = <R extends EnhancedReducer<any, any>>(
  reducer: R,
  options?: Options<R>
): R => {
  const newReducer = { ...reducer };

  // update past on reducer updates
  for (const [key, value] of Object.entries(reducer)) {
    (newReducer[key] as any) = (
      state: EnhancedReducerState<R>,
      action: EnhancedReducerAction<R>
    ): EnhancedReducerState<R> => {
      let newState = state;
      const type = action.type as EnhancedReducerAction<R>["type"];

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
