import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { createInitialState, simReducer } from '../simulation/engine';
import { SimContext } from './simContext';

const TICK_MS = 250;
/** Cap a single tick so a backgrounded tab doesn't jump hours when it returns. */
const MAX_TICK_S = 1;

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simReducer, undefined, () => createInitialState());

  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const realDtS = Math.min(MAX_TICK_S, (now - last) / 1000);
      last = now;
      dispatch({ type: 'tick', realDtS });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <SimContext.Provider value={value}>{children}</SimContext.Provider>;
}
