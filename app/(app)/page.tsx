import Link from "next/link";
import { ChevronLeft, ChevronRight, Users, Wallet } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getMembers, getTransactionsInYear } from "@/lib/queries";
import { todayVN } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { Money } from "@/components/Money";
import { Tip } from "@/components/Tip";
import { TransactionDialog } from "@/components/TransactionDialog";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  await requireSession();
  const sp = await searchParams;
  const today = todayVN();
  const thisYear = Number(today.slice(0, 4));
  const year = /^\d{4}$/.test(sp.year ?? "") ? Number(sp.year) : thisYear;
  const [members, txs] = await Promise.all([getMembers(), getTransactionsInYear(year)]);
  const familyTotal = txs.reduce((sum, t) => sum + Number(t.amount), 0);
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0, count: 0 }));
  for (const t of txs) {
    const m = months[Number(t.transaction_date.slice(5, 7)) - 1];
    m.total += Number(t.amount);
    m.count++;
  }
  const maxMonth = Math.max(...months.map(m => m.total), 1);
  const stats = members.map(m => {
    const own = txs.filter(t => t.user_id === m.id);
    return { ...m, total: own.reduce((sum, t) => sum + Number(t.amount), 0), count: own.length };
  }).sort((a, b) => b.total - a.total);
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthRange = (m: number) => {
    const last = new Date(Date.UTC(year, m, 0)).getUTCDate();
    return `from=${year}-${pad(m)}-01&to=${year}-${pad(m)}-${pad(last)}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Tổng quan</h1>
        <TransactionDialog today={today} variant="primary" />
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <section className="card p-4 lg:col-span-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Tip label="Tổng chi tiêu cả năm"><Wallet size={18} className="text-muted" /></Tip>
              <Money value={familyTotal} className="text-lg font-semibold text-primary" />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-line p-1">
              <Tip label="Năm trước"><Link href={`/?year=${year - 1}`} aria-label="Năm trước" className="btn-icon h-8 w-8"><ChevronLeft size={17} /></Link></Tip>
              <span className="num w-12 text-center text-sm font-semibold">{year}</span>
              <Tip label="Năm sau"><Link href={`/?year=${year + 1}`} aria-label="Năm sau" className="btn-icon h-8 w-8"><ChevronRight size={17} /></Link></Tip>
            </div>
          </div>
          <ul className="divide-y divide-line">
            {months.map(m => (
              <li key={m.month}>
                <Link href={`/transactions?${monthRange(m.month)}`} className="flex items-center gap-3 rounded-lg px-1 py-3 transition hover:bg-bg">
                  <span className="num w-8 text-sm font-medium text-muted">T{m.month}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${m.total / maxMonth * 100}%` }} />
                  </span>
                  <Tip label={`${m.count} giao dịch`}>
                    <span className="num w-6 text-right text-xs text-muted">{m.count || "–"}</span>
                  </Tip>
                  <span className="w-20 text-right text-sm font-semibold">{m.total > 0 ? <Money value={m.total} /> : <span className="text-muted">–</span>}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Thành viên</h2>
            <Users size={18} className="text-muted" />
          </div>
          {stats.map(m => (
            <Link key={m.id} href={`/members/${m.id}`} className="card flex items-center gap-3 p-4 transition hover:border-primary/40">
              <Avatar name={m.username} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.username}</p>
                <Tip label={`${m.count} giao dịch`}>
                  <p className="num text-xs text-muted">{m.count} GD</p>
                </Tip>
              </div>
              <Money value={m.total} className="text-lg font-semibold text-primary" />
              <ChevronRight size={17} className="text-muted" />
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}