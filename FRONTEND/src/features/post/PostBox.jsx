import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import usePosts from "@/hooks/usePosts";
import EmojiPicker from "emoji-picker-react";
import { Image, PinIcon, SmilePlus, X } from "lucide-react";
import { useRef } from "react";

function PostBox() {
  const { addPost, isFetching, newPost, setNewPost ,isPosting} = usePosts();

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
      formData.append("text", newPost.text);
      newPost.images.forEach((image) => {
        formData.append("images[]", image);
      });
      await addPost(formData);
      setNewPost({
        text: "",
        images: [],
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
        <div className="rounded-t-lg bg-white px-4 py-2 dark:bg-gray-800">
          <label htmlFor="comment" className="sr-only">
            Your Post
          </label>
          <textarea
            name="text"
            rows={3}
            value={newPost.text}
            className="w-full border-0 bg-white p-1 text-xl text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Say something..."
            onChange={handleOnChange}
            ref={textareaRef}
          ></textarea>
          <div className="mt-2 flex items-center justify-between space-x-6">
            {newPost.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {newPost.images.map((image, index) => (
                  <ImagePreview
                    key={index}
                    index={index}
                    image={image}
                    handleRemoveImage={handleRemoveImage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row-reverse items-center justify-between border-t px-3 py-2 dark:border-gray-600">
          <button
            type="submit"
            disabled={isEmpty || isPosting}
            className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-xs font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-blue-900"
          >
            {isPosting ? "Posting..." : "Post"}
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
      </div>
    </form>
  );
}

function ImagePreview({ image, handleRemoveImage, index }) {
  return (
    <div className="relative">
      <img
        src={URL.createObjectURL(image)}
        alt="Post Image"
        className="relative aspect-square w-full rounded-md border-2 border-slate-400 object-cover"
      />
      <span
        className="absolute right-2 top-2 grid cursor-pointer place-items-center rounded-full bg-slate-400 p-1"
        onClick={() => handleRemoveImage(index)}
      >
        <X size={20} />
      </span>
    </div>
  );
}
export default PostBox;
