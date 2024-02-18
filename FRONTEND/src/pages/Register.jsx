/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "../api/apiService";
import { validateLogin } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [user, setUser] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    try {
      dispatch(validateLogin(user));
      navigate("/home");
    } catch (error) {
      console.log(error);
    }
  };

  const handleOnChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900">
      <div className="max-w-sm w-full space-y-8 p-8 bg-gray-500 shadow-md rounded-md lg:max-w-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Register
        </h2>
        <form className="mt-8 space-y-6" onSubmit={(e) => handleLogin(e)}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={user.name}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={user.email}
              onChange={handleOnChange}
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
              value={user.password}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="password_confirmation"
              className="block text-sm font-medium text-gray-700"
            >
              password_confirmation
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="current-password"
              required
              value={user.password_confirmation}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
          </div>
          <div className="text-right text-blue-200 underline decoration-solid hover:decoration-transparent">
            <Link to="/login">Already Have Account ?</Link>
          </div>
          <div>
            <button
              type="submit"
              className="bg-indigo-500 text-white w-full p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:border-indigo-700"
              onClick={handleLogin}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
