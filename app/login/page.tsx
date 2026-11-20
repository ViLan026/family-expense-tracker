"use client";

import { useActionState } from "react";
import { ArrowRight, Lock, User, Wallet } from "lucide-react";
import { login } from "@/app/actions/auth";
import type { ActionState } from "@/lib/types";

const initial: ActionState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initial);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form action={formAction} className="card w-full max-w-sm space-y-4 p-6">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
            <Wallet size={24} />
          </span>
        </div>

        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="username"
            className="input !pl-9"
            placeholder="Tên đăng nhập"
            autoComplete="username"
            autoCapitalize="none"
            required
            autoFocus
          />
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            name="password"
            type="password"
            className="input !pl-9"
            placeholder="Mật khẩu"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error && <p className="text-center text-sm text-primary">{state.error}</p>}

        <button type="submit" disabled={pending} className="btn-primary w-full" aria-label="Đăng nhập">
          Đăng nhập <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}
