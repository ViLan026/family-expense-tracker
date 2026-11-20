import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getTransaction } from "@/lib/queries";
import { formatDate, todayVN } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { DeleteButton } from "@/components/DeleteButton";
import { Money } from "@/components/Money";
import { Tip } from "@/components/Tip";
import { TransactionDialog } from "@/components/TransactionDialog";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const t = await getTransaction(id);
  if (!t) notFound();

  const owner = t.users?.username ?? "?";
  const isMine = t.user_id === session.userId;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Tip label="Quay lại">
          <Link href="/transactions" aria-label="Quay lại" className="btn-icon">
            <ArrowLeft size={18} />
          </Link>
        </Tip>
        {isMine && (
          <div className="flex items-center">
            <TransactionDialog today={todayVN()} transaction={t} />
            <DeleteButton id={t.id} redirectTo="/transactions" />
          </div>
        )}
      </div>

      <article className="card space-y-5 p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold">{t.title}</h1>
          <Money value={t.amount} className="text-3xl font-semibold text-primary" />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-2">
            <Avatar name={owner} size="sm" />
            <span className="text-ink">{owner}</span>
          </span>
          <span className="num inline-flex items-center gap-1.5">
            <CalendarDays size={16} />
            {formatDate(t.transaction_date)}
          </span>
        </div>

        {t.description && <p className="whitespace-pre-wrap border-t border-line pt-4 text-sm leading-relaxed">{t.description}</p>}
      </article>
    </div>
  );
}
