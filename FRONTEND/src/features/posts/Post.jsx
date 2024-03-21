function Post({ username, body }) {
  return (
    <div className="p-4 border border-red-600 rounded-lg">
      <div className="flex items-center ">
        <span>
          <img
            src="https://ui-avatars.com/api/?background=3730a3&color=c7d2fe&bold=true"
            alt=""
            className="aspect-square rounded-full"
          />
        </span>
        <div className="ml-4">
          <p className="font-semibold">{username}</p>
          <span className="text-sm text-gray-400">2 days ago</span>
        </div>
      </div>
      <p className="mt-4">{body}</p>
    </div>
  );
}

export default Post;
