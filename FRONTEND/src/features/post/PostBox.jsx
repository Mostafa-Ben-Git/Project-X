import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import useAuth from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import { Image, PinIcon, SmilePlus } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { MoonLoader } from "react-spinners";
import { ImagePreview } from "../../components/ImagePreview";

function PostBox({ className, parent_id, isReplay = false }) {
  const { addPost, isFetching, isPosting } = usePosts();

  const { user, isLoading } = useAuth();
  const [newPost, setNewPost] = useState({
    text: "",
    images: [],
  });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleEmojiClick = ({ emoji }) => {
    const { selectionStart, selectionEnd } = textareaRef.current;
    const newText = `${newPost.text.slice(0, selectionStart)}${emoji}${newPost.text.slice(selectionEnd)}`;
    setNewPost({ ...newPost, text: newText });

    // Move caret to the end of the inserted emoji
    textareaRef.current.focus();
    textareaRef.current.selectionStart = selectionEnd + emoji.length;
    textareaRef.current.selectionEnd = selectionEnd + emoji.length;
  };

  const handleUpload = () => {
    fileInputRef.current.click();
  };

  const isEmpty = newPost.text === "" && newPost.images.length === 0;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  const handleSetImage = (e) => {
    const file = e.target.files[0];
    setNewPost({
      ...newPost,
      images: [...newPost.images, file],
    });
  };

  const handleRemoveImage = (index) => {
    setNewPost({
      ...newPost,
      images: newPost.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (!isEmpty) {
      formData.append("content", newPost.text);
      if (parent_id) {
        formData.append("parent_id", parent_id);
      }
      newPost.images.forEach((image) => {
        formData.append("images[]", image);
      });
      await addPost(formData);

      setNewPost({
        text: "",
        images: [],
      });

      toast(`Your ${isReplay ? "reply" : "post"} has been saved.`, {
        icon: "✅",
        position: "bottom-right",
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "hsl(var(--border))",
          borderRadius: "hsl(var(--ring))",
        },
      });
      // Reset the for,
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className={cn("w-full border bg-popover", className)}
    >
      <div className="my-2 flex items-center justify-between gap-3 rounded-t-lg px-2">
        <UserAvatar user={user} />
        <Textarea
          name="text"
          value={newPost.text}
          className="w-full border p-1 text-xl outline-none"
          placeholder={isReplay ? "Reply..." : "Say something..."}
          onChange={handleOnChange}
          ref={textareaRef}
        />
      </div>

      {newPost.images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-3">
          {newPost.images.map((image, index) => (
            <ImagePreview
              key={index}
              image={image}
              OnRemove={() => handleRemoveImage(index)}
              rounded="md"
              border={2}
            />
          ))}
        </div>
      )}

      <div className="flex flex-row-reverse items-center justify-between border-t px-3 py-2 dark:border-gray-600">
        <button
          type="submit"
          disabled={isEmpty || isPosting}
          className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-xs font-medium  hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-blue-900"
        >
          {isPosting ? (
            <MoonLoader color="white" size={20} />
          ) : isReplay ? (
            "Reply"
          ) : (
            "Post"
          )}
        </button>
        <div className="flex space-x-1 ps-0 sm:ps-2 rtl:space-x-reverse">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <PinIcon />
            <span className="sr-only">Attach file</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                className="bg-transparent p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <SmilePlus />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <EmojiPicker
                theme="dark"
                emojiStyle="native"
                onEmojiClick={handleEmojiClick}
                rows={4}
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
          <button
            type="button"
            onClick={handleUpload}
            className="inline-flex cursor-pointer items-center justify-center rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <Image />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleSetImage}
              style={{ display: "none" }}
            />
            <span className="sr-only">Upload image</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default PostBox;
