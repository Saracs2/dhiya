import { createContext, useContext, type Dispatch } from 'react';
import type { SimAction, SimState } from '../domain/types';

export interface SimContextValue {
  state: SimState;
  dispatch: Dispatch<SimAction>;
}

export const SimContext = createContext<SimContextValue | null>(null);

export function useSim(): SimContextValue {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSim must be used inside <SimulationProvider>');
  return ctx;
}
