"use client";

import { useState, useMemo } from "react";

export default function PrintCalculator() {
  const [weight, setWeight] = useState("");
  const [costPerKg, setCostPerKg] = useState("");
  const [printTime, setPrintTime] = useState("");
  const [laborRate, setLaborRate] = useState("");
  const [markup, setMarkup] = useState("");

  const results = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const cpk = parseFloat(costPerKg) || 0;
    const pt = parseFloat(printTime) || 0;
    const lr = parseFloat(laborRate) || 0;
    const m = parseFloat(markup) || 0;

    const materialCost = (w / 1000) * cpk;
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
  }, [weight, costPerKg, printTime, laborRate, markup]);

  const formatMoney = (n: number) => {
    return n.toLocaleString(undefined, { style: "currency", currency: "ZAR" });
  };

  const reset = () => {
    setWeight("");
    setCostPerKg("");
    setPrintTime("");
    setLaborRate("");
    setMarkup("");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Material Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Material Cost</h3>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Filament weight (grams)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="25"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#898781] mb-2">
              Filament cost (R per kg)
            </label>
            <input
              type="number"
              value={costPerKg}
              onChange={(e) => setCostPerKg(e.target.value)}
              placeholder="180"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
            />
          </div>
          <div className="pt-2 border-t border-[#404040]">
            <p className="text-sm text-[#898781]">Material cost</p>
            <p className="text-2xl font-semibold text-white">
              {formatMoney(results.materialCost)}
            </p>
          </div>
        </div>

        {/* Labor Section */}
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
      </div>

      {/* Markup Section */}
      <div className="space-y-3 pt-4 border-t border-[#404040]">
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

      {/* Summary */}
      <div className="space-y-2 p-4 bg-[#1a1a1a] border border-[#404040] rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-[#898781]">Subtotal</span>
          <span className="text-white">{formatMoney(results.subtotal)}</span>
        </div>
        {results.markup_amount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#898781]">
              Markup ({markup}%)
            </span>
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

      <button
        onClick={reset}
        className="w-full px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050] transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
