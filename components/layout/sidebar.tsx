"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  BarChart3,
  GitBranch,
  Users,
  Store,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sales", label: "Sales & Orders", icon: ShoppingCart, badge: "POS" },
  { href: "/stock", label: "Inventory & Stock", icon: Boxes },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/branches", label: "Branches", icon: GitBranch },
  { href: "/users", label: "Team & Access", icon: Users },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setMobileMenuOpen } = useUiStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0 select-none",
        sidebarCollapsed ? "w-16" : "w-60",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Link
          href="/dashboard"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2.5 overflow-hidden font-medium"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0 shadow-xs">
            <Store className="h-4 w-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold tracking-tight text-sm text-foreground leading-none">
                Store Keeper
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
                Retail & Inventory
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <Button
          asChild
          size="sm"
          className={cn(
            "w-full bg-primary text-primary-foreground font-medium transition-all shadow-xs",
            sidebarCollapsed ? "px-0 justify-center" : "justify-start gap-2"
          )}
        >
          <Link href="/sales/new" onClick={() => setMobileMenuOpen(false)}>
            <Plus className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>New Sale (POS)</span>}
          </Link>
        </Button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-0.5 px-2 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                sidebarCollapsed && "justify-center px-0"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!sidebarCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="border-t border-border p-2 hidden md:block">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-muted-foreground hover:text-foreground"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </Button>
      </div>
    </aside>
  );
}
