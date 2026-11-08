"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  PlusCircle,
  BarChart3,
  GitBranch,
  Users,
  Search,
  Download,
  ArrowRight,
} from "lucide-react";
import { useUiStore } from "@/stores/ui";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import type { Product } from "@/types/api";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();
  const [search, setSearch] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K, and N (new sale), P (products) when not inside input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // If active element is an input, textarea or contenteditable, skip single key shortcuts
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/sales/new");
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        router.push("/products");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen, router]);

  // Debounced search for products
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search || search.length < 2) {
        setProducts([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await apiFetch<Product[]>("/products", {
          params: { q: search, limit: 5 },
        });
        setProducts(res.data || []);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const runCommand = (command: () => void) => {
    setCommandPaletteOpen(false);
    command();
  };

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="overflow-hidden p-0 max-w-xl shadow-2xl border-border bg-card">
        <Command className="**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-3 **:[[cmdk-item]]:py-2.5 **:[[cmdk-item]]:text-xs **:[[cmdk-item]]:rounded-md **:[[cmdk-item]]:cursor-pointer">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search products... (⌘K)"
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              {isLoading ? "Searching..." : "No results found."}
            </Command.Empty>

            {products.length > 0 && (
              <Command.Group heading="Products">
                {products.map((product) => (
                  <Command.Item
                    key={product.id}
                    onSelect={() =>
                      runCommand(() => router.push(`/products?selected=${product.id}`))
                    }
                    className="flex items-center justify-between aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{product.name}</span>
                      <span className="text-muted-foreground num text-[11px]">
                        [{product.sku}]
                      </span>
                    </div>
                    <span className="text-xs num text-emerald-600 dark:text-emerald-400 font-semibold">
                      ৳{product.basePrice.toFixed(2)}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Quick Actions">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/sales/new"))}
                className="flex items-center justify-between aria-selected:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-emerald-600" />
                  <span>New Sale / POS Register</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  N
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/products?action=new"))}
                className="flex items-center justify-between aria-selected:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span>Create New Product</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  P
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/analytics?action=export"))}
                className="flex items-center justify-between aria-selected:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span>Export Report (CSV / PDF)</span>
                </div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                <span>Dashboard Overview</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/products"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Product Catalog</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/categories"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <FolderTree className="h-4 w-4 text-muted-foreground" />
                <span>Categories & Schemas</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/stock"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <Boxes className="h-4 w-4 text-muted-foreground" />
                <span>Inventory & Stock Ledger</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/sales"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span>Sales Orders & Invoices</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/analytics"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span>Financial & Sales Analytics</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/branches"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span>Branch Management</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/users"))}
                className="flex items-center gap-2 aria-selected:bg-accent"
              >
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>User & Team Permissions</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Use <kbd className="font-mono bg-muted px-1 rounded border border-border">↑</kbd> <kbd className="font-mono bg-muted px-1 rounded border border-border">↓</kbd> to navigate</span>
              <span><kbd className="font-mono bg-muted px-1 rounded border border-border">↵</kbd> to select</span>
            </div>
            <div className="flex items-center gap-1">
              <span>ESC to close</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
