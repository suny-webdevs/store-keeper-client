import type { Metadata } from "next";
import { RegisterWizard } from "@/components/features/auth/register-wizard";

export const metadata: Metadata = {
  title: "Create workspace — Store Keeper",
  description:
    "Create your Store Keeper workspace: business details, owner account and first branch in three steps.",
};

export default function RegisterPage() {
  return <RegisterWizard />;
}
