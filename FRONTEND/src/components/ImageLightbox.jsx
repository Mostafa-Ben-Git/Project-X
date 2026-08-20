import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ImageLightbox({
  src,
  images = [],
  onClose,
  onNavigate,
  className,
}) {
  const [loaded, setLoaded] = useState(false);
  const [pendingSrc, setPendingSrc] = useState(src);

  // Preload the image for smooth display before showing it
  useEffect(() => {
    setLoaded(false);
    setPendingSrc(src);
    const img = new Image();
    img.onload = () => {
      setPendingSrc(src);
      setLoaded(true);
    };
    img.onerror = () => setLoaded(true);
    img.src = src;
  }, [src]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "ArrowRight" && onNavigate) {
        onNavigate("next");
      } else if (e.key === "ArrowLeft" && onNavigate) {
        onNavigate("prev");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

  // Prevent background scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const hasMultiple = images.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-50 flex animate-in fade-in items-center justify-center bg-black/90 p-4 duration-200",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={22} />
      </button>

      {hasMultiple && onNavigate && (
        <button
          type="button"
          aria-label="Previous image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("prev");
          }}
          className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          ‹
        </button>
      )}

      <img
        src={pendingSrc}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[90vh] max-w-[90vw] rounded-lg object-contain transition-opacity duration-200",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />

      {hasMultiple && onNavigate && (
        <button
          type="button"
          aria-label="Next image"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("next");
          }}
          className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          ›
        </button>
      )}
    </div>
  );
}
