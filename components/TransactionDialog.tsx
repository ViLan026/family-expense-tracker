"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import {
    createTransaction,
    updateTransaction
} from "@/app/actions/transactions";
import { Tip } from "@/components/Tip";
import { formatMoney } from "@/lib/money";
import type { ActionState } from "@/lib/types";

type Editable = {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    transaction_date: string;
};

type Props = {
    today: string;
    transaction?: Editable;
    variant?: "primary" | "icon";
};

// Hiện lại số tiền ở dạng dễ sửa: 250000 -> "250k", 1234567 -> "1234567"
function amountInitial(n: number) {
    return n % 1000 === 0 ? formatMoney(n) : String(n);
}

const initial: ActionState = {};

export function TransactionDialog({
    today,
    transaction,
    variant = "icon"
}: Props) {
    const editing = !!transaction;
    const [open, setOpen] = useState(false);
    const [formKey, setFormKey] = useState(0);

    const action = editing
        ? updateTransaction.bind(null, transaction!.id)
        : createTransaction;
    const [state, formAction, pending] = useActionState(action, initial);

    useEffect(() => {
        if (state.ok) {
            setOpen(false);
            setFormKey((k) => k + 1); // xóa form cho lần thêm sau
        }
    }, [state]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) =>
            e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const label = editing ? "Sửa giao dịch" : "Thêm giao dịch";

    return (
        <>
            <Tip label={label}>
                <button
                    type="button"
                    aria-label={label}
                    onClick={() => setOpen(true)}
                    className={
                        variant === "primary"
                            ? "btn-primary h-10 w-10 !px-0"
                            : "btn-icon"
                    }
                >
                    {editing ? (
                        <Pencil size={16} />
                    ) : (
                        <Plus size={variant === "primary" ? 20 : 18} />
                    )}
                </button>
            </Tip>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
                    onMouseDown={(e) =>
                        e.target === e.currentTarget && setOpen(false)
                    }
                >
                    <form
                        key={formKey}
                        action={formAction}
                        className="card w-full max-w-md space-y-4 rounded-b-none p-5 sm:rounded-b-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">{label}</h2>
                            <button
                                type="button"
                                aria-label="Đóng"
                                className="btn-icon"
                                onClick={() => setOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <input
                            type="text"
                            inputMode="text"
                            name="title"
                            className="input"
                            placeholder="Tiêu đề"
                            defaultValue={transaction?.title ?? ""}
                            maxLength={200}
                            autoComplete="off"
                            enterKeyHint="next"
                            required
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                inputMode="text"
                                name="amount"
                                className="input num font-medium"
                                placeholder="Số tiền (250k, 1tr5)"
                                defaultValue={
                                    transaction
                                        ? amountInitial(transaction.amount)
                                        : ""
                                }
                                autoComplete="off"
                                enterKeyHint="next"
                                required
                            />
                            <input
                                name="transaction_date"
                                type="date"
                                className="input"
                                defaultValue={
                                    transaction?.transaction_date ?? today
                                }
                                required
                            />
                        </div>

                        <textarea
                            name="description"
                            className="input min-h-24 resize-y"
                            placeholder="Mô tả (không bắt buộc)"
                            defaultValue={transaction?.description ?? ""}
                            maxLength={2000}
                        />

                        {state.error && (
                            <p className="text-sm text-primary">
                                {state.error}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <Tip label="Lưu">
                                <button
                                    type="submit"
                                    aria-label="Lưu"
                                    disabled={pending}
                                    className="btn-primary w-11 !px-0"
                                >
                                    <Check size={20} />
                                </button>
                            </Tip>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
