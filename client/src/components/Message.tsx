import { memo, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { ChatMessage } from "../types";
import { Avatar } from "./Avatar";

interface MessageProps {
  msg: ChatMessage;
  showAvatar: boolean;
}

export const Message = memo(function Message({
  msg,
  showAvatar,
}: MessageProps) {
  const ctx = useContext(ChatContext)!;
  const isSelf = msg.name === ctx.name;

  return (
    <div
      className={`flex gap-2.5 ${isSelf ? "flex-row-reverse" : "flex-row"} items-end`}
    >
      {showAvatar ? (
        <Avatar name={msg.name} />
      ) : (
        <div className="w-7 shrink-0" />
      )}
      <div
        className={`flex flex-col gap-0.5 max-w-[72%] ${isSelf ? "items-end" : "items-start"}`}
      >
        {showAvatar && !isSelf && (
          <span className="text-xs text-zinc-500 px-1">{msg.name}</span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isSelf
              ? "bg-violet-600 text-white rounded-br-sm"
              : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
          }`}
        >
          {msg.text}
        </div>
        <span className="font-mono text-[10px] text-zinc-600 px-1">
          {msg.timestamp}
        </span>
      </div>
    </div>
  );
});
