import usePosts from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Dot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImagesCarousel } from "./ImagesCarousel";
import PostInfo from "./PostInfo";
import { UserHoverCart } from "./UserHoverCart";

function Post({
  content,
  dates,
  images,
  user,
  info,
  post_id,
  postData,
  className,
  innerRef,
  type = "post",
  clickable = true,
  extraInfo = false,
}) {
  const nav = useNavigate();
  const handelClick = (e) => {
    e.stopPropagation();
    nav(`/${user.username}/post/${post_id}`, {
      state: {
        postData,
      },
    });
  };
  return (
    <li className={cn("w-full list-none p-4", className)} ref={innerRef}>
      
      <div className="flex items-center">
        <span>
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={user.avatar}
              className="aspect-square max-w-[50px] rounded-full"
            />
            <AvatarFallback>
              {user.first_name[0]}
              {user.last_name[0]}
            </AvatarFallback>
          </Avatar>
        </span>
        <div className="ml-4 space-x-4">
          <UserHoverCart {...user} />
          <span className="text-sm text-gray-400">{dates.ago}</span>
        </div>
      </div>
      <p
        className="mt-6 p-1 text-lg hover:bg-slate-100 hover:bg-opacity-10"
        dangerouslySetInnerHTML={{ __html: content }}
        {...(clickable && { onClick: handelClick })}
      ></p>

      {images && <ImagesCarousel images={images} />}

      {extraInfo && (
        <div className="mt-4 flex items-center space-x-2 border-y-2 text-sm">
          <p>{dates.time}</p>
          <Dot size={40} />
          <p>{dates.date}</p>
        </div>
      )}

      <PostInfo {...info} post_id={post_id} replay={type === "replay"} />
    </li>
  );
}
export default Post;
