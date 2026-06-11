import { useEffect, useState } from "react";
import type { Server } from "../types";

interface BrowseServersModalProps {
  onClose: () => void;
  onJoin: (server: Server) => void;
  myServerIds: number[];
}

export function BrowseServersModal({
  onClose,
  onJoin,
  myServerIds,
}: BrowseServersModalProps) {
  const [allServers, setAllServers] = useState<Server[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/servers")
      .then((r) => r.json())
      .then(setAllServers);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 max-h-[70vh]">
        <h2 className="text-zinc-100 text-lg font-semibold">Browse Servers</h2>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {allServers.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-4">
              No servers exist yet
            </p>
          ) : (
            allServers.map((server) => {
              const alreadyJoined = myServerIds.includes(server.id);
              return (
                <div
                  key={server.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {server.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 text-sm font-medium truncate">
                      {server.name}
                    </p>
                    {server.description && (
                      <p className="text-zinc-500 text-xs truncate">
                        {server.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onJoin(server)}
                    disabled={alreadyJoined}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors
                      ${
                        alreadyJoined
                          ? "bg-zinc-800 text-zinc-600 cursor-default"
                          : "bg-violet-600 hover:bg-violet-500 text-white"
                      }`}
                  >
                    {alreadyJoined ? "Joined" : "Join"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
