import { Loader2 } from "lucide-react";

export function LoaderCircle({ size = 20, className = "" }) {
  return (
    <Loader2
      className={`animate-spin text-muted-foreground ${className}`}
      size={size}
    />
  );
}

export default LoaderCircle;
