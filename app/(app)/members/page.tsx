import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { requireSession } from "@/lib/session";
import { getMembers } from "@/lib/queries";
import { Avatar } from "@/components/Avatar";

export default async function MembersPage() {
  const session = await requireSession();
  const members = await getMembers();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Thành viên</h1>
        <Users size={20} className="text-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map(member => (
          <Link key={member.id} href={`/members/${member.id}`} className="card flex items-center gap-3 p-4 transition hover:border-primary/40">
            <Avatar name={member.username} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{member.username}</p>
              {member.id === session.userId && <p className="text-xs text-muted">Tài khoản của bạn</p>}
            </div>
            <ChevronRight size={18} className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}