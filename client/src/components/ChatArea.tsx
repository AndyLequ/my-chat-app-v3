import { useContext, useCallback, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { Message } from "./Message";
import { JoinNotice } from "./JoinNotice";
import { LeaveNotice } from "./LeaveNotice";
import { StatusDot } from "./StatusDot";

interface ChatAreaProps {
  members: string[];
}

export function ChatArea({ members }: ChatAreaProps) {
  const ctx = useContext(ChatContext)!;
  const {
    name,
    connected,
    messages,
    text,
    dispatch,
    socketRef,
    bottomRef,
    currentRoom,
  } = ctx;

  const send = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || !connected || !socketRef.current || !currentRoom) return;
    socketRef.current.send(
      JSON.stringify({
        type: "chat",
        room: currentRoom,
        name,
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }),
    );
    dispatch({ type: "CLEAR_TEXT" });
  }, [text, name, connected, currentRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 text-xl mx-auto mb-3">
            #
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            Pick a room to start chatting
          </p>
          <p className="text-zinc-600 text-xs mt-1">
            Select a room from the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-zinc-900">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400 text-xs font-bold">
            #
          </div>
          <div>
            <p className="text-zinc-100 text-sm font-medium leading-none">
              {currentRoom}
            </p>
            <p className="text-zinc-500 text-[10px] mt-0.5">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot connected={connected} />
          <span className="text-zinc-600 text-xs">
            {connected ? "connected" : "reconnecting..."}
          </span>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        style={{ overflowY: "auto" }}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-600 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            if (msg.type === "join")
              return <JoinNotice key={msg.id ?? i} name={msg.name} />;
            if (msg.type === "leave")
              return <LeaveNotice key={msg.id ?? i} name={msg.name} />;
            const prev = messages
              .slice(0, i)
              .reverse()
              .find((m) => m.type === "chat");
            const showAvatar = !prev || prev.name !== msg.name;
            return (
              <Message key={msg.id ?? i} msg={msg} showAvatar={showAvatar} />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-zinc-800/60">
        <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-2.5 border border-zinc-700/60 focus-within:border-violet-500/60 transition-colors">
          <input
            className="flex-1 bg-transparent text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
            placeholder={`Message #${currentRoom}`}
            value={text}
            onChange={(e) =>
              dispatch({ type: "SET_TEXT", payload: e.target.value })
            }
            onKeyDown={(e) => e.key === "Enter" && send()}
            disabled={!connected}
            autoFocus
          />
          <button
            onClick={send}
            disabled={!text.trim() || !connected}
            className="text-violet-400 hover:text-violet-300 disabled:text-zinc-700 transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="font-mono text-[10px] text-zinc-700 mt-1.5 text-center">
          Enter to send
        </p>
      </div>
    </div>
  );
}
