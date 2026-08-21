import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { SmilePlus } from "lucide-react";
import { lazy, Suspense, useEffect, useRef } from "react";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

function ReplayBox() {
  const { addComment, newComment, setNewComment, isCommenting } = usePosts();
  const { user } = useAuth();

  const textareaRef = useRef(null);

  // Auto-grow up to 120px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [newComment]);

  const handleEmojiClick = ({ emoji }) => {
    const { selectionStart, selectionEnd } = textareaRef.current;
    const newText = `${newComment.slice(0, selectionStart)}${emoji}${newComment.slice(selectionEnd)}`;
    setNewComment(newText);

    textareaRef.current.focus();
    textareaRef.current.selectionStart = selectionEnd + emoji.length;
    textareaRef.current.selectionEnd = selectionEnd + emoji.length;
  };

  const isEmpty = newComment === "";

  const handleOnChange = (e) => {
    const { value } = e.target;
    setNewComment(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (!isEmpty) {
      formData.append("description", newComment);
      await addComment(formData);
      setNewComment("");
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="flex w-full items-end gap-2 rounded-none border-0 border-b border-border bg-card p-2 shadow-none sm:p-3">
        <Avatar className="h-8 w-8 shrink-0 sm:h-9 sm:w-9">
          <AvatarImage src={user?.avatar} alt={user?.username} />
          <AvatarFallback className="text-xs">
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 items-end gap-1 overflow-hidden rounded-none border-0 bg-background px-3 py-1.5 shadow-none focus-within:ring-0 focus-within:outline-none">
          <textarea
            name="text"
            rows={1}
            value={newComment}
            className="max-h-[120px] min-h-[24px] flex-1 resize-none rounded-none border-0 bg-transparent text-[16px] leading-5 text-foreground placeholder:text-muted-foreground/70 shadow-none outline-none focus:outline-none focus:ring-0 sm:text-sm"
            placeholder="Add a comment..."
            onChange={handleOnChange}
            ref={textareaRef}
          ></textarea>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground">
                <SmilePlus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="p-0">
              <Suspense fallback={<div className="w-64 p-3 text-sm">Loading…</div>}>
                <EmojiPicker
                  theme="dark"
                  emojiStyle="native"
                  onEmojiClick={handleEmojiClick}
                  rows={2}
                  perRow={7}
                  emojiSize={28}
                />
              </Suspense>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isEmpty || isCommenting}
          className="min-h-9 shrink-0 rounded-full px-4"
        >
          {isCommenting ? "..." : "Reply"}
        </Button>
      </div>
    </form>
  );
}
export default ReplayBox;
