import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Chặn nhanh người chưa đăng nhập. Việc xác thực thật vẫn được làm lại ở server (requireSession).
export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  let ok = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
      ok = true;
    } catch {
      ok = false;
    }
  }

  const isLogin = req.nextUrl.pathname === "/login";
  if (!ok && !isLogin) return NextResponse.redirect(new URL("/login", req.url));
  if (ok && isLogin) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
