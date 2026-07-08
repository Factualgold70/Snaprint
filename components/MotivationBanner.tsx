"use client";

import { useEffect, useState } from "react";
import { pickMotivationMessage, type MotivationTip } from "@/lib/motivation";

const STORAGE_KEY = "snaprint-last-motivation-index";

export default function MotivationBanner({ tip, deficit }: { tip: MotivationTip; deficit: number }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    const { message, index } = pickMotivationMessage(Number.isFinite(stored) ? stored : undefined);
    localStorage.setItem(STORAGE_KEY, String(index));
    // Reading localStorage requires the browser, so this one-time sync from an
    // external system to component state has to happen inside an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(message);
  }, []);

  return (
    <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#eda100]/15 px-2 py-0.5 text-xs font-semibold text-[#c98500]">
          Down ${Math.abs(deficit).toFixed(2)} this month
        </span>
      </div>
      {message && <p className="mt-2 text-sm font-medium text-[#0b0b0b] dark:text-white">{message}</p>}
      <p className="mt-3 text-sm text-[#52514e] dark:text-[#c3c2b7]">
        <span className="font-semibold text-[#0b0b0b] dark:text-white">{tip.label}.</span> {tip.detail}
      </p>
    </div>
  );
}
