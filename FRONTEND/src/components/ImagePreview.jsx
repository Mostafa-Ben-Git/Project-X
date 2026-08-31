import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function ImagePreview({
  image,
  OnRemove,
  className,
  rounded = "none",
  border = 0,
  borderColor = "none",
  onExpand,
}) {
  const src =
    typeof image === "string" || image instanceof String
      ? image
      : URL.createObjectURL(image);

  const expandable = typeof onExpand === "function";

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn("overflow-hidden", `rounded-${rounded}`)}
        style={{ borderColor: borderColor, borderWidth: border + "px" }}
      >
        <img
          src={src}
          alt="Post Image"
          onClick={expandable ? onExpand : undefined}
          role={expandable ? "button" : undefined}
          tabIndex={expandable ? 0 : undefined}
          onKeyDown={
            expandable
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onExpand();
                  }
                }
              : undefined
          }
          className={cn(
            "aspect-square w-full object-cover",
            expandable && "cursor-zoom-in",
          )}
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
