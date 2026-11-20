import { formatFull, formatMoney } from "@/lib/money";

// Hiển thị dạng rút gọn (250k, 1tr5); rê chuột để xem số đầy đủ.
export function Money({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`num ${className}`} title={formatFull(value)}>
      {formatMoney(value)}
    </span>
  );
}
