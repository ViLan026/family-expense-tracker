import { requireSession } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-screen md:pl-60">
      <Sidebar username={session.username} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
        {children}
      </main>
    </div>
  );
}