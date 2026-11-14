"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  /** Short label rendered beneath the step marker. */
  title: string;
}

export interface StepperProps {
  /** Ordered steps, rendered left to right. */
  steps: readonly StepperStep[];
  /** Zero-based index of the active step. */
  current: number;
  /**
   * When provided, steps before the active one become buttons so the user can
   * navigate backwards. Forward navigation must never be possible here.
   */
  onStepSelect?: (index: number) => void;
  className?: string;
}

/**
 * Horizontal progress indicator for multi-step flows. Uses an ordered list so
 * assistive technology announces position, and marks the active step with
 * `aria-current="step"`.
 */
export function Stepper({ steps, current, onStepSelect, className }: StepperProps) {
  return (
    <ol
      aria-label="Registration progress"
      className={cn("flex w-full items-start", className)}
    >
      {steps.map((step, index) => {
        const isComplete = index < current;
        const isCurrent = index === current;
        const canNavigate = Boolean(onStepSelect) && isComplete;

        const marker = (
          <span
            className={cn(
              "num flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-200",
              isComplete && "border-primary bg-primary text-primary-foreground",
              isCurrent && "border-primary bg-primary/10 text-primary ring-4 ring-primary/10",
              !isComplete &&
                !isCurrent &&
                "border-border bg-background text-muted-foreground"
            )}
          >
            {isComplete ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              index + 1
            )}
          </span>
        );

        return (
          <li key={step.title} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "h-px flex-1",
                  index === 0
                    ? "bg-transparent"
                    : isComplete || isCurrent
                      ? "bg-primary"
                      : "bg-border"
                )}
              />
              {canNavigate ? (
                <button
                  type="button"
                  onClick={() => onStepSelect?.(index)}
                  aria-label={`Go back to step ${index + 1}: ${step.title}`}
                  className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {marker}
                </button>
              ) : (
                <span aria-current={isCurrent ? "step" : undefined}>{marker}</span>
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "h-px flex-1",
                  index === steps.length - 1
                    ? "bg-transparent"
                    : isComplete
                      ? "bg-primary"
                      : "bg-border"
                )}
              />
            </div>
            <span
              className={cn(
                "text-center text-[10px] font-medium uppercase tracking-wider",
                isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
