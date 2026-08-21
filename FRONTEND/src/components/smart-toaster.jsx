import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * SmartToaster — adapts toast position/offset to viewport + context.
 * - Mobile: top-center (visible above bottom nav / keyboard) with safe-area
 * - Desktop: bottom-right (non-intrusive)
 * - Messages room: always top-center to avoid covering composer
 */
export function SmartToaster() {
  const isMobile = useIsMobile();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onNav = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onNav);
    // pushState/replaceState don't fire popstate, patch them
    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);
    window.history.pushState = (...args) => {
      origPush(...args);
      onNav();
    };
    window.history.replaceState = (...args) => {
      origReplace(...args);
      onNav();
    };
    return () => {
      window.removeEventListener("popstate", onNav);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  const isMessages = pathname.startsWith("/messages");

  // Respect virtual keyboard (VisualViewport) on mobile to avoid toast behind keyboard
  useEffect(() => {
    if (!isMobile || !window.visualViewport) return;
    const vp = window.visualViewport;
    const handler = () => {
      const kbHeight = window.innerHeight - vp.height - vp.offsetTop;
      setKeyboardOffset(kbHeight > 80 ? 12 : 0);
    };
    vp.addEventListener("resize", handler);
    vp.addEventListener("scroll", handler);
    return () => {
      vp.removeEventListener("resize", handler);
      vp.removeEventListener("scroll", handler);
    };
  }, [isMobile]);

  // Mobile → top-center so it never hides behind bottom nav (56px) or keyboard
  // Desktop → bottom-right; Messages → top-center to not cover composer
  const position = isMobile || isMessages ? "top-center" : "bottom-right";

  // Sonner offset is numeric; safe-area handled via CSS [data-sonner-toaster] override below
  const numericOffset = 16;

  return (
    <div
      style={
        position === "top-center"
          ? { paddingTop: "env(safe-area-inset-top)" }
          : { paddingBottom: "env(safe-area-inset-bottom)" }
      }
    >
      <Toaster
        position={position}
        richColors
        closeButton
        offset={numericOffset}
        gutter={8}
        expand={isMobile ? false : true}
        visibleToasts={isMobile ? 2 : 4}
        toastOptions={{
          duration: isMobile ? 2500 : 3500,
          style: {
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
            // Ensure toast max-width fits mobile
            ...(isMobile ? { maxWidth: "calc(100vw - 24px)" } : {}),
          },
          classNames: {
            title: "text-sm font-semibold",
            description: "text-sm text-muted-foreground",
            actionButton: "rounded-md bg-primary text-primary-foreground",
          },
        }}
      />
      {/* Invisible spacer to force sonner container to respect safe-area — injected via global style */}
      <style>{`
        [data-sonner-toaster][data-y-position="top"] { top: calc(12px + env(safe-area-inset-top)) !important; }
        [data-sonner-toaster][data-y-position="bottom"] { bottom: calc(12px + env(safe-area-inset-bottom)) !important; }
        [data-sonner-toaster] { --mobile-offset: ${keyboardOffset}px; }
      `}</style>
    </div>
  );
}
