/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setInfo, validateLogin } from "../slices/authSlice";

const Login = () => {
  const [login, setLogin] = useState({
    email: "test@c.com",
    password: "12345678",
  });

  const {
    info: { errors, message },
    isLoading,
  } = useSelector((store) => store.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInfo({}));
  }, [dispatch]);

  const handleOnChange = (e) => {
    setLogin({ ...login, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(validateLogin(login));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900">
      <div className="max-w-sm w-full space-y-8 p-8 bg-gray-500 shadow-md rounded-md lg:max-w-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Login
        </h2>
        {!errors && message != null ? (
          <p className="border border-red-500 bg-red-400 p-2 rounded text-gray-200">
            {message}
          </p>
        ) : null}
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
              value={login.email}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
            {errors?.email && (
              <p className="text-red-300 text-xs">*{errors.email}</p>
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
              value={login.password}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
            {errors?.password && (
              <p className="text-red-300 text-xs">*{errors.password}</p>
            )}
          </div>
          <div className="text-right text-blue-200 underline decoration-solid hover:decoration-transparent">
            <Link to="/register">Create Account</Link>
          </div>
          <div>
            <button
              type="submit"
              className="bg-indigo-500 text-white w-full p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:border-indigo-700 disabled:cursor-not-allowed"
              onClick={handleLogin}
              disabled={isLoading}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
