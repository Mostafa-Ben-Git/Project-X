import { ImagesCarousel } from "./ImagesCarousel";

function Post({ text, longAgo, images, user, innerRef }) {
  return (
    <li
      className="border-state-600 w-full rounded-lg border p-4"
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
          <p className="font-semibold">
            {user.first_name} {user.last_name}
          </p>
          <span className="text-sm text-gray-400">{longAgo}</span>
        </div>
      </div>
      <p className="mt-4" dangerouslySetInnerHTML={{ __html: text }}></p>

      {images && <ImagesCarousel images={images} />}
    </li>
  );
}
export default Post;
