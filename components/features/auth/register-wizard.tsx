"use client";

import * as React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from "lucide-react";
import {
  registerTenantSchema,
  type BusinessType,
  type RegisterCurrency,
  type RegisterTenantInput,
} from "@/lib/schemas";
import { registerTenantAction } from "@/app/(auth)/register/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/ui/stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = [
  {
    title: "Business",
    heading: "Business details",
    description:
      "This names your workspace and sets the default currency for pricing and reports.",
    icon: Building2,
  },
  {
    title: "Owner",
    heading: "Owner account",
    description:
      "You will sign in with this account and hold full OWNER access to the workspace.",
    icon: UserRound,
  },
  {
    title: "Branch",
    heading: "First branch",
    description:
      "Sales, stock and reports are scoped to a branch. You can add more branches later.",
    icon: MapPin,
  },
] as const;

/** Fields validated by each step's "Continue" action. */
const STEP_FIELDS: ReadonlyArray<ReadonlyArray<keyof RegisterTenantInput>> = [
  ["businessName", "slug", "businessType", "currency"],
  ["fullName", "email", "password", "confirmPassword"],
  ["branchName", "branchCode", "branchAddress", "branchPhone"],
];

const BUSINESS_TYPE_OPTIONS: ReadonlyArray<{ value: BusinessType; label: string }> = [
  { value: "RETAIL", label: "Retail store" },
  { value: "GROCERY", label: "Grocery / supermarket" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "FASHION", label: "Fashion & apparel" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "RESTAURANT", label: "Restaurant / cafe" },
  { value: "OTHER", label: "Other" },
];

const CURRENCY_OPTIONS: ReadonlyArray<{
  value: RegisterCurrency;
  label: string;
  short: string;
}> = [
  { value: "BDT", label: "BDT — ৳ Bangladeshi Taka", short: "BDT (৳)" },
  { value: "USD", label: "USD — $ US Dollar", short: "USD ($)" },
  { value: "EUR", label: "EUR — € Euro", short: "EUR (€)" },
  { value: "INR", label: "INR — ₹ Indian Rupee", short: "INR (₹)" },
  { value: "GBP", label: "GBP — £ Pound Sterling", short: "GBP (£)" },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
}

function toBranchCode(value: string): string {
  const firstWord = value.trim().toUpperCase().split(/\s+/)[0] ?? "";
  return firstWord.replace(/[^A-Z0-9]/g, "").slice(0, 10);
}

function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface FieldProps {
  htmlFor: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ htmlFor, label, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label id={`${htmlFor}-label`} htmlFor={htmlFor}>
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[11px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface ReviewRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function ReviewRow({ label, value, mono }: ReviewRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "truncate text-right font-medium text-foreground",
          mono && "num text-[11px] leading-4"
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

export function RegisterWizard() {
  const [step, setStep] = React.useState(0);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<{ email: string; demo: boolean } | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const slugTouched = React.useRef(false);
  const codeTouched = React.useRef(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterTenantInput>({
    resolver: zodResolver(registerTenantSchema),
    mode: "onTouched",
    defaultValues: {
      businessName: "",
      slug: "",
      businessType: "RETAIL",
      currency: "BDT",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      branchName: "",
      branchCode: "",
      branchAddress: "",
      branchPhone: "",
    },
  });

  const values = watch();
  const meta = STEPS[step];
  const StepIcon = meta.icon;
  const isLastStep = step === STEPS.length - 1;

  /* Derive the workspace URL from the business name until the user edits it. */
  React.useEffect(() => {
    if (slugTouched.current) return;
    setValue("slug", slugify(values.businessName), { shouldValidate: false });
  }, [values.businessName, setValue]);

  /* Derive a branch code suggestion from the branch name until edited. */
  React.useEffect(() => {
    if (codeTouched.current) return;
    setValue("branchCode", toBranchCode(values.branchName), { shouldValidate: false });
  }, [values.branchName, setValue]);

  /* Move focus to the step heading so keyboard and screen-reader users follow. */
  React.useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const goNext = async () => {
    setServerError(null);
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (valid) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }
  };

  const goBack = () => {
    setServerError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const submit = handleSubmit(async (formValues) => {
    setServerError(null);
    try {
      const result = await registerTenantAction(formValues);
      if (result.ok) {
        setCreated({ email: formValues.email, demo: result.demo });
        toast.success(
          result.demo ? "Workspace created (demo mode)" : "Workspace created successfully"
        );
      } else {
        setServerError(result.error);
        toast.error(result.error);
      }
    } catch {
      const message = "We could not create your workspace. Please try again.";
      setServerError(message);
      toast.error(message);
    }
  });

  /* Enter advances the wizard outside the final step without a second submit button. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter" || isLastStep) return;
    const target = event.target as HTMLElement;
    if (target.closest("[role='combobox']") || target.tagName === "TEXTAREA") return;
    event.preventDefault();
    void goNext();
  };

  const businessTypeLabel =
    BUSINESS_TYPE_OPTIONS.find((option) => option.value === values.businessType)?.label ?? "—";
  const currencyLabel =
    CURRENCY_OPTIONS.find((option) => option.value === values.currency)?.short ??
    "Select currency";

  const passwordChecks = [
    { label: "8+ characters", ok: values.password.length >= 8 },
    { label: "a letter", ok: /[A-Za-z]/.test(values.password) },
    { label: "a number", ok: /[0-9]/.test(values.password) },
  ];

  if (created) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <Card className="border border-border bg-card p-6 shadow-xs">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h1 className="text-sm font-semibold tracking-tight text-foreground">
                  Workspace created
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sign in with{" "}
                  <span className="font-medium text-foreground">{created.email}</span> to start
                  managing {getValues("businessName") || "your business"}.
                </p>
              </div>
              {created.demo && (
                <p className="rounded-md border border-border bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  Demo mode — the API has no tenant-registration endpoint yet, so nothing was
                  saved on the server.
                </p>
              )}
              <Button asChild className="w-full">
                <Link href="/login">
                  Go to sign in
                  <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Store className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Create your workspace
          </h1>
          <p className="text-xs text-muted-foreground">
            Set up your business, owner account and first branch in three steps.
          </p>
        </div>

        <Card className="border border-border bg-card shadow-xs">
          <div className="border-b border-border p-5 pb-4">
            <Stepper
              steps={STEPS}
              current={step}
              onStepSelect={isSubmitting ? undefined : setStep}
            />
          </div>

          <form onSubmit={submit} onKeyDown={handleKeyDown} noValidate className="p-5">
            <p className="sr-only" role="status" aria-live="polite">
              Step {step + 1} of {STEPS.length}: {meta.title}
            </p>

            <div className="mb-5 flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground">
                <StepIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-sm font-semibold tracking-tight text-foreground focus:outline-none"
                >
                  {meta.heading}
                </h2>
                <p className="text-xs text-muted-foreground">{meta.description}</p>
              </div>
            </div>

            {serverError && (
              <div
                role="alert"
                className="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive"
              >
                {serverError}
              </div>
            )}

            {/* Step 1 — Business */}
            {step === 0 && (
              <div className="space-y-4">
                <Field
                  htmlFor="businessName"
                  label="Business name"
                  error={errors.businessName?.message}
                >
                  <Input
                    id="businessName"
                    placeholder="e.g. Dhaka Retail Co."
                    autoComplete="organization"
                    aria-invalid={Boolean(errors.businessName)}
                    aria-describedby={describedBy("businessName", errors.businessName?.message)}
                    className={errors.businessName ? "border-destructive" : ""}
                    {...register("businessName")}
                  />
                </Field>

                <Field
                  htmlFor="slug"
                  label="Workspace URL"
                  error={errors.slug?.message}
                  hint="Lowercase letters, numbers and hyphens. This becomes your workspace address."
                >
                  <div className="flex">
                    <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted/60 px-2.5 text-[11px] text-muted-foreground">
                      storekeeper.app/
                    </span>
                    <Input
                      id="slug"
                      value={values.slug}
                      onChange={(event) => {
                        slugTouched.current = true;
                        setValue("slug", slugify(event.target.value), {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      aria-invalid={Boolean(errors.slug)}
                      aria-describedby={describedBy("slug", errors.slug?.message, "hint")}
                      className={cn("num rounded-l-none", errors.slug && "border-destructive")}
                    />
                  </div>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    htmlFor="businessType"
                    label="Business type"
                    error={errors.businessType?.message}
                  >
                    <Controller
                      control={control}
                      name="businessType"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="businessType"
                            aria-labelledby="businessType-label"
                            className="text-xs sm:text-sm"
                          >
                            <SelectValue placeholder="Select type">
                              {businessTypeLabel}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>

                  <Field
                    htmlFor="currency"
                    label="Default currency"
                    error={errors.currency?.message}
                  >
                    <Controller
                      control={control}
                      name="currency"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="currency"
                            aria-labelledby="currency-label"
                            className="text-xs sm:text-sm"
                          >
                            <SelectValue placeholder="Select currency">
                              {currencyLabel}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* Step 2 — Owner account */}
            {step === 1 && (
              <div className="space-y-4">
                <Field htmlFor="fullName" label="Full name" error={errors.fullName?.message}>
                  <Input
                    id="fullName"
                    placeholder="e.g. Rafiq Ahmed"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={describedBy("fullName", errors.fullName?.message)}
                    className={errors.fullName ? "border-destructive" : ""}
                    {...register("fullName")}
                  />
                </Field>

                <Field
                  htmlFor="email"
                  label="Work email"
                  error={errors.email?.message}
                  hint="You will use this address to sign in."
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@store.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={describedBy("email", errors.email?.message, "hint")}
                    className={errors.email ? "border-destructive" : ""}
                    {...register("email")}
                  />
                </Field>

                <Field htmlFor="password" label="Password" error={errors.password?.message}>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={describedBy("password", errors.password?.message, "hint")}
                      className={cn("num pr-9", errors.password && "border-destructive")}
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute right-0 top-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <ul
                    aria-live="polite"
                    className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-[11px]"
                  >
                    {passwordChecks.map((check) => (
                      <li
                        key={check.label}
                        className={cn(
                          "flex items-center gap-1",
                          check.ok ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {check.ok ? (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <X className="h-3 w-3" aria-hidden="true" />
                        )}
                        {check.label}
                      </li>
                    ))}
                  </ul>
                </Field>

                <Field
                  htmlFor="confirmPassword"
                  label="Confirm password"
                  error={errors.confirmPassword?.message}
                >
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={describedBy(
                        "confirmPassword",
                        errors.confirmPassword?.message
                      )}
                      className={cn("num pr-9", errors.confirmPassword && "border-destructive")}
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      aria-pressed={showConfirmPassword}
                      className="absolute right-0 top-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </Field>

                <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3">
                  <ShieldCheck
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    This account becomes the{" "}
                    <span className="font-medium text-foreground">OWNER</span> of{" "}
                    {values.businessName || "your workspace"} and can invite admins, managers and
                    cashiers later.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 — First branch */}
            {step === 2 && (
              <div className="space-y-4">
                <Field
                  htmlFor="branchName"
                  label="Branch name"
                  error={errors.branchName?.message}
                >
                  <Input
                    id="branchName"
                    placeholder="e.g. Gulshan Flagship Store"
                    autoComplete="off"
                    aria-invalid={Boolean(errors.branchName)}
                    aria-describedby={describedBy("branchName", errors.branchName?.message)}
                    className={errors.branchName ? "border-destructive" : ""}
                    {...register("branchName")}
                  />
                </Field>

                <Field
                  htmlFor="branchCode"
                  label="Branch code"
                  error={errors.branchCode?.message}
                  hint="Shown on receipts and used in stock transfers. Max 10 characters."
                >
                  <Input
                    id="branchCode"
                    placeholder="e.g. GULSHAN"
                    value={values.branchCode}
                    onChange={(event) => {
                      codeTouched.current = true;
                      setValue(
                        "branchCode",
                        event.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9-]/g, "")
                          .slice(0, 10),
                        { shouldValidate: true, shouldDirty: true }
                      );
                    }}
                    aria-invalid={Boolean(errors.branchCode)}
                    aria-describedby={describedBy(
                      "branchCode",
                      errors.branchCode?.message,
                      "hint"
                    )}
                    className={cn("num uppercase", errors.branchCode && "border-destructive")}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    htmlFor="branchPhone"
                    label="Contact phone (optional)"
                    error={errors.branchPhone?.message}
                  >
                    <Input
                      id="branchPhone"
                      placeholder="+880 1711-000111"
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.branchPhone)}
                      aria-describedby={describedBy("branchPhone", errors.branchPhone?.message)}
                      className={cn("num", errors.branchPhone && "border-destructive")}
                      {...register("branchPhone")}
                    />
                  </Field>

                  <Field
                    htmlFor="branchAddress"
                    label="Address (optional)"
                    error={errors.branchAddress?.message}
                  >
                    <Input
                      id="branchAddress"
                      placeholder="Road 11, Gulshan-1, Dhaka"
                      autoComplete="street-address"
                      aria-invalid={Boolean(errors.branchAddress)}
                      aria-describedby={describedBy("branchAddress", errors.branchAddress?.message)}
                      className={errors.branchAddress ? "border-destructive" : ""}
                      {...register("branchAddress")}
                    />
                  </Field>
                </div>

                <div className="rounded-md border border-border bg-muted/40 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Review
                  </p>
                  <dl className="space-y-1.5 text-[11px]">
                    <ReviewRow
                      label="Business"
                      value={`${values.businessName || "—"} · ${businessTypeLabel}`}
                    />
                    <ReviewRow
                      label="Workspace"
                      value={values.slug ? `storekeeper.app/${values.slug}` : "—"}
                      mono
                    />
                    <ReviewRow
                      label="Owner"
                      value={`${values.fullName || "—"} · ${values.email || "—"}`}
                    />
                    <ReviewRow
                      label="Branch"
                      value={`${values.branchName || "—"}${
                        values.branchCode ? ` · ${values.branchCode}` : ""
                      }`}
                    />
                  </dl>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={step === 0 || isSubmitting}
                className="text-muted-foreground"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Back
              </Button>

              {isLastStep ? (
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      Creating workspace...
                    </>
                  ) : (
                    <>
                      Create workspace
                      <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={goNext}>
                  Continue
                  <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              )}
            </div>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="text-center text-[11px] text-muted-foreground">
          Protected with SSR Supabase Auth & double-submit CSRF cookie token.
        </p>
      </div>
    </div>
  );
}
