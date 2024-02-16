/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "../api/apiService";
import { validateLogin } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [login, setLogin] = useState({
    email: "evert58@example.net",
    password: "passwor",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(validateLogin(login));
    // navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900">
      <div className="max-w-sm w-full space-y-8 p-8 bg-gray-500 shadow-md rounded-md lg:max-w-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Login
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.value.target })}
              className="mt-1 p-3 w-full border rounded-md"
            />
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
              onChange={(e) => setLogin({ ...login, password: e.value.target })}
              className="mt-1 p-3 w-full border rounded-md"
            />
          </div>
          <div className="text-right text-blue-200 underline decoration-solid hover:decoration-transparent">
            <Link to="/register">Create Account</Link>
          </div>
          <div>
            <button
              type="submit"
              className="bg-indigo-500 text-white w-full p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:border-indigo-700"
              onClick={handleLogin}
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
