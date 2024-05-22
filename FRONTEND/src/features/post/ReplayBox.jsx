import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import EmojiPicker from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import { useRef } from "react";

function ReplayBox() {
  const { addComment, newComment, setNewComment, isCommenting } = usePosts();
  const { user } = useAuth();

  const textareaRef = useRef(null);

  const handleEmojiClick = ({ emoji }) => {
    const { selectionStart, selectionEnd } = textareaRef.current;
    const newText = `${newComment.slice(0, selectionStart)}${emoji}${newComment.slice(selectionEnd)}`;
    setNewComment(newText);

    // Move caret to the end of the inserted emoji
    textareaRef.current.focus();
    textareaRef.current.selectionStart = selectionEnd + emoji.length;
    textareaRef.current.selectionEnd = selectionEnd + emoji.length;
  };

  const isEmpty = newComment === "";

  const handleOnChange = (e) => {
    const { name, value } = e.target;
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
      <div className="flex w-full gap-6 rounded-t-lg bg-white p-4 px-4 dark:bg-gray-800">
        <Avatar className="flex-none">
          <AvatarImage src={user?.avatar} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex w-1/2 flex-grow overflow-hidden rounded-sm border">
          <textarea
            name="text"
            rows={1}
            value={newComment}
            className=" flex-1 border-0 bg-white p-1 text-xl text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Add Comment..."
            onChange={handleOnChange}
            ref={textareaRef}
          ></textarea>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                className="bg-slate-100 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <SmilePlus />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <button
          type="submit"
          disabled={isEmpty || isCommenting}
          className="inline-flex flex-none items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-xs font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-blue-900"
        >
          {isCommenting ? "Replaying..." : "Replay"}
        </button>
      </div>
    </form>
  );
}
export default ReplayBox;
