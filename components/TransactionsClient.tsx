"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Transaction, TransactionType } from "@/lib/supabase/types";
import { DEFAULT_CATEGORIES } from "@/lib/data/transactions";
import { formatMoney } from "@/lib/format";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/actions/transactions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(type: TransactionType = "expense") {
  return {
    type,
    amount: "",
    category: DEFAULT_CATEGORIES[type][0],
    description: "",
    occurred_on: todayISO(),
  };
}

export default function TransactionsClient({
  initialTransactions,
  month,
  type,
}: {
  initialTransactions: Transaction[];
  month: string;
  type?: "income" | "expense";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addForm, setAddForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm());
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of initialTransactions) {
      if (t.type === "income") income += Number(t.amount);
      else expense += Number(t.amount);
    }
    return { income, expense, net: income - expense };
  }, [initialTransactions]);

  function setFilter(nextMonth: string, nextType?: string) {
    const qs = new URLSearchParams();
    qs.set("month", nextMonth);
    if (nextType) qs.set("type", nextType);
    router.push(`/transactions?${qs.toString()}`);
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amount = Number(addForm.amount);
    if (!amount || amount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    startTransition(async () => {
      try {
        await createTransaction({ ...addForm, amount });
        setAddForm(emptyForm(addForm.type));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add transaction.");
      }
    });
  }

  function startEdit(t: Transaction) {
    setEditingId(t.id);
    setEditForm({
      type: t.type,
      amount: String(t.amount),
      category: t.category,
      description: t.description,
      occurred_on: t.occurred_on,
    });
  }

  function handleEditSubmit(e: React.FormEvent, id: string) {
    e.preventDefault();
    setError(null);
    const amount = Number(editForm.amount);
    if (!amount || amount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    startTransition(async () => {
      try {
        await updateTransaction(id, { ...editForm, amount });
        setEditingId(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update transaction.");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    startTransition(async () => {
      try {
        await deleteTransaction(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete transaction.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Transactions</h1>
          <p className="text-sm text-[#52514e] dark:text-[#c3c2b7]">
            Income {formatMoney(totals.income)} &middot; Expenses {formatMoney(totals.expense)} &middot; Net{" "}
            <span className={totals.net >= 0 ? "text-[#0ca30c]" : "text-[#d03b3b]"}>
              {formatMoney(totals.net)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(e) => setFilter(e.target.value, type)}
            className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm"
          />
          <select
            value={type ?? ""}
            onChange={(e) => setFilter(month, e.target.value || undefined)}
            className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <form
        onSubmit={handleAddSubmit}
        className="grid grid-cols-2 gap-3 rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19] sm:grid-cols-6"
      >
        <select
          value={addForm.type}
          onChange={(e) => {
            const t = e.target.value as TransactionType;
            setAddForm({ ...addForm, type: t, category: DEFAULT_CATEGORIES[t][0] });
          }}
          className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm sm:col-span-1"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          value={addForm.amount}
          onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
          required
          className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm sm:col-span-1"
        />
        <select
          value={addForm.category}
          onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
          className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm sm:col-span-1"
        >
          {DEFAULT_CATEGORIES[addForm.type].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={addForm.description}
          onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
          className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm sm:col-span-2"
        />
        <input
          type="date"
          value={addForm.occurred_on}
          onChange={(e) => setAddForm({ ...addForm, occurred_on: e.target.value })}
          className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1.5 text-sm sm:col-span-1"
        />
        <button
          type="submit"
          disabled={isPending}
          className="col-span-2 rounded-md bg-[#2a78d6] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 sm:col-span-6"
        >
          Add transaction
        </button>
      </form>

      {error && <p className="text-sm text-[#d03b3b]">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-[#e1e0d9] dark:border-[#2c2c2a]">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-[#fcfcfb] text-left text-[#898781] dark:bg-[#1a1a19]">
            <tr>
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {initialTransactions.map((t) =>
              editingId === t.id ? (
                <tr key={t.id} className="border-t border-[#e1e0d9] dark:border-[#2c2c2a]">
                  <td className="px-3 py-2" colSpan={7}>
                    <form
                      onSubmit={(e) => handleEditSubmit(e, t.id)}
                      className="grid grid-cols-2 gap-2 sm:grid-cols-6"
                    >
                      <select
                        value={editForm.type}
                        onChange={(e) => {
                          const tt = e.target.value as TransactionType;
                          setEditForm({ ...editForm, type: tt, category: DEFAULT_CATEGORIES[tt][0] });
                        }}
                        className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1 text-sm"
                      >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1 text-sm"
                      />
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1 text-sm"
                      >
                        {DEFAULT_CATEGORIES[editForm.type].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1 text-sm sm:col-span-2"
                      />
                      <input
                        type="date"
                        value={editForm.occurred_on}
                        onChange={(e) => setEditForm({ ...editForm, occurred_on: e.target.value })}
                        className="rounded-md border border-[#c3c2b7] bg-transparent px-2 py-1 text-sm"
                      />
                      <div className="col-span-2 flex gap-2 sm:col-span-6">
                        <button
                          type="submit"
                          disabled={isPending}
                          className="rounded-md bg-[#2a78d6] px-3 py-1 text-xs font-medium text-white"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-md border border-[#c3c2b7] px-3 py-1 text-xs font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={t.id} className="border-t border-[#e1e0d9] dark:border-[#2c2c2a]">
                  <td className="px-3 py-2 whitespace-nowrap">{t.occurred_on}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.type === "income"
                          ? "bg-[#0ca30c]/10 text-[#006300]"
                          : "bg-[#d03b3b]/10 text-[#d03b3b]"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">{t.category}</td>
                  <td className="px-3 py-2 text-[#52514e] dark:text-[#c3c2b7]">{t.description || "—"}</td>
                  <td
                    className={`px-3 py-2 text-right font-medium ${
                      t.type === "income" ? "text-[#006300]" : "text-[#d03b3b]"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatMoney(Number(t.amount))}
                  </td>
                  <td className="px-3 py-2 text-xs text-[#898781]">{t.source}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => startEdit(t)}
                      className="mr-2 text-xs font-medium text-[#2a78d6]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs font-medium text-[#d03b3b]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
            {initialTransactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-[#898781]">
                  No transactions this month yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
