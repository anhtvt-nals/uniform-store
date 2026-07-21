"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Building2,
  FileText,
  Percent,
  Truck,
  CreditCard,
  Image,
  Activity,
  Settings,
  Shield,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { useT } from "@/i18n"

export function Sidebar() {
  const { t } = useT()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/orders", label: t("nav.orders"), icon: ShoppingCart },
    { href: "/inquiries", label: t("nav.inquiries"), icon: MessageSquare },
    { href: "/products", label: t("nav.products"), icon: Package },
    { href: "/categories", label: t("nav.categories"), icon: Tags },
    { href: "/brands", label: t("nav.brands"), icon: Building2 },
    { href: "/customers", label: t("nav.customers"), icon: Users },
    { href: "/inventory", label: t("nav.inventory"), icon: BarChart3 },
    { href: "/articles", label: t("nav.articles"), icon: FileText },
    { href: "/promotions", label: t("nav.promotions"), icon: Percent },
    { href: "/shipping", label: t("nav.shipping"), icon: Truck },
    { href: "/payment-methods", label: t("nav.payment"), icon: CreditCard },
    { href: "/uploads", label: t("nav.uploads"), icon: Image },
    { href: "/activity-logs", label: t("nav.activityLogs"), icon: Activity },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
    { href: "/permissions", label: t("nav.permissions"), icon: Shield },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className={cn("flex items-center gap-2 font-semibold", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            MA
          </div>
          {!collapsed && <span className="text-sm">Minh An Admin</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn("ml-auto rounded-md p-1 hover:bg-sidebar-accent", collapsed && "ml-0")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
