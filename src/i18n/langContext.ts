import { createContext, useContext } from 'react';
import { STRINGS, type Lang, type Strings } from './strings';

export interface LangContextValue {
  lang: Lang;
  t: Strings;
  toggleLang: () => void;
}

export const LangContext = createContext<LangContextValue>({
  lang: 'en',
  t: STRINGS.en,
  toggleLang: () => {},
});

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
