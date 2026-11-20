const TZ = "Asia/Ho_Chi_Minh";

/** Ngày hiện tại theo giờ Việt Nam, dạng YYYY-MM-DD */
export function todayVN(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** 2026-11-19 -> 19/11/2026 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
