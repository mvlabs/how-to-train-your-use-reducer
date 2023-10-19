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

  // past: []
  // present: 0
  // future: []
  expect(result.current[0].count).toBe(0);
  expect(result.current[0].canUndo).toBe(undefined);
  expect(result.current[0].canRedo).toBe(undefined);

  // + 1
  act(() => {
    result.current[1]({ type: "increment" });
  });
  // past: [0]
  // present: 1
  // future: []
  expect(result.current[0].count).toBe(1);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(false);

  // - 1
  act(() => {
    result.current[1]({ type: "decrement" });
  });
  // past: [0,1]
  // present: 0
  // future: []
  expect(result.current[0].count).toBe(0);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(false);

  // back to 1
  act(() => {
    result.current[1]({ type: "UNDO" });
  });
  // past: [0]
  // present: 1
  // future: [0]
  expect(result.current[0].count).toBe(1);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(true);

  // 2
  act(() => {
    result.current[1]({ type: "increment" });
  });
  // past: [0,1]
  // present: 2
  // future: [0]
  expect(result.current[0].count).toBe(2);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(true);

  // 0
  act(() => {
    result.current[1]({ type: "REDO" });
  });
  // past: [0,1,2]
  // present: 0
  // future: []
  expect(result.current[0].count).toBe(0);
  expect(result.current[0].canUndo).toBe(true);
  expect(result.current[0].canRedo).toBe(false);

  unmount();
});
