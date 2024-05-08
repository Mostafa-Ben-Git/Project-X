import { useState } from "react";
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
  });

  const handleOnChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    register(signUpData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 shadow-md rounded-md lg:max-w-xl">
        <h2 className="text-3xl font-extrabold text-center mb-4">Register</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="mt-1 p-3 w-full bg-gray-700 border rounded-md focus:outline-none focus:border-indigo-400"
              />
              {errors?.first_name && (
                <p className="text-red-600 text-xs mt-2">
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
                className="mt-1 p-3 w-full bg-gray-700 border rounded-md focus:outline-none focus:border-indigo-400"
              />
              {errors?.last_name && (
                <p className="text-red-600 text-xs mt-2">*{errors.last_name}</p>
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
              className="mt-1 p-3 w-full bg-gray-700 border rounded-md focus:outline-none focus:border-indigo-400"
            />
            {errors?.email && (
              <p className="text-red-600 text-xs mt-2">*{errors.email}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="mt-1 p-3 w-full bg-gray-700 border rounded-md focus:outline-none focus:border-indigo-400"
              />
              {errors?.password && (
                <p className="text-red-600 text-xs mt-2">
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
                className="mt-1 p-3 w-full bg-gray-700 border rounded-md focus:outline-none focus:border-indigo-400"
              />
              {errors?.password && (
                <p className="text-red-600 text-xs mt-2">
                  *{errors.password[0]}
                </p>
              )}
            </div>
          </div>
          <div className="text-right text-blue-200 underline mt-2">
            <Link to="/login">Already Have an Account?</Link>
          </div>
          <div>
            <button
              type="submit"
              className="bg-indigo-500 text-white flex items-center justify-center w-full p-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring focus:border-indigo-700 disabled:cursor-not-allowed"
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
