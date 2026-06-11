import { useState } from "react";

interface CreateServerModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export function CreateServerModal({
  onClose,
  onCreate,
}: CreateServerModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-zinc-100 text-lg font-semibold">Create a Server</h2>
        <input
          className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
          placeholder="Server name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <input
          className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-zinc-600"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) onCreate(name, description);
            }}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
