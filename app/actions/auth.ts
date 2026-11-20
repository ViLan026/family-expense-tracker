"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import type { ActionState } from "@/lib/types";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "Nhập tên đăng nhập và mật khẩu" };

  const { data: user } = await db()
    .from("users")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  // So sánh hash cả khi không có user để thời gian phản hồi không lộ username tồn tại
  const hash = user?.password_hash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) return { error: "Sai tên đăng nhập hoặc mật khẩu" };

  await createSession({ userId: user.id, username: user.username });
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
