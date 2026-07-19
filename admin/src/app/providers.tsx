"use client"

import { QueryProvider } from "@/contexts/query-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
