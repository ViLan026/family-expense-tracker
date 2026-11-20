# Chi tiêu gia đình

Website ghi lại các khoản chi trong gia đình. Next.js (App Router) + TypeScript + Tailwind + Supabase, deploy trên Vercel.

## 1. Tạo database (Supabase)

1. Tạo project trên [supabase.com](https://supabase.com).
2. Vào **SQL Editor**, dán nội dung `supabase/schema.sql` và chạy.
3. Vào **Project Settings → API**, lấy `Project URL` và `service_role` key.

## 2. Cấu hình môi trường

```bash
cp .env.example .env.local
```

Điền `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` và `SESSION_SECRET` (chuỗi ngẫu nhiên ≥ 32 ký tự, ví dụ `openssl rand -base64 48`).

> `service_role` key chỉ dùng ở server, không có prefix `NEXT_PUBLIC_`, không bao giờ lộ ra trình duyệt.

## 3. Tạo tài khoản thành viên

Không có đăng ký công khai, tài khoản tạo bằng lệnh (mật khẩu được hash bằng bcrypt). Chạy lại với cùng username sẽ đặt lại mật khẩu:

```bash
npm run seed -- lan:lanlan bo:matkhau me:123456
```

## 4. Chạy local

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # test hàm định dạng tiền
```

## 5. Deploy lên Vercel

1. Đẩy code lên GitHub (`git init && git add . && git commit`).
2. Import repo vào Vercel.
3. Thêm 3 Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`.
4. Deploy. Tài khoản tạo bằng bước 3 (cùng database) dùng được ngay.

## Quy ước tiền

DB lưu VNĐ nguyên bản (`BIGINT`). Giao diện hiển thị `250k`, `1tr5`, `12tr5`; rê chuột vào số tiền để xem đầy đủ.

Khi nhập: `250k`, `1tr5`, `1.5tr`, `250.000`, `250000` đều được. Số trần dưới 1000 (ví dụ `250`) được hiểu là `250k`.

