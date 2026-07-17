import type { Metadata } from "next";
import { ShieldCheck, CalendarDays, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader, Card } from "@/components/stat-card";
import { ProfileForm, PasswordForm } from "@/components/profile-forms";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const joined = user.createdAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your account details and security."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* identity */}
        <Card index={0} className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"
          />
          <div className="relative flex flex-col items-center px-6 py-8 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 font-display text-3xl font-bold text-emerald-950 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <h2 className="mt-4 font-display text-xl font-bold text-white">
              {user.name}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-600">
              <CalendarDays className="h-3.5 w-3.5" />
              Member since {joined}
            </p>
            <div className="mt-6 flex w-full items-center gap-2.5 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-left">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-xs leading-relaxed text-zinc-400">
                Your password is encrypted with scrypt hashing and your session
                is protected with a signed token.
              </p>
            </div>
          </div>
        </Card>

        {/* forms */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Profile details" subtitle="How you appear in MoneyTrack" index={1}>
            <div className="px-6 py-6">
              <ProfileForm name={user.name} />
            </div>
          </Card>

          <Card
            title="Change password"
            subtitle="Use at least 6 characters — longer is stronger"
            index={2}
          >
            <div className="px-6 py-6">
              <PasswordForm />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
