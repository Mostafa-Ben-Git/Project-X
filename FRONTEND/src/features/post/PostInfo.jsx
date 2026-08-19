import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import usePosts from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const { posts, setPosts, currentPost } = usePosts();

  const [like, setLike] = useState(likes);
  const [isLiked, setIsLiked] = useState(is_liked);
  const heart = useRef(null);

  const { likingHandler } = usePosts();

  const handleReply = (e) => {
    e.stopPropagation();
    if (!postData) return;
    const username = postData.user?.username;
    if (username) {
      navigate(`/${username}/post/${post_id}`, { state: { postData } });
    }
  };

  function handelLike(e) {
    e.stopPropagation();
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);

    if (!isLiked) {
      heart.current.classList.add("animate-beat-heart-once");
    } else {
      heart.current.classList.remove("animate-beat-heart-once");
    }

    likingHandler(post_id);
  }
  return (
    <div className={cn("flex items-center justify-around", className)}>
      <TooltipProvider delayDuration={200}>
        {/* Like */}
        <Tooltip>
          <TooltipTrigger asChild onClick={handelLike}>
            <div
              className={cn(
                "flex cursor-pointer items-center gap-1 transition-all duration-200 hover:text-red-500",
                isLiked && "text-red-500",
              )}
            >
              <span className="rounded-full p-2">
                <Heart
                  ref={heart}
                  strokeWidth={isLiked ? 0 : 2}
                  fill={isLiked ? "red" : "none"}
                />
              </span>
              <span>{Number(like)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" arrowPadding={10}>
            <p>Like</p>
          </TooltipContent>
        </Tooltip>

        {!replay && (
          <>
            {/* Reply / Comment */}
            <Tooltip>
              <TooltipTrigger asChild onClick={handleReply}>
                <div className="flex cursor-pointer items-center gap-1 transition-all duration-200 hover:text-green-500">
                  <span className="rounded-full p-2 hover:bg-green-500/10">
                    <MessageCircle />
                  </span>
                  <span>{comments_count}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Reply</p>
              </TooltipContent>
            </Tooltip>

            {/* Share */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-pointer items-center gap-1 transition-all duration-200 hover:text-blue-500">
                  <span className="rounded-full p-2 hover:bg-blue-500/10">
                    <Share2 />
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </TooltipProvider>
    </div>
  );
}

export default PostInfo;
