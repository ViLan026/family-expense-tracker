import "server-only";
import { db } from "@/lib/db";
import type { Member, MonthlyBudget, Transaction } from "@/lib/types";

const SELECT = "id, user_id, title, description, amount, transaction_date, created_at, users(username)";

export async function getMembers(): Promise<Member[]> {
  const { data } = await db().from("users").select("id, username").order("username");
  return data ?? [];
}

/** Toàn bộ giao dịch trong một năm (phân trang nội bộ vì Supabase giới hạn 1000 dòng/lần). */
export async function getTransactionsInYear(year: number): Promise<Transaction[]> {
  const out: Transaction[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await db()
      .from("transactions")
      .select(SELECT)
      .gte("transaction_date", `${year}-01-01`)
      .lte("transaction_date", `${year}-12-31`)
      .order("transaction_date", { ascending: false })
      .range(from, from + size - 1);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as Transaction[];
    out.push(...rows);
    if (rows.length < size) break;
  }
  return out;
}

export type TxFilter = { q?: string; user?: string; from?: string; to?: string; page: number };
export const PAGE_SIZE = 20;

export async function searchTransactions(f: TxFilter) {
  let query = db().from("transactions").select(SELECT, { count: "exact" });

  if (f.q) {
    // Escape ký tự đặc biệt của ilike
    const safe = f.q.replace(/[\\%_]/g, (c) => `\\${c}`);
    query = query.ilike("title", `%${safe}%`);
  }
  if (f.user) query = query.eq("user_id", f.user);
  if (f.from) query = query.gte("transaction_date", f.from);
  if (f.to) query = query.lte("transaction_date", f.to);

  const start = (f.page - 1) * PAGE_SIZE;
  const { data, count, error } = await query
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(start, start + PAGE_SIZE - 1);
  if (error) throw new Error(error.message);

  return { rows: (data ?? []) as unknown as Transaction[], total: count ?? 0 };
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db().from("transactions").select(SELECT).eq("id", id).maybeSingle();
  return (data as unknown as Transaction) ?? null;
}



/**
 * Lấy ngân sách của tất cả thành viên trong một tháng.
 */
export async function getMonthlyBudgets(
  year: number,
  month: number,
): Promise<MonthlyBudget[]> {
  const { data, error } = await db()
    .from("monthly_budgets")
    .select("id, user_id, year, month, amount, created_at, updated_at")
    .eq("year", year)
    .eq("month", month);

  if (error) throw new Error(error.message);

  return (data ?? []) as MonthlyBudget[];
}

/**
 * Lấy ngân sách của một thành viên trong một tháng.
 */
export async function getMonthlyBudget(
  userId: string,
  year: number,
  month: number,
): Promise<MonthlyBudget | null> {
  const { data, error } = await db()
    .from("monthly_budgets")
    .select("id, user_id, year, month, amount, created_at, updated_at")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return (data as MonthlyBudget | null) ?? null;
}
