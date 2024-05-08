function PostSection({ children }) {
  return (
    <div className=" flex h-full flex-col gap-4 border border-red-600">
      {children}
    </div>
  );
}

export default PostSection;
