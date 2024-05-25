import { cn } from "@/lib/utils";
import { MoonLoader } from "react-spinners";

function LoaderCircle({ className, size = 30 }) {
  return (
    <div
      className={cn("flex items-center justify-center rounded-lg", className)}
    >
      <MoonLoader color="#ffffff" size={size} />
    </div>
  );
}

export default LoaderCircle;
