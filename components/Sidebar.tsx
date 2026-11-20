"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, LogOut, Wallet } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/Avatar";
import { Tip } from "@/components/Tip";

const NAV = [
  { href: "/", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/transactions", label: "Giao dịch", icon: ListOrdered },
];

export function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* Desktop / tablet: thanh icon bên trái */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-16 flex-col items-center border-r border-line bg-surface py-4 md:flex">
        <span className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <Wallet size={20} />
        </span>
        <nav className="flex flex-1 flex-col items-center gap-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Tip key={href} label={label} side="right">
              <Link
                href={href}
                aria-label={label}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition ${
                  active(href) ? "bg-primary-soft text-primary" : "text-muted hover:bg-bg hover:text-ink"
                }`}
              >
                <Icon size={20} />
              </Link>
            </Tip>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-3">
          <Tip label={username} side="right">
            <Avatar name={username} size="sm" />
          </Tip>
          <form action={logout}>
            <Tip label="Đăng xuất" side="right">
              <button type="submit" aria-label="Đăng xuất" className="btn-icon">
                <LogOut size={18} />
              </button>
            </Tip>
          </form>
        </div>
      </aside>

      {/* Mobile: thanh điều hướng dưới */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-line bg-surface py-2 md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`inline-flex h-10 w-12 items-center justify-center rounded-lg ${
              active(href) ? "bg-primary-soft text-primary" : "text-muted"
            }`}
          >
            <Icon size={22} />
          </Link>
        ))}
        <form action={logout}>
          <button type="submit" aria-label="Đăng xuất" className="inline-flex h-10 w-12 items-center justify-center text-muted">
            <LogOut size={20} />
          </button>
        </form>
      </nav>
    </>
  );
}
