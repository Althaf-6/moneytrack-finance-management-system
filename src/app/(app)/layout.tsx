import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import AppShell from "@/components/sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={{ name: user.name, email: user.email }}>{children}</AppShell>
  );
}
