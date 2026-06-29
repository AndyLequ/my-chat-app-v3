interface DeleteServerModalProps {
  serverName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteServerModal({
  serverName,
  onConfirm,
  onCancel,
}: DeleteServerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
        <div>
          <h2 className="text-zinc-100 text-lg font-semibold">Delete Server</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Are you sure you want to delete{" "}
            <span className="text-zinc-100 font-medium">"{serverName}"</span>?
            This will permanently delete all channels and messages. This cannot
            be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl px-4 py-2.5 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Delete Server
          </button>
        </div>
      </div>
    </div>
  );
}
