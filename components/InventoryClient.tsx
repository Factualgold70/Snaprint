"use client";

import { useState, useTransition } from "react";
import type { Filament } from "@/lib/data/filaments";
import {
  createFilament,
  updateFilament,
  deleteFilament,
  addFilamentStock,
} from "@/lib/actions/filaments";
import { DEFAULT_RMB_ZAR_RATE, rmbToZar } from "@/lib/currency";
import { formatMoney } from "@/lib/format";

export default function InventoryClient({
  initialFilaments,
}: {
  initialFilaments: Filament[];
}) {
  const [filaments, setFilaments] = useState(initialFilaments);
  const [editing, setEditing] = useState<string | null>(null);
  const [addingStock, setAddingStock] = useState<string | null>(null);
  const [stockAmount, setStockAmount] = useState("");
  const [stockCost, setStockCost] = useState("");
  const [stockDescription, setStockDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: "",
    color: "",
    material: "PLA",
    weight_grams: "",
    cost_zar: "",
    use_rmb: false,
    cost_rmb: "",
    rmb_to_zar_rate: DEFAULT_RMB_ZAR_RATE.toString(),
  });

  const handleRmbChange = (rmb: string, rate: string) => {
    if (rmb && rate) {
      const zar = rmbToZar(parseFloat(rmb), parseFloat(rate));
      setFormData({ ...formData, cost_rmb: rmb, rmb_to_zar_rate: rate, cost_zar: zar.toFixed(2) });
    }
  };

  const handleZarChange = (zar: string) => {
    setFormData({ ...formData, cost_zar: zar });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      color: "",
      material: "PLA",
      weight_grams: "",
      cost_zar: "",
      use_rmb: false,
      cost_rmb: "",
      rmb_to_zar_rate: DEFAULT_RMB_ZAR_RATE.toString(),
    });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.weight_grams || !formData.cost_zar) {
      alert("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      try {
        const weight = parseFloat(formData.weight_grams);
        const cost = parseFloat(formData.cost_zar);
        const costRmb = formData.cost_rmb ? parseFloat(formData.cost_rmb) : null;
        const rate = formData.rmb_to_zar_rate ? parseFloat(formData.rmb_to_zar_rate) : null;

        if (editing) {
          await updateFilament(
            editing,
            formData.name,
            formData.color,
            formData.material,
            weight,
            cost,
            costRmb,
            rate
          );
        } else {
          await createFilament(
            formData.name,
            formData.color,
            formData.material,
            weight,
            cost,
            costRmb,
            rate
          );
        }
        resetForm();
        // Refresh filaments list
        window.location.reload();
      } catch (error) {
        alert("Error saving filament: " + (error as Error).message);
      }
    });
  };

  const handleEdit = (filament: Filament) => {
    setFormData({
      name: filament.name,
      color: filament.color,
      material: filament.material,
      weight_grams: filament.weight_grams.toString(),
      cost_zar: filament.cost_zar.toString(),
      use_rmb: !!filament.cost_rmb,
      cost_rmb: filament.cost_rmb?.toString() || "",
      rmb_to_zar_rate: filament.rmb_to_zar_rate?.toString() || DEFAULT_RMB_ZAR_RATE.toString(),
    });
    setEditing(filament.id);
  };

  const handleDelete = async (filamentId: string) => {
    if (confirm("Are you sure you want to delete this filament?")) {
      startTransition(async () => {
        try {
          await deleteFilament(filamentId);
          setFilaments(filaments.filter((f) => f.id !== filamentId));
        } catch (error) {
          alert("Error deleting filament: " + (error as Error).message);
        }
      });
    }
  };

  const handleAddStock = async (filamentId: string) => {
    if (!stockAmount || parseFloat(stockAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (!stockCost || parseFloat(stockCost) < 0) {
      alert("Please enter a valid cost");
      return;
    }

    startTransition(async () => {
      try {
        await addFilamentStock(
          filamentId,
          parseFloat(stockAmount),
          parseFloat(stockCost),
          stockDescription
        );
        setAddingStock(null);
        setStockAmount("");
        setStockCost("");
        setStockDescription("");
        alert("Stock added and expense recorded!");
        window.location.reload();
      } catch (error) {
        alert("Error adding stock: " + (error as Error).message);
      }
    });
  };

  const remainingGrams = (filament: Filament) => filament.weight_grams - filament.used_grams;
  const costPerGram = (filament: Filament) => filament.cost_zar / filament.weight_grams;

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {editing ? "Edit Filament" : "Add New Filament"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#898781] mb-2">Filament Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="PLA White"
                className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#898781] mb-2">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="White"
                className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#898781] mb-2">Material</label>
              <select
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white focus:outline-none focus:border-[#2a78d6]"
              >
                <option>PLA</option>
                <option>ABS</option>
                <option>PETG</option>
                <option>TPU</option>
                <option>Resin</option>
                <option>Nylon</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#898781] mb-2">Weight (grams) *</label>
              <input
                type="number"
                value={formData.weight_grams}
                onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
                placeholder="1000"
                className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
              />
            </div>
          </div>

          {/* Cost Section */}
          <div className="border-t border-[#404040] pt-4">
            <label className="flex items-center text-sm text-[#898781] mb-4">
              <input
                type="checkbox"
                checked={formData.use_rmb}
                onChange={(e) => setFormData({ ...formData, use_rmb: e.target.checked })}
                className="mr-2 rounded"
              />
              Add cost in RMB and convert to ZAR
            </label>

            {formData.use_rmb ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[#898781] mb-2">Cost (RMB)</label>
                  <input
                    type="number"
                    value={formData.cost_rmb}
                    onChange={(e) =>
                      handleRmbChange(e.target.value, formData.rmb_to_zar_rate)
                    }
                    placeholder="45"
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#898781] mb-2">Exchange Rate (1 RMB = ? ZAR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rmb_to_zar_rate}
                    onChange={(e) =>
                      handleRmbChange(formData.cost_rmb, e.target.value)
                    }
                    placeholder="1.9"
                    className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#898781] mb-2">Cost in ZAR</label>
                  <div className="px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white font-semibold">
                    {formatMoney(parseFloat(formData.cost_zar) || 0)}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-[#898781] mb-2">Cost (ZAR) *</label>
                <input
                  type="number"
                  value={formData.cost_zar}
                  onChange={(e) => handleZarChange(e.target.value)}
                  placeholder="90"
                  className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-[#2a78d6] text-white rounded-lg hover:bg-[#1e5aa8] disabled:opacity-50 transition-colors"
            >
              {isPending ? "Saving..." : editing ? "Update" : "Add Filament"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filaments List */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Your Filaments</h2>
        {filaments.length === 0 ? (
          <p className="text-[#898781]">No filaments yet. Add your first one above!</p>
        ) : (
          <div className="grid gap-3">
            {filaments.map((filament) => (
              <div
                key={filament.id}
                className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">
                      {filament.name} — {filament.color} {filament.material}
                    </h3>
                    <p className="text-sm text-[#898781]">
                      {filament.weight_grams}g • Cost per gram:{" "}
                      {formatMoney(costPerGram(filament))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(filament)}
                      className="px-3 py-1 text-sm bg-[#2a78d6] text-white rounded hover:bg-[#1e5aa8] transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setAddingStock(filament.id)}
                      className="px-3 py-1 text-sm bg-[#22c55e] text-white rounded hover:bg-[#16a34a] transition-colors"
                    >
                      Add Stock
                    </button>
                    <button
                      onClick={() => handleDelete(filament.id)}
                      disabled={isPending}
                      className="px-3 py-1 text-sm bg-[#d93b3b] text-white rounded hover:bg-[#a82828] disabled:opacity-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-[#0d0d0d] rounded p-2">
                    <p className="text-[#898781]">Total Cost</p>
                    <p className="font-semibold text-white">
                      {formatMoney(filament.cost_zar)}
                    </p>
                  </div>
                  <div className="bg-[#0d0d0d] rounded p-2">
                    <p className="text-[#898781]">Used</p>
                    <p className="font-semibold text-white">{filament.used_grams}g</p>
                  </div>
                  <div className="bg-[#0d0d0d] rounded p-2">
                    <p className="text-[#898781]">Remaining</p>
                    <p className={`font-semibold ${remainingGrams(filament) > 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {remainingGrams(filament)}g
                    </p>
                  </div>
                </div>

                {filament.cost_rmb && filament.rmb_to_zar_rate && (
                  <p className="text-xs text-[#898781]">
                    Original: ¥{filament.cost_rmb} @ rate 1 RMB = R{filament.rmb_to_zar_rate}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {addingStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#404040] rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="text-xl font-semibold text-white">
              Add Stock - {filaments.find((f) => f.id === addingStock)?.name}
            </h3>
            <p className="text-sm text-[#898781]">
              Current total: {filaments.find((f) => f.id === addingStock)?.weight_grams}g
            </p>

            <div>
              <label className="block text-sm text-[#898781] mb-2">
                Amount to add (grams) *
              </label>
              <input
                type="number"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
                placeholder="1000"
                className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-[#898781] mb-2">
                Cost (R) *
              </label>
              <input
                type="number"
                value={stockCost}
                onChange={(e) => setStockCost(e.target.value)}
                placeholder="90"
                step="0.01"
                className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
              />
              <p className="text-xs text-[#898781] mt-1">
                Cost per gram: {stockCost && stockAmount ? formatMoney(parseFloat(stockCost) / parseFloat(stockAmount)) : "—"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-[#898781] mb-2">
                Description (optional)
              </label>
              <input
                type="text"
                value={stockDescription}
                onChange={(e) => setStockDescription(e.target.value)}
                placeholder="e.g., Order from supplier X"
                className="w-full px-3 py-2 bg-[#0d0d0d] border border-[#404040] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#2a78d6]"
              />
            </div>

            <div className="bg-[#0d0d0d] rounded-lg p-3 space-y-1">
              <p className="text-xs text-[#898781]">New total: {(filaments.find((f) => f.id === addingStock)?.weight_grams || 0) + (parseFloat(stockAmount) || 0)}g</p>
              <p className="text-xs text-[#898781]">Will record as expense: {stockCost ? formatMoney(parseFloat(stockCost)) : "R0.00"}</p>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleAddStock(addingStock)}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] disabled:opacity-50 transition-colors font-semibold"
              >
                {isPending ? "Adding..." : "Add Stock & Record"}
              </button>
              <button
                onClick={() => {
                  setAddingStock(null);
                  setStockAmount("");
                  setStockCost("");
                  setStockDescription("");
                }}
                className="flex-1 px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
