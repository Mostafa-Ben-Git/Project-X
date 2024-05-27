import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth";
import InputPassWord from "@/components/InputPassWord";
import { ImagePreview } from "@/components/ImagePreview";

function Register() {
  const { register, errors, isLoading, clearErrors } = useAuth();
  const [signUpData, setSignUpData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    avatar: null,
  });

  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, []);

  const avatarRef = useRef(null);

  const handleOnChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const handleSetAvatar = (e) => {
    const file = e.target.files[0];
    // console.log(file);
    setSignUpData({
      ...signUpData,
      avatar: file,
    });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("first_name", signUpData.first_name);
    formData.append("last_name", signUpData.last_name);
    formData.append("email", signUpData.email);
    formData.append("password", signUpData.password);
    formData.append("password_confirmation", signUpData.password_confirmation);
    formData.append("username", signUpData.username);
    formData.append("avatar", signUpData.avatar);
    register(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className=" relative w-full max-w-md space-y-8 rounded-md bg-gray-800 p-8 shadow-md lg:max-w-xl">
        <h2 className="mb-4 text-center text-3xl font-extrabold">Register</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {signUpData.avatar !== null && (
            <ImagePreview
              image={signUpData.avatar}
              OnRemove={() => setSignUpData({ ...signUpData, avatar: null })}
              className="absolute right-0 top-0 h-32 w-32 -translate-y-[20%] translate-x-1/2"
              rounded="full"
              border={4}
            />
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium">
                first_name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="first_name"
                required
                value={signUpData.first_name}
                onChange={handleOnChange}
                className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
              />
              {errors?.first_name && (
                <p className="mt-2 text-xs text-red-600">
                  *{errors.first_name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium">
                last_name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="last_name"
                required
                value={signUpData.last_name}
                onChange={handleOnChange}
                className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
              />
              {errors?.last_name && (
                <p className="mt-2 text-xs text-red-600">*{errors.last_name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={signUpData.email}
                onChange={handleOnChange}
                className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
              />
              {errors?.email && (
                <p className="mt-2 text-xs text-red-600">*{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="username"
                required
                value={signUpData.username}
                onChange={handleOnChange}
                className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
              />
              {errors?.username && (
                <p className="mt-2 text-xs text-red-600">*{errors.username}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <InputPassWord
                id="password"
                name="password"
                required
                value={signUpData.password}
                onChange={handleOnChange}
                className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
              />
              {errors?.password && (
                <p className="mt-2 text-xs text-red-600">
                  *{errors.password[1]}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium"
              >
                Password Confirmation
              </label>
              <InputPassWord
                id="password_confirmation"
                name="password_confirmation"
                required
                value={signUpData.password_confirmation}
                onChange={handleOnChange}
                className=" mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
              />
              {errors?.password && (
                <p className="mt-2 text-xs text-red-600">
                  *{errors.password[0]}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="avatar"
              className="mx-auto flex max-w-max cursor-pointer items-center justify-center rounded-full bg-indigo-500 p-2 text-center text-sm text-white hover:bg-indigo-700 focus:border-indigo-700 focus:outline-none focus:ring"
            >
              Upload Your Avatar (Optional)
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              ref={avatarRef}
              accept="image/*"
              onChange={handleSetAvatar}
              className="hidden"
            />
            {errors?.avatar && (
              <p className="mt-2 text-xs text-red-600">*{errors.avatar}</p>
            )}
          </div>

          <div className="mt-2 text-right text-blue-200 underline">
            <Link to="/login">Already Have an Account?</Link>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-md bg-indigo-500 p-4 text-white hover:bg-indigo-700 focus:border-indigo-700 focus:outline-none focus:ring disabled:cursor-not-allowed"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              {!isLoading ? (
                "Register"
              ) : (
                <MoonLoader color="#ffffff" size={20} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
