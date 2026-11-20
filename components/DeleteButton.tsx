"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, X } from "lucide-react";
import { deleteTransaction } from "@/app/actions/transactions";
import { Tip } from "@/components/Tip";

// Hai bước: bấm thùng rác -> hiện dấu ✓ / ✗ để xác nhận.
export function DeleteButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function run() {
    start(async () => {
      const res = await deleteTransaction(id);
      if (res.error) {
        setError(res.error);
        setConfirming(false);
        return;
      }
      if (redirectTo) router.push(redirectTo);
    });
  }

  if (!confirming) {
    return (
      <Tip label={error ?? "Xóa"}>
        <button
          type="button"
          aria-label="Xóa"
          className="btn-icon hover:!text-primary"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
        >
          <Trash2 size={16} />
        </button>
      </Tip>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-1">
      <Tip label="Xác nhận xóa">
        <button type="button" aria-label="Xác nhận xóa" disabled={pending} className="btn-icon !text-primary" onClick={run}>
          <Check size={16} />
        </button>
      </Tip>
      <Tip label="Hủy">
        <button type="button" aria-label="Hủy" disabled={pending} className="btn-icon" onClick={() => setConfirming(false)}>
          <X size={16} />
        </button>
      </Tip>
    </span>
  );
}
