import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { Avatar } from "./Avatar";
import { StatusDot } from "./StatusDot";

const ROOMS = ["general", "random", "tech", "music"];

export function Sidebar() {
  const ctx = useContext(ChatContext)!;
  const { currentRoom, name, dispatch, socketRef, connected } = ctx;

  function switchRoom(room: string) {
    if (room === currentRoom) return;
    if (currentRoom) {
      socketRef.current?.send(
        JSON.stringify({ type: "leave-room", name, room: currentRoom }),
      );
    }
    dispatch({ type: "CLEAR_MESSAGES" });
    dispatch({ type: "SET_ROOM", payload: room });
    socketRef.current?.send(JSON.stringify({ type: "join-room", room, name }));
  }

  return (
    <div className="w-52 shrink-0 h-full flex flex-col bg-zinc-950 border-r border-zinc-800/60">
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            #
          </div>
          <span className="text-zinc-100 text-sm font-semibold tracking-tight">
            chatapp
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
          Rooms
        </p>
        <div className="flex flex-col gap-0.5">
          {ROOMS.map((room) => (
            <button
              key={room}
              onClick={() => switchRoom(room)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left w-full transition-all
                ${
                  currentRoom === room
                    ? "bg-violet-600/20 text-violet-300 font-medium"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                }`}
            >
              <span
                className={`text-xs ${currentRoom === room ? "text-violet-400" : "text-zinc-600"}`}
              >
                #
              </span>
              {room}
              {currentRoom === room && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </button>
          ))}
        </div>
      </div>

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
