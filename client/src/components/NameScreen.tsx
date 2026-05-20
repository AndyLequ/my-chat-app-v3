import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

export function NameScreen() {
  const ctx = useContext(ChatContext)!;
  const { name, dispatch } = ctx;

  const confirm = () => {
    if (name.trim()) dispatch({ type: "SET_NAME_CONFIRMED" });
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950 rounded-2xl">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="text-center mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-4">
            #
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Join the chat
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Pick a name to get started
          </p>
        </div>
        <input
          className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
          placeholder="Your name..."
          value={name}
          onChange={(e) =>
            dispatch({ type: "SET_NAME", payload: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && confirm()}
          autoFocus
        />
        <button
          onClick={confirm}
          className="bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all text-white rounded-xl px-4 py-3 text-sm font-medium"
        >
          Enter →
        </button>
      </div>
    </div>
  );
}
