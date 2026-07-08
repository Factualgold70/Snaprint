// RMB to ZAR conversion utility
// Uses a hardcoded rate that users can customize when adding filaments

export function rmbToZar(rmb: number, rate: number): number {
  return rmb * rate;
}

export function zarToRmb(zar: number, rate: number): number {
  return zar / rate;
}

// Current reference rate (user will input their own rate when adding filaments)
// As of 2024, typical rate is around 1 RMB = 1.8-2.0 ZAR, but this varies
export const DEFAULT_RMB_ZAR_RATE = 1.9;
