import usePosts from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function PostInfo({
  likes,
  comments_count,
  is_liked,
  post_id,
  postData,
  className,
  replay = false,
}) {
  const navigate = useNavigate();
  const { likingHandler } = usePosts();

  const [like, setLike] = useState(likes);
  const [isLiked, setIsLiked] = useState(is_liked);
  const heart = useRef(null);

  // keep local state in sync if the underlying post data changes (e.g. refetch)
  useEffect(() => {
    setLike(likes);
    setIsLiked(is_liked);
  }, [likes, is_liked]);

  const handleReply = (e) => {
    e.stopPropagation();
    if (!postData) return;
    const username = postData.user?.username;
    if (username) {
      navigate(`/${username}/post/${post_id}`, { state: { postData } });
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    setLike((prev) => (nextLiked ? prev + 1 : prev - 1));
    setIsLiked(nextLiked);

    if (nextLiked && heart.current) {
      heart.current.classList.remove("animate-beat-heart-once");
      void heart.current.offsetWidth; // restart animation
      heart.current.classList.add("animate-beat-heart-once");
    }

    likingHandler(post_id);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const username = postData?.user?.username;
    const url = username
      ? `${window.location.origin}/${username}/post/${post_id}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border px-1 pt-2 sm:px-2",
        className,
      )}
    >
      <button
        type="button"
        aria-label={isLiked ? "Unlike post" : "Like post"}
        aria-pressed={isLiked}
        onClick={handleLike}
        className={cn(
          "flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500 sm:flex-none sm:justify-start sm:px-2",
          isLiked ? "text-red-500" : "text-muted-foreground",
        )}
      >
        <Heart
          ref={heart}
          size={18}
          strokeWidth={isLiked ? 0 : 2}
          fill={isLiked ? "currentColor" : "none"}
          className="shrink-0 transition-transform duration-200"
        />
        <span className="text-xs tabular-nums">{Number(like)}</span>
      </button>

      {!replay && (
        <>
          <button
            type="button"
            aria-label="Reply to post"
            onClick={handleReply}
            className="flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-muted-foreground transition-colors duration-200 hover:bg-green-500/10 hover:text-green-500 sm:flex-none sm:justify-start sm:px-2"
          >
            <MessageCircle size={18} className="shrink-0" />
            <span className="text-xs tabular-nums">{comments_count}</span>
          </button>

          <button
            type="button"
            aria-label="Copy link to post"
            onClick={handleShare}
            className="flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-md py-1.5 text-muted-foreground transition-colors duration-200 hover:bg-blue-500/10 hover:text-blue-500 sm:flex-none sm:px-2"
          >
            <Share2 size={18} className="shrink-0" />
          </button>
        </>
      )}
    </div>
  );
}

export default PostInfo;