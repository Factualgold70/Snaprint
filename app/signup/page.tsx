"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/lib/actions/auth";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold text-[#0b0b0b] dark:text-white">
          Create your account
        </h1>
        <p className="mb-8 text-sm text-[#52514e] dark:text-[#c3c2b7]">
          Set up SnapPrint for your shop.
        </p>
        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#2a78d6]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-md border border-[#c3c2b7] bg-transparent px-3 py-2 text-sm outline-none focus:border-[#2a78d6]"
            />
          </label>
          {state?.error && <p className="text-sm text-[#d03b3b]">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-md bg-[#2a78d6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-sm text-[#52514e] dark:text-[#c3c2b7]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#2a78d6]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
