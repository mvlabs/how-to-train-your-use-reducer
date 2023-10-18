import { act, renderHook } from "@testing-library/react";
import { EnhancedReducer, useEnhancedReducer } from "./hook-undo";

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
        counterReducer,
        count,
        (initial) => ({
          count: initial,
        }),
        { count },
        { historyLimit: 10 }
      );
    },
    { initialProps: 0 }
  );

  expect(result.current[0].count).toBe(0);

  // + 1
  act(() => {
    result.current[1]({ type: "increment" });
  });
  expect(result.current[0].count).toBe(1);

  // -1
  act(() => {
    result.current[1]({ type: "decrement" });
  });
  expect(result.current[0].count).toBe(0);

  // 1
  act(() => {
    result.current[1]({ type: "UNDO" });
  });
  expect(result.current[0].count).toBe(0);
});
