interface LeaveNoticeProps {
  name: string;
}

export function LeaveNotice({ name }: LeaveNoticeProps) {
  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex-1 h-px bg-zinc-800" />
      <span className="text-xs text-zinc-600 shrink-0">{name} left</span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}
