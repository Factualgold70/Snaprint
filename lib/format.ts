export function formatMoney(n: number): string {
  const fixed = n.toFixed(2);
  const parts = fixed.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `R ${withCommas},${decimalPart}`;
}
