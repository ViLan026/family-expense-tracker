import Link from "next/link";
import { ChevronLeft, ChevronRight, Receipt, User, Users } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getMembers, getTransactionsInYear } from "@/lib/queries";
import { todayVN } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { Money } from "@/components/Money";
import { Tip } from "@/components/Tip";
import { TransactionDialog } from "@/components/TransactionDialog";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await requireSession();
  const sp = await searchParams;
  const today = todayVN();
  const thisYear = Number(today.slice(0, 4));
  const year = /^\d{4}$/.test(sp.year ?? "") ? Number(sp.year) : thisYear;

  const [members, txs] = await Promise.all([getMembers(), getTransactionsInYear(year)]);

  // Tổng hợp
  const familyTotal = txs.reduce((s, t) => s + Number(t.amount), 0);
  const mine = txs.filter((t) => t.user_id === session.userId);
  const myTotal = mine.reduce((s, t) => s + Number(t.amount), 0);

  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0, count: 0 }));
  for (const t of mine) {
    const m = months[Number(t.transaction_date.slice(5, 7)) - 1];
    m.total += Number(t.amount);
    m.count += 1;
  }
  const maxMonth = Math.max(...months.map((m) => m.total), 1);

  const stats = members
    .map((m) => {
      const own = txs.filter((t) => t.user_id === m.id);
      return { ...m, total: own.reduce((s, t) => s + Number(t.amount), 0), count: own.length };
    })
    .sort((a, b) => b.total - a.total);

  const pad = (n: number) => String(n).padStart(2, "0");
  const monthRange = (m: number) => {
    const last = new Date(Date.UTC(year, m, 0)).getUTCDate();
    return `from=${year}-${pad(m)}-01&to=${year}-${pad(m)}-${pad(last)}`;
  };

  return (
    <div className="space-y-6">
      {/* Thanh trên: chọn năm + thêm giao dịch */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface p-1 shadow-card">
          <Tip label="Năm trước">
            <Link href={`/?year=${year - 1}`} aria-label="Năm trước" className="btn-icon h-8 w-8">
              <ChevronLeft size={18} />
            </Link>
          </Tip>
          <span className="num w-14 text-center text-sm font-semibold">{year}</span>
          <Tip label="Năm sau">
            <Link href={`/?year=${year + 1}`} aria-label="Năm sau" className="btn-icon h-8 w-8">
              <ChevronRight size={18} />
            </Link>
          </Tip>
        </div>
        <TransactionDialog today={today} variant="primary" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-muted">
            <Users size={16} />
          </div>
          <Money value={familyTotal} className="mt-2 block text-3xl font-semibold text-primary" />
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-muted">
            <User size={16} />
          </div>
          <Money value={myTotal} className="mt-2 block text-3xl font-semibold text-primary" />
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-muted">
            <Receipt size={16} />
          </div>
          <span className="num mt-2 block text-3xl font-semibold">{txs.length}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* A. Chi theo tháng của tài khoản đang đăng nhập */}
        <section className="card p-4 lg:col-span-3">
          <ul className="divide-y divide-line">
            {months.map((m) => (
              <li key={m.month}>
                <Link
                  href={`/transactions?user=${session.userId}&${monthRange(m.month)}`}
                  className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition hover:bg-bg"
                >
                  <span className="num w-8 text-sm font-medium text-muted">T{m.month}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${(m.total / maxMonth) * 100}%` }}
                    />
                  </span>
                  <span className="num w-6 text-right text-xs text-muted">{m.count || ""}</span>
                  <span className="w-16 text-right text-sm font-semibold">
                    {m.total > 0 ? <Money value={m.total} /> : <span className="text-muted">–</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* B. Thống kê thành viên */}
        <section className="space-y-3 lg:col-span-2">
          {stats.map((m) => (
            <Link
              key={m.id}
              href={`/transactions?user=${m.id}`}
              className="card flex items-center gap-3 p-4 transition hover:border-primary/40"
            >
              <Avatar name={m.username} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.username}</p>
                <p className="num text-xs text-muted">{m.count}</p>
              </div>
              <Money value={m.total} className="text-xl font-semibold text-primary" />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
