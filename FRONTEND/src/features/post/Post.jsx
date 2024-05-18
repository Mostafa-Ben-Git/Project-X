import { useNavigate } from "react-router-dom";
import { ImagesCarousel } from "./ImagesCarousel";
import PostInfo from "./PostInfo";
import { UserHoverCart } from "./UserHoverCart";
import { cn } from "@/lib/utils";

function Post({
  text,
  longAgo,
  images,
  user,
  innerRef,
  info,
  post_id,
  className,
}) {
  const navgigate = useNavigate();
  const handelClick = (e) => {
    e.stopPropagation();
    navgigate(`/${user.username}/post/${post_id}`);
  };
  return (
    <li
      className={cn("w-full list-none p-4", className)}
      ref={innerRef}
      onClick={handelClick}
    >
      <div className="flex items-center">
        <span>
          <img
            src={user.avatar}
            alt={"avatar of " + user.first_name + " " + user.last_name}
            className="aspect-square max-w-[50px] rounded-full"
          />
        </span>
        <div className="ml-4">
          <UserHoverCart {...user} />
          <span className="text-sm text-gray-400">{longAgo}</span>
        </div>
      </div>
      <p
        className="mt-6 text-lg "
        dangerouslySetInnerHTML={{ __html: text }}
      ></p>

      {images && <ImagesCarousel images={images} />}

      <PostInfo {...info} post_id={post_id} />
    </li>
  );
}
export default Post;
