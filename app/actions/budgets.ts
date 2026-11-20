
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { parseMoney } from "@/lib/money";
import type { ActionState } from "@/lib/types";

type ParsedBudget =
  | { error: string }
  | { year: number; month: number; amount: number };

function parseBudget(formData: FormData): ParsedBudget {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));
  const amountRaw = String(formData.get("amount") ?? "");

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { error: "Năm không hợp lệ" };
  }

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { error: "Tháng không hợp lệ" };
  }

  const amount = parseMoney(amountRaw);

  if (amount === null || amount <= 0) {
    return { error: "Ngân sách phải lớn hơn 0" };
  }

  if (!Number.isSafeInteger(amount)) {
    return { error: "Ngân sách quá lớn" };
  }

  return { year, month, amount };
}

function refreshBudgetPages() {
  revalidatePath("/", "page");
  revalidatePath("/members", "layout");
  revalidatePath("/transactions", "page");
}

/**
 * Thêm ngân sách cho chính tài khoản đang đăng nhập.
 */
export async function createMonthlyBudget(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = parseBudget(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await db()
    .from("monthly_budgets")
    .insert({
      ...parsed,
      user_id: session.userId,
    });

  if (error) {
    if (error.code === "23505") {
      return { error: "Bạn đã thiết lập ngân sách cho tháng này" };
    }

    return { error: "Không thể tạo ngân sách, vui lòng thử lại" };
  }

  refreshBudgetPages();
  return { ok: true };
}

/**
 * Chỉ chủ sở hữu mới được cập nhật ngân sách.
 */
export async function updateMonthlyBudget(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return { error: "Ngân sách không hợp lệ" };
  }

  const parsed = parseBudget(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { data, error } = await db()
    .from("monthly_budgets")
    .update({
      ...parsed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", session.userId)
    .select("id");

  if (error) {
    if (error.code === "23505") {
      return { error: "Bạn đã có ngân sách cho tháng này" };
    }

    return { error: "Không thể cập nhật ngân sách" };
  }

  if (!data || data.length === 0) {
    return { error: "Bạn không có quyền sửa ngân sách này" };
  }

  refreshBudgetPages();
  return { ok: true };
}

/**
 * Chỉ chủ sở hữu mới được xóa ngân sách.
 */
export async function deleteMonthlyBudget(
  id: string,
): Promise<ActionState> {
  const session = await requireSession();

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return { error: "Ngân sách không hợp lệ" };
  }

  const { data, error } = await db()
    .from("monthly_budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId)
    .select("id");

  if (error) {
    return { error: "Không thể xóa ngân sách" };
  }

  if (!data || data.length === 0) {
    return { error: "Bạn không có quyền xóa ngân sách này" };
  }

  refreshBudgetPages();
  return { ok: true };
}
