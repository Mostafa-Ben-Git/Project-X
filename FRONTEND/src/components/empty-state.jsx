import { cn } from "@/lib/utils";

export function EmptyState({ icon, title, message, className, children }) {
  const Icon = icon;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && <Icon className="h-10 w-10 opacity-40" />}
      <h2 className="text-base font-semibold">{title}</h2>
      {message && (
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      )}
      {children}
    </div>
  );
}

export default EmptyState;
