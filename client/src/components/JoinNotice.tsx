interface JoinNoticeProps {
  name: string;
}

export function JoinNotice({ name }: JoinNoticeProps) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex-1 h-px bg-zinc-800" />
      <span className="text-xs text-zinc-500 shrink-0">{name} joined</span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}
