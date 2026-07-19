import type { Metadata } from "next"
import { Toaster } from "sonner"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Minh An Admin",
  description: "Admin Dashboard for Minh An Uniform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
