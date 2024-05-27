/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth.js";
import InputPassWord from "@/components/InputPassWord.jsx";

const Login = () => {
  const { login, errors, isLoading, clearErrors } = useAuth();
  const [loginData, setLoginData] = useState({
    email: "test@example.com",
    password: "12345678",
    remember: false,
  });

  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, []);

  const handleOnChange = (e) => {
    const key = e.target.name;
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setLoginData({ ...loginData, [key]: value });
  };

  function handleLogin(e) {
    e.preventDefault();
    login(loginData);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md space-y-8 rounded-md bg-gray-800 p-8 shadow-md lg:max-w-xl">
        <h2 className="mb-4 text-center text-3xl font-extrabold">Login</h2>
        <form
          className="mt-8 space-y-4"
          onSubmit={handleLogin}
          encType="multipart/form-data"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
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
              className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
            />
            {errors?.email && (
              <p className="mt-2 text-xs text-red-600">*{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <InputPassWord
              id="password"
              name="password"
              required
              value={loginData.password}
              onChange={handleOnChange}
              className="mt-1 w-full rounded-md border bg-gray-700 p-3 focus:border-indigo-400 focus:outline-none"
            />
            {errors?.password && (
              <p className="mt-2 text-xs text-red-600">*{errors.password}</p>
            )}
          </div>
          <div className="ml-2 flex items-center gap-3">
            <input
              type="checkbox"
              name="remember"
              id="box"
              onChange={handleOnChange}
              checked={loginData.remember}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <label htmlFor="box" className="text-sm font-medium">
              Remember Me
            </label>
          </div>
          <div className="text-right underline hover:text-indigo-300">
            <Link to="/register">Create Account</Link>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-md bg-indigo-600 p-4 text-white hover:bg-indigo-700 focus:border-indigo-700 focus:outline-none focus:ring disabled:cursor-not-allowed"
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
