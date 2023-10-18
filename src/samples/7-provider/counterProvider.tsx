import { createContext, useContext } from "react";
import {
  EnhancedReducer,
  EnhancedReducerDispatch,
  useEnhancedReducer,
} from "../5-split-in-reducers/useEnhancedReducer";

type CounterState = { count: number };
type CounterAction = { type: "increment" } | { type: "decrement" };

const counterReducer: EnhancedReducer<CounterState, CounterAction> = {
  increment: (state) => ({ ...state, count: state.count + 1 }),
  decrement: (state) => ({ ...state, count: state.count - 1 }),
};

const CounterContext = createContext<CounterState>({ count: 0 });
const CounterDispatchContext = createContext<
  EnhancedReducerDispatch<EnhancedReducer<CounterState, CounterAction>>
>(() => {});

interface Props {
  initialCount?: number;
  children: JSX.Element;
}

function TaskProvider(props: Props) {
  const [state, dispatch] = useEnhancedReducer(
    counterReducer,
    props.initialCount ?? 0,
    (initial) => ({ count: initial })
  );

  return (
    <CounterContext.Provider value={state}>
      <CounterDispatchContext.Provider value={dispatch}>
        {props.children}
      </CounterDispatchContext.Provider>
    </CounterContext.Provider>
  );
}

function useCounter() {
  return useContext(CounterContext);
}

function useDispatchCounter() {
  return useContext(CounterDispatchContext);
}

export { useCounter, useDispatchCounter };
export default TaskProvider;
