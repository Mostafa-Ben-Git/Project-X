/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import useAuth from "../../hooks/useAuth.js";

const Login = () => {
  const { login, errors, isLoading } = useAuth();
  const [loginData, setLoginData] = useState({
    email: "test@example.com",
    password: "12345678",
    remember: false,
  });

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
    <div className="min-h-screen flex items-center justify-center bg-slate-500 text-white">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 shadow-md rounded-md lg:max-w-xl">
        <h2 className="text-3xl font-extrabold text-center mb-4">Login</h2>
        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
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
              className="mt-1 p-3 w-full bg-gray-700 border rounded-md focus:outline-none focus:border-indigo-400"
            />
            {errors?.email && (
              <p className="text-red-600 text-xs mt-2">*{errors.email}</p>
            )}
          </div>
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
              value={loginData.password}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full bg-gray-700 border rounded-md focus:outline-none focus:border-indigo-400"
            />
            {errors?.password && (
              <p className="text-red-600 text-xs mt-2">*{errors.password}</p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-2">
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
              className="bg-indigo-600 text-white flex items-center justify-center w-full p-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:border-indigo-700 disabled:cursor-not-allowed"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {!isLoading ? "Login" : <MoonLoader color="#ffffff" size={30} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
