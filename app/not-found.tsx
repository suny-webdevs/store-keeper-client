import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-4">
        <Store className="h-6 w-6" />
      </div>
      <span className="text-4xl font-semibold num text-foreground">404</span>
      <h1 className="mt-2 text-lg font-medium text-foreground">Page not found</h1>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm">
        The resource or screen you requested does not exist or may have been relocated.
      </p>
      <div className="mt-6">
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard" className="gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
