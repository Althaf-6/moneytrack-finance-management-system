"use client";

import { useActionState } from "react";
import Link from "next/link";
import { TriangleAlert, ArrowRight } from "lucide-react";
import {
  loginAction,
  registerAction,
  type AuthFormState,
} from "@/actions/auth";
import { Spinner } from "@/components/ui";

const initial: AuthFormState = { error: null };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const [state, formAction, isPending] = useActionState(
    isLogin ? loginAction : registerAction,
    initial,
  );

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-3xl font-bold tracking-tight text-white">
        {isLogin ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {isLogin
          ? "Sign in to continue to your finance dashboard."
          : "Start tracking your money in under a minute."}
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="field-label">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Althaf"
              autoComplete="name"
              required
              className="field-input"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="althaf@gmail.com"
            autoComplete="email"
            required
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            className="field-input"
          />
        </div>

        {state.error ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm text-rose-300">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            {state.error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3"
        >
          {isPending ? (
            <>
              <Spinner /> Please wait…
            </>
          ) : (
            <>
              {isLogin ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {isLogin ? "New to MoneyTrack? " : "Already have an account? "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
