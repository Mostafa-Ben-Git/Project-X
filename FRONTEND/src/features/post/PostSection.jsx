function PostSection({ children, className = "" }) {
  return (
    <div
      className={`flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:gap-4 sm:p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default PostSection;