const COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-pink-500",
];

function getColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, size = "sm" }: AvatarProps) {
  const color = getColor(name);
  const sz =
    size === "sm"
      ? "w-7 h-7 text-xs"
      : size === "md"
        ? "w-8 h-8 text-sm"
        : "w-9 h-9 text-sm";
  return (
    <div
      className={`${color} ${sz} rounded-full flex items-center justify-center text-white shrink-0 select-none font-medium`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
