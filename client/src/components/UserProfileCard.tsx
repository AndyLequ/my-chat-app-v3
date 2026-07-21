import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { Avatar } from "./Avatar";
import { StatusDot } from "./StatusDot";

export function UserProfileCard() {
  const { username, logout } = useAuth();
  const { connected } = useContext(ChatContext)!;

  if (!username) return null;

  return (
    <div className="mx-3 mb-3 rounded-xl border border-zinc-800/70 bg-zinc-900/70 p-3">
      <div className="flex items-center gap-2.5">
        <Avatar name={username} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-zinc-100">
            {username}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
            <StatusDot connected={connected} />
            {connected ? "Connected" : "Offline"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[11px] text-zinc-500">
        <span>Signed in</span>
        <button
          onClick={logout}
          className="font-medium text-zinc-400 transition-colors hover:text-rose-400"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
