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
import { lazy, Suspense, useRef } from "react";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

function ReplayBox() {
  const { addComment, newComment, setNewComment, isCommenting } = usePosts();
  const { user } = useAuth();

  const textareaRef = useRef(null);

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
      <div className="flex w-full gap-2 rounded-lg border border-border bg-card p-3">
        <Avatar className="flex-none">
          <AvatarImage src={user?.avatar} alt={user?.username} />
          <AvatarFallback>
            {user?.first_name?.[0]}
            {user?.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-grow items-center overflow-hidden rounded-sm border border-border bg-background">
          <textarea
            name="text"
            rows={1}
            value={newComment}
            className="flex-1 resize-none truncate bg-transparent p-1 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            placeholder="Add Comment..."
            onChange={handleOnChange}
            ref={textareaRef}
          ></textarea>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                <SmilePlus />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Suspense fallback={<div className="w-64 p-2 text-sm">Loading…</div>}>
                <EmojiPicker
                  theme="dark"
                  emojiStyle="native"
                  onEmojiClick={handleEmojiClick}
                  rows={2}
                  perRow={8}
                  emojiSize={32}
                  pickerStyle={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                  }}
                />
              </Suspense>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isEmpty || isCommenting}
        >
          {isCommenting ? "Replaying..." : "Replay"}
        </Button>
      </div>
    </form>
  );
}
export default ReplayBox;
