import React from "react";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period?: string;
  };
  icon?: LucideIcon;
  subtitle?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  subtitle,
  className,
}: KpiCardProps) {
  const isPositive = change && change.value >= 0;

  return (
    <Card className={cn("p-5 flex flex-col justify-between transition-colors", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-3xl font-semibold num text-foreground tracking-tight">
          {value}
        </div>

        {(change !== undefined || subtitle) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {change !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center font-medium num",
                  isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                )}
                {Math.abs(change.value)}%
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              {change?.period || subtitle || "vs previous period"}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
