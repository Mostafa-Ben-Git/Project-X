import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function ImagePreview({
  image,
  OnRemove,
  className,
  rounded = "none",
  border = 0,
  borderColor = "none",
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn("overflow-hidden", `rounded-${rounded}`)}
        style={{ borderColor: borderColor, borderWidth: border + "px" }}
      >
        <img
          src={
            typeof image === "string" || image instanceof String
              ? image
              : URL.createObjectURL(image)
          }
          alt="Post Image"
          className="aspect-square w-full object-cover"
        />
      </div>
      <span
        className="absolute right-1 top-1 grid cursor-pointer place-items-center rounded-full bg-slate-400 p-1"
        onClick={OnRemove}
      >
        <X size={20} />
      </span>
    </div>
  );
}
