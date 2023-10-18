import { act, renderHook } from "@testing-library/react";
import useEnhancedReducer from "../2-fix-function-cache/hook";
import { test, expect } from "vitest";

function counterReducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + 1 };

    case "decrement":
      return { ...state, count: state.count - 1 };

    default:
      return state;
  }
}

test("useEnhancedReducer", () => {
  const { result, unmount } = renderHook(
    (count) => {
      return useEnhancedReducer(
        counterReducer,
        count,
        (initial) => ({
          count: initial,
        }),
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
  expect(result.current[0].count).toBe(1);

  unmount();
});
