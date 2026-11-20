"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { parseMoney } from "@/lib/money";
import { isIsoDate, todayVN } from "@/lib/dates";
import type { ActionState } from "@/lib/types";

type Parsed =
  | { error: string }
  | { title: string; description: string | null; amount: number; transaction_date: string };

function parse(formData: FormData): Parsed {
  const title = String(formData.get("title") ?? "").trim();
  const descRaw = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const dateRaw = String(formData.get("transaction_date") ?? "").trim() || todayVN();

  if (!title) return { error: "Nhập tiêu đề" };
  if (title.length > 200) return { error: "Tiêu đề quá dài (tối đa 200 ký tự)" };
  if (descRaw.length > 2000) return { error: "Mô tả quá dài" };

  const amount = parseMoney(amountRaw);
  if (amount === null) return { error: "Số tiền không hợp lệ (ví dụ: 250k, 1tr5)" };
  if (amount <= 0) return { error: "Số tiền phải lớn hơn 0" };
  if (!Number.isSafeInteger(amount)) return { error: "Số tiền quá lớn" };

  if (!isIsoDate(dateRaw)) return { error: "Ngày không hợp lệ" };

  return { title, description: descRaw || null, amount, transaction_date: dateRaw };
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/transactions", "layout");
}

export async function createTransaction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireSession();
  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  // user_id luôn lấy từ session, không nhận từ client
  const { error } = await db().from("transactions").insert({ ...parsed, user_id: session.userId });
  if (error) return { error: "Không lưu được, thử lại sau" };

  refresh();
  return { ok: true };
}

export async function updateTransaction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = parse(formData);
  if ("error" in parsed) return { error: parsed.error };

  // Điều kiện user_id nằm ngay trong câu lệnh: chỉ sửa được giao dịch của chính mình
  const { data, error } = await db()
    .from("transactions")
    .update(parsed)
    .eq("id", id)
    .eq("user_id", session.userId)
    .select("id");
  if (error) return { error: "Không lưu được, thử lại sau" };
  if (!data || data.length === 0) return { error: "Bạn chỉ sửa được giao dịch của mình" };

  refresh();
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionState> {
  const session = await requireSession();
  const { data, error } = await db()
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId)
    .select("id");
  if (error) return { error: "Không xóa được, thử lại sau" };
  if (!data || data.length === 0) return { error: "Bạn chỉ xóa được giao dịch của mình" };

  refresh();
  return { ok: true };
}
