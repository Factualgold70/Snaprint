"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice, setInvoiceStatus } from "@/lib/actions/invoices";
import type { InvoiceStatus } from "@/lib/supabase/types";

export default function InvoiceActions({ id, status }: { id: string; status: InvoiceStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function updateStatus(next: InvoiceStatus) {
    startTransition(async () => {
      await setInvoiceStatus(id, next);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteInvoice(id);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" && (
        <button
          onClick={() => updateStatus("sent")}
          disabled={isPending}
          className="rounded-md border border-[#c3c2b7] px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          Mark as sent
        </button>
      )}
      {status !== "paid" && (
        <button
          onClick={() => updateStatus("paid")}
          disabled={isPending}
          className="rounded-md bg-[#0ca30c] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          Mark as paid
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md border border-[#d03b3b] px-3 py-1.5 text-sm font-medium text-[#d03b3b] disabled:opacity-60"
      >
        Delete
      </button>
    </div>
  );
}
