type LocalizedValue = Record<string, unknown>;

/** Converts API text that may be localized JSON into a render-safe string. */
export function getLocalizedText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;

  const localized = value as LocalizedValue;
  for (const locale of ["vi", "en", "de"]) {
    const text = localized[locale];
    if (typeof text === "string" && text.trim()) return text;
  }

  return fallback;
}
