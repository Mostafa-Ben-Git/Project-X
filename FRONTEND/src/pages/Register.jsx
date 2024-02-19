import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setInfo, validateRegister } from "../slices/authSlice";

function Register() {
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const {
    info: { errors, message },
    isLaoding,
  } = useSelector((store) => store.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setInfo({}));
  }, [dispatch]);

  const handleSignUp = (e) => {
    e.preventDefault();
    dispatch(validateRegister(signUpData));
  };

  const handleOnChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-900">
      <div className="max-w-sm w-full space-y-8 p-8 bg-gray-500 shadow-md rounded-md lg:max-w-xl">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Register
        </h2>
        {!errors && message != null ? (
          <p className="border border-red-500 bg-red-400 p-2 rounded text-gray-200">
            {message}
          </p>
        ) : null}
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
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
              value={signUpData.name}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
            {errors?.name && (
              <p className="text-red-300 text-xs">*{errors.name}</p>
            )}
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
              value={signUpData.email}
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
              value={signUpData.password}
              onChange={handleOnChange}
              className="mt-1 p-3 w-full border rounded-md"
            />
            {errors?.password[1] && (
              <p className="text-red-300 text-xs">*{errors.password[1]}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password_confirmation"
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 p-3 w-full border rounded-md"
            />
            {errors?.password[0] && (
              <p className="text-red-300 text-xs">*{errors.password[0]}</p>
            )}
          </div>
          <div className="text-right text-blue-200 underline decoration-solid hover:decoration-transparent">
            <Link to="/login">Already Have Account ?</Link>
          </div>
          <div>
            <button
              type="submit"
              className="bg-indigo-500 text-white w-full p-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:border-indigo-700"
              onClick={handleSignUp}
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
