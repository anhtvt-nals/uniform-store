"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/quotes", label: "Báo giá từ form" },
  { href: "/inquiries", label: "Yêu cầu theo sản phẩm" },
];

export function QuoteModuleTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex w-fit rounded-lg border bg-muted/40 p-1" aria-label="Loại yêu cầu báo giá">
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors",
          pathname === tab.href && "bg-background text-foreground shadow-sm",
        )}>{tab.label}</Link>
      ))}
    </nav>
  );
}
