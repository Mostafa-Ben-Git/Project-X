/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { useAuth } from "../hooks/auth.js";

const Login = () => {
  const { login, errors, isLoading } = useAuth();
  const [loginData, setLoginData] = useState({
    email: "test@example.com",
    password: "1234",
    remember: "",
  });

  const handleOnChange = (e) => {
    const key = e.target.name;
    const value =
      e.target.type == "checkbox" ? e.target.checked : e.target.value;
    setLoginData({ ...loginData, [key]: value });
  };

  function handleLogin(e) {
    e.preventDefault();
    login(loginData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900">
      <div className="max-w-sm w-full space-y-8 p-8 bg-gray-500 shadow-md rounded-md lg:max-w-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Login
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={loginData.email}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
            {errors?.email && (
              <p className="text-white text-xs bg-red-800 border border-red-300 p-1 mt-2 rounded-md">
                *{errors.email}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={loginData.password}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
            {errors?.password && (
              <p className="text-white text-xs bg-red-800 border border-red-300 p-1 mt-2 rounded-md">
                *{errors.password}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-4">
            <input
              type="checkbox"
              name="remember"
              id="box"
              onChange={handleOnChange}
              value={loginData.remember}
              className="scale-150 hover:cursor-pointer"
            />
            <label
              htmlFor="box"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember Me
            </label>
          </div>
          <div className="text-right text-blue-200 underline decoration-solid hover:decoration-transparent">
            <Link to="/register">Create Account</Link>
          </div>
          <div>
            <button
              type="submit"
              className="bg-indigo-500 text-white flex items-center justify-center w-full p-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:border-indigo-700 disabled:cursor-not-allowed"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {!isLoading ? "Login" : <MoonLoader color="#ffffff" size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
