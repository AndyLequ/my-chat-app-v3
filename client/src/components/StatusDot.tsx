interface StatusDotProps {
  connected: boolean;
}

export function StatusDot({ connected }: StatusDotProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? "bg-emerald-400" : "bg-zinc-600"}`}
    />
  );
}
