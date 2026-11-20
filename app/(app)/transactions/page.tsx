import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getMembers, PAGE_SIZE, searchTransactions } from "@/lib/queries";
import { formatDate, isIsoDate, todayVN } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { DeleteButton } from "@/components/DeleteButton";
import { Money } from "@/components/Money";
import { Tip } from "@/components/Tip";
import { TransactionDialog } from "@/components/TransactionDialog";

type SP = { q?: string; user?: string; from?: string; to?: string; page?: string };

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await requireSession();
  const sp = await searchParams;

  const q = (sp.q ?? "").trim().slice(0, 100);
  const user = /^[0-9a-f-]{36}$/i.test(sp.user ?? "") ? sp.user : undefined;
  const from = sp.from && isIsoDate(sp.from) ? sp.from : undefined;
  const to = sp.to && isIsoDate(sp.to) ? sp.to : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const [members, { rows, total }] = await Promise.all([
    getMembers(),
    searchTransactions({ q: q || undefined, user, from, to, page }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilter = !!(q || user || from || to);
  const today = todayVN();

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (user) params.set("user", user);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(p));
    return `/transactions?${params}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <form method="get" className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-40 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={q} placeholder="Tìm theo tiêu đề" className="input !pl-9" />
          </div>
          <select name="user" defaultValue={user ?? ""} className="input w-auto" aria-label="Thành viên">
            <option value="">Tất cả</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.username}
              </option>
            ))}
          </select>
          <input type="date" name="from" defaultValue={from} className="input w-auto" aria-label="Từ ngày" />
          <input type="date" name="to" defaultValue={to} className="input w-auto" aria-label="Đến ngày" />
          <Tip label="Lọc">
            <button type="submit" aria-label="Lọc" className="btn-primary w-10 !px-0">
              <Search size={18} />
            </button>
          </Tip>
          {hasFilter && (
            <Tip label="Xóa bộ lọc">
              <Link href="/transactions" aria-label="Xóa bộ lọc" className="btn-icon">
                <X size={18} />
              </Link>
            </Tip>
          )}
        </form>
        <TransactionDialog today={today} variant="primary" />
      </div>

      <div className="card divide-y divide-line">
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted">–</p>}
        {rows.map((t) => {
          const owner = t.users?.username ?? "?";
          const isMine = t.user_id === session.userId;
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <Tip label={owner}>
                <Avatar name={owner} />
              </Tip>
              <Link href={`/transactions/${t.id}`} className="min-w-0 flex-1 rounded-md hover:text-primary">
                <p className="truncate font-medium">{t.title}</p>
                <p className="num truncate text-xs text-muted">
                  {formatDate(t.transaction_date)}
                  {t.description ? ` · ${t.description}` : ""}
                </p>
              </Link>
              <Money value={t.amount} className="text-lg font-semibold text-primary" />
              <div className="flex w-[76px] justify-end">
                {isMine && (
                  <>
                    <TransactionDialog today={today} transaction={t} />
                    <DeleteButton id={t.id} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} aria-label="Trang trước" className="btn-icon">
              <ChevronLeft size={18} />
            </Link>
          ) : (
            <span className="btn-icon opacity-30">
              <ChevronLeft size={18} />
            </span>
          )}
          <span className="num text-sm text-muted">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} aria-label="Trang sau" className="btn-icon">
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="btn-icon opacity-30">
              <ChevronRight size={18} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
