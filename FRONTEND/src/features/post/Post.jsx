function Post({ text, longAgo, image, user }) {
  return (
    <div className="border-state-600 rounded-lg border p-4">
      <div className="flex items-center ">
        <span>
          <img
            src={user.avatar}
            alt=""
            className="max-w-[50px] aspect-square rounded-full"
          />
        </span>
        <div className="ml-4">
          <p className="font-semibold">
            {user.first_name} {user.last_name}
          </p>
          <span className="text-sm text-gray-400">{longAgo}</span>
        </div>
      </div>
      <p className="mt-4">{text}</p>
      {image && <img src={image} alt="Post" className="mt-4 rounded-lg" />}
    </div>
  );
}

export default Post;
