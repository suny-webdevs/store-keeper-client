"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { OfflineIndicator } from "@/components/layout/offline-indicator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUiStore } from "@/stores/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUiStore();

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar className="min-h-screen sticky top-0" />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-60 sm:max-w-60">
          <SheetTitle className="sr-only">Store Navigation</SheetTitle>
          <Sidebar className="border-r-0 h-full" />
        </SheetContent>
      </Sheet>

      {/* Main Workspace Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <main className="flex-1 w-full max-w-350 mx-auto p-4 sm:p-6 space-y-6">
          {children}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <OfflineIndicator />
    </div>
  );
}
