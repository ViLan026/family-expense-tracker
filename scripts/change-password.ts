
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

config({ path: ".env.local" });

const username = process.argv[2]?.trim().toLowerCase();

async function readHidden(prompt: string): Promise<string> {
  if (!stdin.isTTY) {
    throw new Error("Vui lòng chạy trong Terminal tương tác.");
  }

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    let value = "";

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\n");
    };

    const onData = (key: string) => {
      if (key === "\u0003") {
        cleanup();
        reject(new Error("Đã hủy thao tác."));
      } else if (key === "\r" || key === "\n") {
        cleanup();
        resolve(value);
      } else if (key === "\u007f" || key === "\b") {
        value = value.slice(0, -1);
      } else if (key >= " ") {
        value += key;
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  if (!username) {
    throw new Error(
      "Cách dùng: npm run change-password -- username"
    );
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Thiếu cấu hình Supabase trong .env.local");
  }

  const password = await readHidden("Nhập mật khẩu mới: ");

  if (password.length < 8) {
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự.");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Mật khẩu không được vượt quá 72 byte.");
  }

  const confirmPassword = await readHidden(
    "Xác nhận mật khẩu mới: "
  );

  if (password !== confirmPassword) {
    throw new Error("Hai mật khẩu không khớp.");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .update({ password_hash })
    .eq("username", username)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(`Không tìm thấy tài khoản: ${username}`);
  }

  console.log(`Đã đổi mật khẩu thành công cho: ${username}`);
}

main().catch((error: unknown) => {
  console.error(
    "Lỗi:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
