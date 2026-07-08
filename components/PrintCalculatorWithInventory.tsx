"use client";

import { useState, useMemo } from "react";
import { useTransition } from "react";
import type { Filament } from "@/lib/data/filaments";
import { recordFilamentUsage } from "@/lib/actions/filaments";
import { formatMoney } from "@/lib/format";

export default function PrintCalculatorWithInventory({
  filaments,
}: {
  filaments: Filament[];
}) {
  const [selectedFilamentId, setSelectedFilamentId] = useState<string>(
    filaments[0]?.id || ""
  );
  const [printTime, setPrintTime] = useState("");
  const [laborRate, setLaborRate] = useState("");
  const [markup, setMarkup] = useState("");
  const [weightGrams, setWeightGrams] = useState("");
  const [printDescription, setPrintDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedFilament = filaments.find((f) => f.id === selectedFilamentId);

  const costPerGram = selectedFilament
    ? selectedFilament.cost_zar / selectedFilament.weight_grams
    : 0;

  const results = useMemo(() => {
    const w = parseFloat(weightGrams) || 0;
    const pt = parseFloat(printTime) || 0;
    const lr = parseFloat(laborRate) || 0;
    const m = parseFloat(markup) || 0;

    const materialCost = w * costPerGram;
    const laborCost = pt * lr;
    const subtotal = materialCost + laborCost;
    const markup_amount = subtotal * (m / 100);
    const total = subtotal + markup_amount;

    return {
      materialCost,
      laborCost,
      subtotal,
      markup_amount,
      total,
    };
  }, [weightGrams, printTime, laborRate, markup, costPerGram]);

  const reset = () => {
    setWeightGrams("");
    setPrintTime("");
    setLaborRate("");
    setMarkup("");
    setPrintDescription("");
  };

  const handleRecordUsage = () => {
    if (!selectedFilament || !weightGrams || parseFloat(weightGrams) <= 0) {
      alert("Please select a filament and enter weight used");
      return;
    }

    if (parseFloat(weightGrams) > selectedFilament.weight_grams - selectedFilament.used_grams) {
      alert(
        `Not enough filament! Only ${selectedFilament.weight_grams - selectedFilament.used_grams}g remaining.`
      );
      return;
    }

    startTransition(async () => {
      try {
        await recordFilamentUsage(
          selectedFilament.id,
          parseFloat(weightGrams),
          printDescription || "Print"
        );
        reset();
        alert("Filament usage recorded!");
        window.location.reload();
      } catch (error) {
        alert("Error recording usage: " + (error as Error).message);
      }
    });
  };

  const remainingFilament = selectedFilament
    ? selectedFilament.weight_grams - selectedFilament.used_grams
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Filament Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Filament</h3>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Select filament from inventory
            </label>
            <select
              value={selectedFilamentId}
              onChange={(e) => setSelectedFilamentId(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white focus:outline-none focus:border-[#2a78d6]"
            >
              {filaments.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.color}) - R{f.cost_zar.toFixed(2)}/kg - {remainingFilament}g left
                </option>
              ))}
            </select>
          </div>
          {selectedFilament && (
            <div className="bg-[#0d0d0d] rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#898781]">Cost per gram</span>
                <span className="text-white font-semibold">
                  {formatMoney(costPerGram)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#898781]">Remaining</span>
                <span
                  className={
                    remainingFilament > 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                  }
                >
                  {remainingFilament}g
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Weight Input */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Print Details</h3>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Weight used (grams)
            </label>
            <input
              type="number"
              value={weightGrams}
              onChange={(e) => setWeightGrams(e.target.value)}
              placeholder="25"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Print description (optional)
            </label>
            <input
              type="text"
              value={printDescription}
              onChange={(e) => setPrintDescription(e.target.value)}
              placeholder="Custom miniature"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
            />
          </div>
        </div>
      </div>

      {/* Labor & Markup */}
      <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-[#404040]">
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Labor Cost</h3>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Print time (hours)
            </label>
            <input
              type="number"
              value={printTime}
              onChange={(e) => setPrintTime(e.target.value)}
              placeholder="2.5"
              step="0.5"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Labor rate (R per hour)
            </label>
            <input
              type="number"
              value={laborRate}
              onChange={(e) => setLaborRate(e.target.value)}
              placeholder="150"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
            />
          </div>
          <div className="pt-2 border-t border-[#404040]">
            <p className="text-sm text-[#898781]">Labor cost</p>
            <p className="text-2xl font-semibold text-white">
              {formatMoney(results.laborCost)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-white">Material & Markup</h3>
          <div className="pt-2 border-t border-[#404040]">
            <p className="text-sm text-[#898781]">Material cost</p>
            <p className="text-2xl font-semibold text-white">
              {formatMoney(results.materialCost)}
            </p>
          </div>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Markup (%) — optional
            </label>
            <input
              type="number"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2 p-4 bg-[#1a1a1a] border border-[#404040] rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-[#898781]">Subtotal</span>
          <span className="text-white">{formatMoney(results.subtotal)}</span>
        </div>
        {results.markup_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#898781]">Markup ({markup}%)</span>
            <span className="text-white">
              +{formatMoney(results.markup_amount)}
            </span>
          </div>
        )}
        <div className="border-t border-[#404040] pt-2 flex justify-between">
          <span className="font-semibold text-white">Recommended Price</span>
          <span className="text-2xl font-bold text-[#22c55e]">
            {formatMoney(results.total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleRecordUsage}
          disabled={isPending || !selectedFilament || !weightGrams}
          className="flex-1 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isPending ? "Recording..." : "Record & Calculate"}
        </button>
        <button
          onClick={reset}
          className="flex-1 px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
