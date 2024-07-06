import { cn } from "@/lib/utils";
import { UserHoverCart } from "../../components/UserHoverCart";

function Comment({
  className,
  user,
  description,
  longAgo,
  innerRef,}) {
  return (
    <li
      className={cn("w-full list-none p-4 border-b", className)}
      ref={innerRef}
    >
      <div className="flex items-center ">
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
        dangerouslySetInnerHTML={{ __html: description }}
      ></p>

      {/* {images && <ImagesCarousel images={images} />} */}

      {/* <PostInfo {...info} post_id={post_id} /> */}
    </li>
  );
}

export default Comment;
