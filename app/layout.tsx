import { requireSession } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <div className="min-h-screen">
      <Sidebar username={session.username} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-10 md:pl-64 md:pr-8">{children}</main>
    </div>
  );
}