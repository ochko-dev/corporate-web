"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  LOCALE_COOKIE,
  locales,
  localeFlags,
  localeNames,
  type Locale,
} from "@/src/lib/i18n/config";
import enMessages from "@/messages/en.json";
import mnMessages from "@/messages/mn.json";

const messagesByLocale: Record<Locale, typeof enMessages> = {
  en: enMessages,
  mn: mnMessages,
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: readonly Locale[];
  localeNames: Record<Locale, string>;
  localeFlags: Record<Locale, string>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocaleSwitcher() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocaleSwitcher must be used within LocaleProvider");
  }
  return ctx;
}

/** Client-side locale switching without URL-based routing (this project's
 *  Next.js renamed `middleware` to `proxy`, which next-intl's routing
 *  helpers don't target — so locale state lives here instead, persisted to
 *  a cookie and read server-side by the root layout for the first paint). */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;

      const root = document.documentElement;
      root.classList.add("locale-transitioning");
      window.setTimeout(() => {
        setLocaleState(next);
        window.setTimeout(() => {
          root.classList.remove("locale-transitioning");
        }, 30);
      }, 160);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, locales, localeNames, localeFlags }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messagesByLocale[locale]}
        timeZone="Asia/Ulaanbaatar"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
