/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  EnhancedReducer,
  EnhancedReducerAction,
  EnhancedReducerState,
} from "./useEnhancedReducer";

type UndoeableReducerState = { canUndo?: boolean; canRedo?: boolean };
type UndoeableReducerAction =
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET" };

/**
 * @param historyLimit: history that you can go back to
 */
interface UndoeableReducerOptions {
  historyLimit?: number;
}

/**
 * reducer + UNDO, REDO, RESET actions
 * REDO: +1 in future
 * UNDO: -1 in past
 * RESET: initial state
 */
const undoeableReducer = <R extends EnhancedReducer<any, any>>(
  reducer: R,
  initialState: EnhancedReducerState<R>,
  options?: UndoeableReducerOptions
): EnhancedReducer<
  EnhancedReducerState<R> & UndoeableReducerState,
  EnhancedReducerAction<R> | UndoeableReducerAction
> => {
  // history
  let past: Array<EnhancedReducerState<R>> = [];
  let future: Array<EnhancedReducerState<R>> = [];

  const canDo = () => ({
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  });

  const newReducer = { ...reducer };
  // update past on reducer updates
  for (const [key, value] of Object.entries(reducer)) {
    (newReducer[key] as any) = (
      state: EnhancedReducerState<R>,
      action: EnhancedReducerAction<R>
    ): EnhancedReducerState<R> => {
      const present = value(state, action) as EnhancedReducerState<R>;
      past = ensureArrayLimit(options?.historyLimit, [state, ...past]);
      return { ...present, ...canDo() };
    };
  }

  return {
    UNDO: (state, _) => {
      if (past.length <= 0) {
        return { ...state };
      }

      const [newPresent, ...newPast] = past;
      future = ensureArrayLimit(options?.historyLimit, [state, ...future]);
      past = newPast;

      return { ...newPresent, ...canDo() };
    },
    REDO: (state, _) => {
      if (future.length <= 0) {
        return { ...state };
      }

      const [newPresent, ...newFuture] = future;
      past = ensureArrayLimit(options?.historyLimit, [state, ...past]);
      future = newFuture;

      return { ...newPresent, ...canDo() };
    },
    RESET: (_, __) => {
      past = [];
      future = [];
      return { ...initialState, ...canDo() };
    },
    ...newReducer,
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

export default undoeableReducer;
