// Tạo (hoặc đặt lại mật khẩu) tài khoản thành viên.
// Cách dùng:  npm run seed -- lan:lanlan bo:matkhau me:123456
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const pairs = process.argv.slice(2);
if (pairs.length === 0) {
  console.error("Cách dùng: npm run seed -- username:password [username:password ...]");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

for (const pair of pairs) {
  const idx = pair.indexOf(":");
  const username = pair.slice(0, idx).trim().toLowerCase();
  const password = pair.slice(idx + 1);
  if (idx < 1 || !username || !password) {
    console.error(`Bỏ qua "${pair}" (cần dạng username:password)`);
    continue;
  }
  const password_hash = bcrypt.hashSync(password, 10);
  const { error } = await supabase
    .from("users")
    .upsert({ username, password_hash }, { onConflict: "username" });
  console.log(error ? `✗ ${username}: ${error.message}` : `✓ ${username}`);
}
