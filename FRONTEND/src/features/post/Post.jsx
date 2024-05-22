import { useNavigate } from "react-router-dom";
import { ImagesCarousel } from "./ImagesCarousel";
import PostInfo from "./PostInfo";
import { UserHoverCart } from "./UserHoverCart";
import { cn } from "@/lib/utils";
import usePosts from "@/hooks/usePosts";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

function Post({
  content,
  longAgo,
  images,
  user,
  innerRef,
  info,
  post_id,
  className,
  clickable = true,
}) {
  const navgigate = useNavigate();
  const { setCurrentPost } = usePosts();
  const handelClick = (e) => {
    e.stopPropagation();
    setCurrentPost(null);
    navgigate(`/${user.username}/post/${post_id}`);
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
        <div className="ml-4">
          <UserHoverCart {...user} />
          <span className="text-sm text-gray-400">{longAgo}</span>
        </div>
      </div>
      <p
        className="mt-6 p-1 text-lg hover:bg-slate-100 hover:bg-opacity-10"
        dangerouslySetInnerHTML={{ __html: content }}
        {...(clickable && { onClick: handelClick })}
      ></p>

      {images && <ImagesCarousel images={images} />}

      <PostInfo {...info} post_id={post_id} />
    </li>
  );
}
export default Post;
