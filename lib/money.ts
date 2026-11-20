// Định dạng & phân tích tiền VNĐ. Không import gì từ server để dùng được cả client lẫn test.

const trimZeros = (s: string) => s.replace(/0+$/, "");

/** 250000 -> "250k", 1500000 -> "1tr5", 12500000 -> "12tr5" */
export function formatMoney(vnd: number | bigint | string): string {
  const n = Math.round(Number(vnd));
  if (!Number.isFinite(n)) return "0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  if (abs < 1000) return `${sign}${abs}đ`;

  if (abs < 1_000_000) {
    const whole = Math.floor(abs / 1000);
    const frac = trimZeros(String(abs % 1000).padStart(3, "0"));
    return `${sign}${whole}k${frac}`;
  }

  // Từ 1 triệu: giữ tối đa 3 chữ số thập phân (độ chính xác đến nghìn đồng)
  const rounded = Math.round(abs / 1000) * 1000;
  const whole = Math.floor(rounded / 1_000_000);
  const frac = trimZeros(String(rounded % 1_000_000).padStart(6, "0"));
  return `${sign}${whole}tr${frac}`;
}

/**
 * Nhập tiền linh hoạt, trả về VNĐ (số nguyên) hoặc null nếu không hợp lệ.
 *  "250k" -> 250000      "1tr5" -> 1500000     "1.5tr" -> 1500000
 *  "250.000" -> 250000   "250000" -> 250000
 *  "250" (số trần < 1000) -> coi là k -> 250000
 */
export function parseMoney(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, "").replace(/đ|vnđ|vnd/g, "");
  if (!s) return null;

  // 1tr5 / 1tr25 / 12tr
  let m = s.match(/^(\d+)tr(\d+)?$/);
  if (m) {
    const frac = m[2] ? Number(("0." + m[2]).slice(0)) : 0;
    return Math.round((Number(m[1]) + frac) * 1_000_000);
  }

  // 250k5 / 5k
  m = s.match(/^(\d+)k(\d+)?$/);
  if (m) {
    const frac = m[2] ? Number("0." + m[2]) : 0;
    return Math.round((Number(m[1]) + frac) * 1000);
  }

  // 1.5tr / 1,5tr / 2.5k  (dấu . hoặc , là thập phân khi có hậu tố)
  m = s.match(/^(\d+(?:[.,]\d+)?)(tr|m|k)$/);
  if (m) {
    const v = Number(m[1].replace(",", "."));
    return Math.round(v * (m[2] === "k" ? 1000 : 1_000_000));
  }

  // Số trần: dấu . hoặc , là phân tách hàng nghìn
  if (/^\d{1,3}([.,]\d{3})+$/.test(s) || /^\d+$/.test(s)) {
    const v = Number(s.replace(/[.,]/g, ""));
    return v > 0 && v < 1000 ? v * 1000 : v;
  }

  return null;
}

/** Dạng hiển thị đầy đủ: 250000 -> "250.000đ" (dùng cho tooltip) */
export function formatFull(vnd: number | bigint | string): string {
  return Number(vnd).toLocaleString("vi-VN") + "đ";
}
