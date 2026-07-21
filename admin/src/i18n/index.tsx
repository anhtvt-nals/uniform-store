"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import vi from "./vi.json"
import en from "./en.json"

type Locale = "vi" | "en"
type Translations = typeof vi

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const translations: Record<Locale, Translations> = { vi, en }

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) ?? path
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("admin-locale") as Locale) || "vi"
    }
    return "vi"
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("admin-locale", newLocale)
  }, [])

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[locale], key)
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useT must be used within I18nProvider")
  return ctx
}
