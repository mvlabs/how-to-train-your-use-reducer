import { act, renderHook } from "@testing-library/react";
import { EnhanchedReducer, useEnhanchedReducer } from "./hook";

type CounterState = { count: number; errorMessage?: string };
type CounterAction = { type: "increment" } | { type: "decrement" };

const counterReducer: EnhanchedReducer<CounterState, CounterAction> = {
  increment: (state) => ({ ...state, count: state.count + 1 }),
  decrement: (state) => ({ ...state, count: state.count - 1 }),
};

test("useEnhanchedReducer", () => {
  const { result } = renderHook(
    (count: number) => {
      return useEnhanchedReducer(counterReducer, count, (initial) => ({
        count: initial,
      }));
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
});
