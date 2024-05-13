
import usePost from "@/hooks/usePost";
import { Image, LocateFixedIcon, PinIcon, X } from "lucide-react";
import { useRef, useState } from "react";

function PostBox() {
  const { addPost, isFetching } = usePost();

  const [postData, setPostData] = useState({
    text: "",
    images: [],
  });
  const fileInputRef = useRef(null);

  const handleUpload = () => {
    fileInputRef.current.click();
  };

  const isEmpty = postData.text === "" && postData.images.length === 0;

  const handleOnChange = (e) => {
    const key = e.target.name;
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setPostData({ ...postData, [key]: value });
  };

  const handleSetImage = (e) => {
    const file = e.target.files[0];
    setPostData({
      ...postData,
      images: [...postData.images, file],
    });
  };

  const handleRemoveImage = (index) => {
    setPostData({
      ...postData,
      images: postData.images.filter((_, i) => i !== index),
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData();
        if (!isEmpty) {
          formData.append("text", postData.text);
          postData.images.forEach((image) => {
            formData.append("images[]", image);
          });

          addPost(formData);
        }
      }}
      encType="multipart/form-data"
    >
      <div className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
        <div className="rounded-t-lg bg-white px-4 py-2 dark:bg-gray-800">
          <label htmlFor="comment" className="sr-only">
            Your Post
          </label>
          <textarea
            name="text"
            rows={3}
            className="w-full border-0 bg-white px-0 text-xl text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Say something..."
            onChange={handleOnChange}
            required
          ></textarea>
          <div className="mt-2 flex items-center justify-between space-x-6">
            {postData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {postData.images.map((image, index) => (
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
            disabled={isEmpty || isFetching}
            className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-xs font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-blue-900"
          >
            {isFetching ? "Posting..." : "Post"}
          </button>
          <div className="flex space-x-1 ps-0 sm:ps-2 rtl:space-x-reverse">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <PinIcon />
              <span className="sr-only">Attach file</span>
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center justify-center rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <LocateFixedIcon />
              <span className="sr-only">Set location</span>
            </button>
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
