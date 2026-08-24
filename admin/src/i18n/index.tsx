"use client"

import { createContext, useContext, useCallback, ReactNode } from "react"
import vi from "./vi.json"

type Locale = "vi"
type Translations = typeof vi

interface I18nContextValue {
  locale: Locale
  t: (key: string) => string
}

const translations: Record<Locale, Translations> = { vi }

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) ?? path
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale: Locale = "vi"

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[locale], key)
    },
    []
  )

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useT must be used within I18nProvider")
  return ctx
}
