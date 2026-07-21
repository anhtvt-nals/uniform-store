"use client"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import { LanguagePicker } from "./language-picker"
import { useT } from "@/i18n"
import Link from "next/link"

export function Header() {
  const { user, logout } = useAuth();
  const { t } = useT();

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : "A";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex-1" />
      <LanguagePicker />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 hover:bg-accent">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
            <User className="h-4 w-4" />
            {t("header.profile")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="h-4 w-4" />
            {t("header.signOut")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
