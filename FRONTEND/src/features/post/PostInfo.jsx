import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import usePosts from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Share, Share2 } from "lucide-react";
import { useRef, useState } from "react";

function PostInfo({ likes, comments_count, is_liked, post_id }) {
  const [like, setLike] = useState(likes);
  const [isLiked, setIsLiked] = useState(is_liked);
  const heart = useRef(null);

  const { likingHandler } = usePosts();

  function handelLike() {
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
    <div className="mt-6 flex justify-around p-2">
      <TooltipProvider delayDuration={200}>
        {/* Like Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild onClick={handelLike}>
            <div
              className={cn(
                "flex cursor-pointer items-center gap-1 transition-all duration-200",
                isLiked && "text-red-500",
              )}
            >
              <span className="rounded-full p-2 hover:bg-red-100">
                <Heart
                  ref={heart}
                  strokeWidth={isLiked ? 0 : 2}
                  fill={isLiked ? "red" : "none"}
                />
              </span>
              <span>{like}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" arrowPadding={10}>
            <p>Like</p>
          </TooltipContent>
        </Tooltip>

        {/* Message Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-pointer items-center gap-1 transition-all duration-200 hover:text-green-500">
              <span className="rounded-full p-2 hover:bg-green-300">
                <MessageCircle />
              </span>
              <span>{comments_count}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Message</p>
          </TooltipContent>
        </Tooltip>

        {/* Share Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex cursor-pointer items-center gap-1 transition-all duration-200 hover:text-blue-500">
              <span className="rounded-full p-2 hover:bg-blue-300">
                <Share2 />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Share</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default PostInfo;
