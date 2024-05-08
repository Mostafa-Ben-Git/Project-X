function Post({ username, text, avatar, longAgo }) {
  return (
    <div className="rounded-lg border border-red-600 p-4">
      <div className="flex items-center ">
        <span>
          <img src={avatar} alt="" className="aspect-square rounded-full" />
        </span>
        <div className="ml-4">
          <p className="font-semibold">{username}</p>
          <span className="text-sm text-gray-400">{longAgo}</span>
        </div>
      </div>
      <p className="mt-4">{text}</p>
    </div>
  );
}

export default Post;
