import type { Channel } from "../types";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { Avatar } from "./Avatar";
import { StatusDot } from "./StatusDot";

interface SidebarProps {
  channels: Channel[];
  currentChannel: Channel | null;
  onJoinChannel: (channel: Channel) => void;
  onLeaveServer: () => void;
}

export function Sidebar({
  channels,
  currentChannel,
  onJoinChannel,
  onLeaveServer,
}: SidebarProps) {
  const ctx = useContext(ChatContext)!;
  const { name, connected, currentServer } = ctx;

  return (
    <div className="w-52 shrink-0 h-full flex flex-col bg-zinc-950 border-r border-zinc-800/60">
      {/* server name header */}
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <p className="text-zinc-100 text-sm font-semibold truncate">
          {currentServer?.name ?? "Select a server"}
        </p>
        {currentServer && (
          <button
            onClick={onLeaveServer}
            className="text-zinc-600 hover:text-rose-400 text-[10px] mt-1 transition-colors"
          >
            Leave server
          </button>
        )}
      </div>

      {/* channels list */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* no server selected - show prompt */}
        {!currentServer ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-2">
            <p className="text-zinc-600 text-sm text-center">
              Select a server to view its channels
            </p>
          </div>
        ) : channels.length === 0 ? (
          <p className="text-zinc-700 text-xs px-2">No channels yet</p>
        ) : (
          <>
            <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
              Channels
            </p>
            <div className="flex flex-col gap-0.5">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onJoinChannel(channel)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left w-full transition-all
                    ${
                      currentChannel?.id === channel.id
                        ? "bg-violet-600/20 text-violet-300 font-medium"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    }`}
                >
                  <span
                    className={`text-xs ${currentChannel?.id === channel.id ? "text-violet-400" : "text-zinc-600"}`}
                  >
                    #
                  </span>
                  {channel.name}
                  {currentChannel?.id === channel.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* user footer */}
      {name && (
        <div className="px-3 py-3 border-t border-zinc-800/60 flex items-center gap-2.5">
          <Avatar name={name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-zinc-200 text-xs font-medium truncate">{name}</p>
            <p className="text-zinc-600 text-[10px] flex items-center gap-1">
              <StatusDot connected={connected} />
              {connected ? "online" : "offline"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
