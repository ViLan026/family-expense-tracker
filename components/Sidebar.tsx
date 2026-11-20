"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut, Wallet } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/Avatar";

const NAV = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/members", label: "Thành viên", icon: Users },
];

export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface px-4 py-5 md:flex">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><Wallet size={21} /></span>
          <span className="text-base font-bold text-ink">Family Expense</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${active(href) ? "bg-primary-soft text-primary" : "text-muted hover:bg-bg hover:text-ink"}`}>
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line pt-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <Avatar name={username} size="md" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{username}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted transition hover:bg-primary-soft hover:text-primary">
              <LogOut size={18} />
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-surface px-3 py-2 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex min-w-20 flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs ${active(href) ? "bg-primary-soft text-primary" : "text-muted"}`}>
            <Icon size={21} />
            {label}
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" className="flex min-w-20 flex-col items-center gap-1 px-3 py-1.5 text-xs text-muted">
            <LogOut size={21} />
            Đăng xuất
          </button>
        </form>
      </nav>
    </>
  );
}