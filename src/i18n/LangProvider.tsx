import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LangContext } from './langContext';
import { STRINGS, type Lang } from './strings';

const STORAGE_KEY = 'dhiya.lang';

/** `?lang=ar` / `?lang=en` in the URL wins (handy for a kiosk link), then the saved choice. */
function readInitialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (fromUrl === 'ar' || fromUrl === 'en') return fromUrl;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readInitialLang);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = lang === 'ar' ? 'ضياء — ذكاء الطاقة الشمسية' : 'DHIYA — Smart Solar Intelligence';
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage may be unavailable (private mode); language still works for the session.
    }
  }, [lang]);

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'ar' : 'en')), []);
  const value = useMemo(() => ({ lang, t: STRINGS[lang], toggleLang }), [lang, toggleLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
