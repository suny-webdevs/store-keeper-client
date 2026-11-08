"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary triggered:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Something went wrong
      </h2>
      <p className="mt-2 text-xs text-muted-foreground max-w-md">
        {error.message || "An unexpected error occurred while loading this view. You can retry the request or return to the main dashboard."}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} variant="default" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard" className="gap-2">
            <Home className="h-3.5 w-3.5" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
