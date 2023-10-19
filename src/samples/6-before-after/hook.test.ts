import { act, renderHook } from "@testing-library/react";
import {
  EnhancedReducer,
  useEnhancedReducer,
} from "../5-split-in-reducers/useEnhancedReducer";
import undoeableReducer from "../5-split-in-reducers/undoeableReducer";
import beforeAfterReducer from "./beforeAfter";

type CounterState = { count: number };
type CounterAction = { type: "increment" } | { type: "decrement" };

const counterReducer: EnhancedReducer<CounterState, CounterAction> = {
  increment: (state) => ({ ...state, count: state.count + 1 }),
  decrement: (state) => ({ ...state, count: state.count - 1 }),
};

test("useEnhancedReducer", () => {
  const { result } = renderHook(
    (count: number) => {
      return useEnhancedReducer(
        undoeableReducer(
          beforeAfterReducer(counterReducer, {
            // before every actions (except decrement) add + 1
            before: [
              {
                callback: (state) => ({ ...state, count: state.count + 1 }),
                actions: { decrement: false },
              },
            ],
          }),
          { count },
          { historyLimit: 10 }
        ),
        count,
        (initial) => ({
          count: initial,
        })
      );
    },
    { initialProps: 0 }
  );

  // past: []
  // present: 0
  // future: []
  expect(result.current[0].count).toBe(0);
  expect(result.current[0].canUndo).toBe(undefined);
  expect(result.current[0].canRedo).toBe(undefined);

  // + 1 + 1
  act(() => {
    result.current[1]({ type: "increment" });
  });
  // past: [0]
  // present: 2
  // future: []
  expect(result.current[0].count).toBe(2);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(false);

  // - 1
  act(() => {
    result.current[1]({ type: "decrement" });
  });
  // past: [0,2]
  // present: 1
  // future: []
  expect(result.current[0].count).toBe(1);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(false);

  // back to 2
  act(() => {
    result.current[1]({ type: "UNDO" });
  });
  // past: [0]
  // present: 2
  // future: [1]
  expect(result.current[0].count).toBe(2);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(true);

  // 4
  act(() => {
    result.current[1]({ type: "increment" });
  });
  // past: [0,2]
  // present: 4
  // future: [1]
  expect(result.current[0].count).toBe(4);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(true);

  // 0
  act(() => {
    result.current[1]({ type: "REDO" });
  });
  // past: [0,2,4]
  // present: 1
  // future: []
  expect(result.current[0].count).toBe(1);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(false);
});
