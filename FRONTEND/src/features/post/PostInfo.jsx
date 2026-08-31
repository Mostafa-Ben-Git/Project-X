import usePosts from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { Bookmark, Eye, Heart, MessageCircle, Repeat, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function PostInfo({
  reposts_count,
  comments_count,
  is_reposted,
  likes,
  is_liked,
  views,
  is_bookmarked,
  post_id,
  postData,
  className,
  replay = false,
}) {
  const navigate = useNavigate();
  const { repostingHandler, likingHandler, bookmarkHandler } = usePosts();

  const [reposts, setReposts] = useState(reposts_count);
  const [isReposted, setIsReposted] = useState(is_reposted);

  const [likesCount, setLikesCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(is_liked);
  const [viewsCount, setViewsCount] = useState(views ?? 0);
  const [isBookmarked, setIsBookmarked] = useState(is_bookmarked);
  const [bookmarkPending, setBookmarkPending] = useState(false);

  // keep local state in sync if the underlying post data changes (e.g. refetch or cache patch)
  useEffect(() => {
    setReposts(reposts_count);
    setIsReposted(is_reposted);
  }, [reposts_count, is_reposted]);

  useEffect(() => {
    setLikesCount(likes);
    setIsLiked(is_liked);
  }, [likes, is_liked]);

  useEffect(() => {
    setViewsCount(views ?? 0);
  }, [views]);

  useEffect(() => {
    setIsBookmarked(is_bookmarked);
  }, [is_bookmarked]);

  const handleReply = (e) => {
    e.stopPropagation();
    if (!postData) return;
    const username = postData.user?.username;
    if (username) {
      navigate(`/${username}/post/${post_id}`, { state: { postData } });
    }
  };

  const handleRepost = async (e) => {
    e.stopPropagation();
    const nextReposted = !isReposted;
    const prevReposts = reposts;
    const prevReposted = isReposted;

    // Optimistically update UI immediately
    setReposts((prev) => (nextReposted ? prev + 1 : prev - 1));
    setIsReposted(nextReposted);

    // Fire API in background and roll back on failure
    const ok = await repostingHandler(post_id);
    if (!ok) {
      setReposts(prevReposts);
      setIsReposted(prevReposted);
      toast.error("Could not update repost. Please try again.");
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    const prevLikes = likesCount;
    const prevLiked = isLiked;

    // Optimistically update UI immediately
    setLikesCount((prev) => (nextLiked ? prev + 1 : prev - 1));
    setIsLiked(nextLiked);

    // Fire API in background and roll back on failure
    const ok = await likingHandler(post_id);
    if (!ok) {
      setLikesCount(prevLikes);
      setIsLiked(prevLiked);
      toast.error("Could not update like. Please try again.");
    }
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

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (bookmarkPending) return;
    const next = !isBookmarked;
    const prev = isBookmarked;
    setIsBookmarked(next);
    setBookmarkPending(true);
    try {
      const ok = await bookmarkHandler(post_id);
      if (!ok) throw new Error("failed");
      toast.success(next ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      setIsBookmarked(prev);
      toast.error("Could not update bookmark");
    } finally {
      setBookmarkPending(false);
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
        aria-label={isReposted ? "Undo repost" : "Repost post"}
        aria-pressed={isReposted}
        onClick={handleRepost}
        className={cn(
          "flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors duration-200 hover:bg-green-500/10 hover:text-green-500 sm:flex-none sm:justify-start sm:px-2",
          isReposted ? "text-green-500" : "text-muted-foreground",
        )}
      >
        <Repeat size={18} className="shrink-0" />
        <span className="text-xs tabular-nums">{Number(reposts)}</span>
      </button>

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
          size={18}
          className="shrink-0"
          fill={isLiked ? "currentColor" : "none"}
        />
        <span className="text-xs tabular-nums">{Number(likesCount)}</span>
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

          <span className="flex min-h-11 min-w-11 flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-muted-foreground sm:flex-none sm:justify-start sm:px-2" title="Views">
            <Eye size={18} className="shrink-0" />
            <span className="text-xs tabular-nums">{Number(viewsCount)}</span>
          </span>

          <button
            type="button"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
            aria-pressed={isBookmarked}
            onClick={handleBookmark}
            disabled={bookmarkPending}
            className={cn(
              "flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-md py-1.5 transition-colors duration-200 hover:bg-yellow-500/10 hover:text-yellow-500 sm:flex-none sm:px-2",
              isBookmarked ? "text-yellow-500" : "text-muted-foreground",
            )}
          >
            <Bookmark size={18} className="shrink-0" fill={isBookmarked ? "currentColor" : "none"} />
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
