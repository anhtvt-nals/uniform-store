"use client"

import { useT } from "@/i18n"
import { Globe } from "lucide-react"

export function LanguagePicker() {
  const { locale, setLocale } = useT()

  return (
    <button
      onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
    >
      <Globe className="h-4 w-4" />
      <span className="text-xs font-medium">{locale === "vi" ? "EN" : "VI"}</span>
    </button>
  )
}
