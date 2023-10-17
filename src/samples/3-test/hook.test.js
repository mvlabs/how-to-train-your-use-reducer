import { act, renderHook } from "@testing-library/react";
import useEnhancedReducer from "../2-fix-function-cache/hook";
import { test, expect } from "vitest";

const counterReducer = {
  increment: (state) => ({ ...state, count: state.count + 1 }),
  decrement: (state) => ({ ...state, count: state.count - 1 }),
};

test("useEnhancedReducer", () => {
  const { result, unmount } = renderHook(
    (count) => {
      return useEnhancedReducer(counterReducer, count, (initial) => ({
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

  unmount();
});
