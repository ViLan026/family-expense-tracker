import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Receipt, Wallet, TrendingUp, PiggyBank } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getMembers, getTransactionsInYear, getMonthlyBudgets } from "@/lib/queries";
import { todayVN, formatDate } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { Money } from "@/components/Money";
import { Tip } from "@/components/Tip";
import { TransactionDialog } from "@/components/TransactionDialog";
import { BudgetDialog } from "@/components/BudgetDialog";
import { DeleteButton } from "@/components/DeleteButton";

export default async function MemberDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ year?: string; month?: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const sp = await searchParams;
  const today = todayVN();
  const currentYear = Number(today.slice(0, 4));
  const currentMonth = Number(today.slice(5, 7));
  const year = /^\d{4}$/.test(sp.year ?? "") ? Number(sp.year) : currentYear;
  const month = /^\d{1,2}$/.test(sp.month ?? "") && Number(sp.month) >= 1 && Number(sp.month) <= 12 ? Number(sp.month) : currentMonth;
  const [members, yearTxs, budgets] = await Promise.all([getMembers(), getTransactionsInYear(year), getMonthlyBudgets(year, month)]);
  const member = members.find(m => m.id === id);
  if (!member) notFound();
  const isMine = member.id === session.userId;
  const transactions = yearTxs.filter(t => t.user_id === id && Number(t.transaction_date.slice(5, 7)) === month).sort((a, b) => b.transaction_date.localeCompare(a.transaction_date));
  const spent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const budget = budgets.find(b => b.user_id === id) ?? null;
  const budgetAmount = budget ? Number(budget.amount) : 0;
  const remaining = budgetAmount - spent;
  const percent = budgetAmount > 0 ? spent / budgetAmount * 100 : 0;
  const previous = new Date(Date.UTC(year, month - 2, 1));
  const next = new Date(Date.UTC(year, month, 1));
  const monthHref = (date: Date) => `?year=${date.getUTCFullYear()}&month=${date.getUTCMonth() + 1}`;
  const monthLabel = `${String(month).padStart(2, "0")}/${year}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Tip label="Quay lại"><Link href="/" aria-label="Quay lại" className="btn-icon"><ArrowLeft size={18} /></Link></Tip>
          <Avatar name={member.username} size="lg" />
          <h1 className="font-semibold">{member.username}</h1>
        </div>
        {isMine && <TransactionDialog today={today} variant="primary" />}
      </div>

      <section className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <Tip label="Tháng trước"><Link href={monthHref(previous)} aria-label="Tháng trước" className="btn-icon"><ChevronLeft size={18} /></Link></Tip>
            <Tip label="Tháng sau"><Link href={monthHref(next)} aria-label="Tháng sau" className="btn-icon"><ChevronRight size={18} /></Link></Tip>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="min-w-0 rounded-xl bg-bg p-3">
            <Tip label="Ngân sách"><Wallet size={17} className="text-muted" /></Tip>
            <Money value={budgetAmount} className="mt-2 block truncate text-base font-semibold sm:text-xl" />
          </div>
          <div className="min-w-0 rounded-xl bg-bg p-3">
            <Tip label="Đã chi"><TrendingUp size={17} className="text-muted" /></Tip>
            <Money value={spent} className="mt-2 block truncate text-base font-semibold text-primary sm:text-xl" />
          </div>
          <div className="min-w-0 rounded-xl bg-bg p-3">
            <Tip label="Còn lại"><PiggyBank size={17} className="text-muted" /></Tip>
            <Money value={remaining} className={`mt-2 block truncate text-base font-semibold sm:text-xl ${remaining < 0 ? "text-primary" : "text-green-700"}`} />
          </div>
        </div>
        {budget && (
          <div className="space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-bg">
              <div className={`h-full rounded-full ${percent > 100 ? "bg-red-600" : "bg-primary"}`} style={{ width: `${Math.min(percent, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>{percent.toFixed(0)}%</span>
              <span>{remaining < 0 ? "Vượt ngân sách" : "Còn ngân sách"}</span>
            </div>
          </div>
        )}
        {isMine && <div className="flex justify-end"><BudgetDialog budget={budget ? { id: budget.id, amount: budgetAmount } : null} year={year} month={month} /></div>}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-muted" />
            <h2 className="font-semibold">Giao dịch</h2>
            <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-muted">{transactions.length}</span>
          </div>
        </div>
        <div className="card divide-y divide-line">
          {transactions.length === 0 && <p className="p-8 text-center text-sm text-muted">Chưa có giao dịch</p>}
          {transactions.map(t => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/transactions/${t.id}`} className="min-w-0 flex-1 rounded-md hover:text-primary">
                <p className="truncate font-medium">{t.title}</p>
                <p className="num truncate text-xs text-muted">{formatDate(t.transaction_date)}{t.description ? ` · ${t.description}` : ""}</p>
              </Link>
              <Money value={t.amount} className="text-base font-semibold text-primary sm:text-lg" />
              {isMine && <div className="flex items-center"><TransactionDialog today={today} transaction={t} /><DeleteButton id={t.id} /></div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}