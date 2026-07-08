export default function ExportButton({ month, label }: { month: string; label: string }) {
  return (
    <a
      href={`/api/export/xlsx?month=${month}`}
      className="rounded-md border border-[#c3c2b7] px-3 py-1.5 text-sm font-medium text-[#0b0b0b] hover:bg-[#e1e0d9]/40 dark:text-white dark:hover:bg-[#2c2c2a]"
    >
      {label}
    </a>
  );
}
