"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { UserRound, KeyRound } from "lucide-react";
import { Spinner } from "@/components/ui";
import { updateProfileAction, changePasswordAction } from "@/actions/auth";

export function ProfileForm({ name }: { name: string }) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateProfileAction(fd);
      if (res.ok) toast.success(res.message ?? "Profile updated.");
      else toast.error(res.error ?? "Could not update profile.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="profile-name" className="field-label">
          Full name
        </label>
        <input
          id="profile-name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={name}
          className="field-input"
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? (
            <>
              <Spinner /> Saving…
            </>
          ) : (
            <>
              <UserRound className="h-4 w-4" /> Save profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await changePasswordAction(fd);
      if (res.ok) {
        toast.success(res.message ?? "Password changed.");
        form.reset();
      } else {
        toast.error(res.error ?? "Could not change password.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="pw-current" className="field-label">
          Current password
        </label>
        <input
          id="pw-current"
          name="current"
          type="password"
          required
          autoComplete="current-password"
          className="field-input"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pw-next" className="field-label">
            New password
          </label>
          <input
            id="pw-next"
            name="next"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="pw-confirm" className="field-label">
            Confirm new password
          </label>
          <input
            id="pw-confirm"
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="field-input"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? (
            <>
              <Spinner /> Updating…
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" /> Change password
            </>
          )}
        </button>
      </div>
    </form>
  );
}
