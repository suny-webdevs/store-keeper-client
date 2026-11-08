"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  GitBranch,
  LogOut,
  User,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUiStore } from "@/stores/ui";
import { useBranches } from "@/hooks/use-branches";
import { useMe } from "@/hooks/use-me";
import { createClient } from "@/lib/supabase/client";

export function Topbar() {
  const router = useRouter();
  const { toggleMobileMenu, setCommandPaletteOpen, activeBranchId, setActiveBranchId } =
    useUiStore();
  const { data: me } = useMe();
  const { branches, isLoading: branchesLoading } = useBranches();

  // If activeBranchId is null but branches are loaded, select first active branch
  React.useEffect(() => {
    if (!activeBranchId && branches && branches.length > 0) {
      setActiveBranchId(branches[0].id);
    }
  }, [branches, activeBranchId, setActiveBranchId]);

  const activeBranch = branches?.find((b) => b.id === activeBranchId) || branches?.[0];

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Remove dev auth cookie
      document.cookie = "dev_auth_session=; path=/; max-age=0";
      document.cookie = "csrf_token=; path=/; max-age=0";
    } catch {
      // Ignore
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="md:hidden text-muted-foreground"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Branch Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 border-border/80 bg-card px-2.5 text-xs font-medium text-foreground hover:bg-accent"
            >
              <GitBranch className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="max-w-32.5 truncate sm:max-w-45">
                {activeBranch ? activeBranch.name : branchesLoading ? "Loading..." : "Select Branch"}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
              Select Operating Branch
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {branches?.map((branch) => (
              <DropdownMenuItem
                key={branch.id}
                onClick={() => setActiveBranchId(branch.id)}
                className="flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{branch.name}</span>
                  <span className="text-[10px] text-muted-foreground num">
                    Code: {branch.code}
                  </span>
                </div>
                {activeBranch?.id === branch.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/branches")}
              className="text-xs text-primary font-medium cursor-pointer"
            >
              Manage all branches →
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3">
        {/* Search / Command Palette Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCommandPaletteOpen(true)}
          className="h-8 gap-2 border-border/80 bg-card px-3 text-xs text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground hidden sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search or command...</span>
          <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative h-8 gap-2 rounded-full px-2 text-xs hover:bg-muted"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                {me?.fullName ? me.fullName.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="hidden lg:inline-block font-medium text-foreground max-w-30 truncate">
                {me?.fullName || "Store Admin"}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60 hidden lg:inline-block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold leading-none text-foreground">
                  {me?.fullName || "Store Administrator"}
                </p>
                <p className="text-[11px] leading-none text-muted-foreground">
                  {me?.email || "admin@storekeeper.dev"}
                </p>
                <div className="pt-1">
                  <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                    {me?.globalRole || "OWNER"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/users")}
              className="text-xs cursor-pointer"
            >
              <User className="mr-2 h-3.5 w-3.5" />
              <span>Team & Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/analytics")}
              className="text-xs cursor-pointer"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              <span>Performance Insights</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-xs text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
