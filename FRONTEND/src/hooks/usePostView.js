import { useCallback, useRef } from "react";
import { recordView } from "@/api/posts";

/**
 * Records a post view once when the element becomes visible for >= 1s at 50% visibility.
 * Deduped per post per session via sessionStorage + 24h server lock.
 * Efficient: fires at most once per mount.
 */
export function usePostView(postId) {
  const hasFired = useRef(false);

  const ref = useCallback(
    (node) => {
      if (!node || hasFired.current || !postId) return;

      const sessionKey = `viewed:${postId}`;
      if (sessionStorage.getItem(sessionKey)) {
        hasFired.current = true;
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasFired.current) {
            // Delay 1s to count only genuine views (scroll-past not counted)
            setTimeout(() => {
              if (!entry.isIntersecting || hasFired.current) return;
              if (document.visibilityState !== "visible") return;
              hasFired.current = true;
              sessionStorage.setItem(sessionKey, "1");
              recordView(postId).catch(() => {
                // Silent fail — views are best-effort
                hasFired.current = false;
                sessionStorage.removeItem(sessionKey);
              });
              observer.disconnect();
            }, 1000);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(node);
      return () => observer.disconnect();
    },
    [postId]
  );

  return ref;
}
