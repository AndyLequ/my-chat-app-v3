import { useContext } from "react";
import type { Server } from "../types";
import { ChatContext } from "../context/ChatContext";

interface ServerListProps {
  servers: Server[];
  onJoinServer: (server: Server) => void;
  onCreateServer: () => void;
  onBrowseServers: () => void;
}

export function ServerList({
  servers,
  onJoinServer,
  onCreateServer,
  onBrowseServers,
}: ServerListProps) {
  const ctx = useContext(ChatContext);
  const { currentServer } = ctx;

  return (
    <div className="w-16 shrink-0 h-full flex flex-col items-center bg-zinc-950 border-r border-zinc-800/60 py-3 gap-2">
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => onJoinServer(server)}
          title={server.name}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all hover:rounded-xl
                        ${
                          currentServer?.id === server.id
                            ? "bg-violet-600 text-white rounded-xl"
                            : "bg-zinc-800 text-zinc-300 hover:bg-violet-600/80 hover:text-white"
                        }`}
        >
          {server.name.charAt(0).toUpperCase()}
        </button>
      ))}

      {/* {create server button} */}
      <button
        onClick={onCreateServer}
        title="Create Server"
        className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-emerald-600/80 hover:text-white hover:rounded-xl transition-all flex items-center justify-center text-xl"
      >
        +
      </button>

      {/* {browse servers button} */}
      <button
        onClick={onBrowseServers}
        title="Browse Servers"
        className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-400 hover:bg-blue-600/80 hover:text-white hover:rounded-xl transition-all flex items-center justify-center text-xl"
      >
        🔍
      </button>
    </div>
  );
}
