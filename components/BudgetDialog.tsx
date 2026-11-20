
"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { createMonthlyBudget, updateMonthlyBudget, deleteMonthlyBudget } from "@/app/actions/budgets";
import { formatMoney } from "@/lib/money";
import type { ActionState } from "@/lib/types";

type Props = {
  budget: { id: string; amount: number } | null;
  year: number;
  month: number;
};

const initial: ActionState = {};

export function BudgetDialog({ budget, year, month }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [state, formAction, pending] = useActionState(
    budget ? updateMonthlyBudget.bind(null, budget.id) : createMonthlyBudget,
    initial,
  );
  const [deleting, startDelete] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  function handleDelete() {
    if (!budget) return;
    startDelete(async () => {
      const result = await deleteMonthlyBudget(budget.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      setConfirmDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={budget ? "Sửa ngân sách" : "Thêm ngân sách"} className={budget ? "btn-icon" : "btn-primary"}>
        {budget ? <Pencil size={16} /> : <><Plus size={16} /> Thiết lập ngân sách</>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form action={formAction} className="card w-full max-w-sm space-y-4 rounded-b-none p-5 sm:rounded-b-xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{budget ? "Cập nhật ngân sách" : "Thiết lập ngân sách"}</h2>
              <button type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="Đóng"><X size={18}/></button>
            </div>
            <p className="text-sm text-muted">Ngân sách tháng {month}/{year} của bạn</p>
            <input type="hidden" name="year" value={year}/>
            <input type="hidden" name="month" value={month}/>
            <input name="amount" className="input num" placeholder="Ví dụ: 5tr, 10tr" defaultValue={budget ? formatMoney(budget.amount) : ""} required autoFocus/>
            {state.error && <p className="text-sm text-primary">{state.error}</p>}
            <div className="flex items-center justify-between gap-2">
              {budget ? (
                <button type="button" className="btn-icon hover:!text-primary" aria-label="Xóa ngân sách" onClick={() => setConfirmDelete(true)}><Trash2 size={17}/></button>
              ) : <span/>}
              <button type="submit" disabled={pending} className="btn-primary w-10 !px-0" aria-label="Lưu"><Check size={19}/></button>
            </div>
            {confirmDelete && (
              <div className="rounded-lg border border-line bg-bg p-3 space-y-3">
                <p className="text-sm">Bạn có chắc muốn xóa ngân sách tháng này?</p>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-icon" onClick={() => setConfirmDelete(false)}><X size={16}/></button>
                  <button type="button" disabled={deleting} className="btn-primary" onClick={handleDelete}>Xác nhận xóa</button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}
