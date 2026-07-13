import type { ServerMember } from "../types";
import { Avatar } from "./Avatar";

interface MembersPanelProps {
  members: ServerMember[];
}

export function MembersPanel({ members }: MembersPanelProps) {
  const onlineMembers = members.filter((m) => m.online);
  const offlineMembers = members.filter((m) => !m.online);

  return (
    <div className="w-44 shrink-0 h-full flex flex-col bg-zinc-950 border-l border-zinc-800/60">
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
          Members
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {members.length === 0 ? (
          <p className="text-zinc-700 text-xs text-center mt-4">
            No members yet
          </p>
        ) : (
          <>
            {onlineMembers.length > 0 && (
              <>
                <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
                  Online - {onlineMembers.length}
                </p>
                <div className="flex flex-col gap-1 mb-3">
                  {onlineMembers.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="relative">
                        <Avatar name={member.name} size="sm" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
                      </div>
                      <span className="text-zinc-300 text-xs truncate">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {offlineMembers.length > 0 && (
              <>
                <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
                  Offline - {offlineMembers.length}
                </p>
                <div className="flex flex-col gap-1">
                  {offlineMembers.map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="relative">
                        <Avatar name={member.name} size="sm" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-zinc-500 border-2 border-zinc-950" />
                      </div>
                      <span className="text-zinc-300 text-xs truncate">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
