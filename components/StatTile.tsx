export default function StatTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const color =
    tone === "good"
      ? "text-[#006300]"
      : tone === "bad"
      ? "text-[#d03b3b]"
      : "text-[#0b0b0b] dark:text-white";

  return (
    <div className="rounded-lg border border-[#e1e0d9] bg-[#fcfcfb] p-4 dark:border-[#2c2c2a] dark:bg-[#1a1a19]">
      <p className="text-xs font-medium text-[#898781]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
