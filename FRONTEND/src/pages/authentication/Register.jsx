import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth";

function Register() {
  const { register, errors, isLoading } = useAuth();
  const [signUpData, setSignUpData] = useState({
    first_name: "john",
    last_name: "doe",
    email: "john@example.com",
    password: "12345678",
    password_confirmation: "12345678",
    avatar: null,
  });
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
    formData.append("avatar", signUpData.avatar);
    register(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className=" relative w-full max-w-md space-y-8 rounded-md bg-gray-800 p-8 shadow-md lg:max-w-xl">
        <h2 className="mb-4 text-center text-3xl font-extrabold">Register</h2>
        <form className="  mt-8 space-y-6" onSubmit={handleSignUp}>
          {signUpData.avatar !== null && (
            <img
              src={URL.createObjectURL(signUpData.avatar)}
              alt="Post Image"
              className="absolute right-0 top-0 aspect-square w-28 translate-x-[50%] rounded-full border-2 object-cover"
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
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
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                autoComplete="current-password"
                required
                value={signUpData.password_confirmation}
                onChange={handleOnChange}
                className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
              />
              {errors?.password && (
                <p className="mt-2 text-xs text-red-600">
                  *{errors.password[0]}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Avatar
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              ref={avatarRef}
              accept="image/*"
              onChange={handleSetAvatar}
              className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
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
