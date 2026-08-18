import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiService from "../api/apiService";
import {
  setErrors,
  setIsLoading,
  setUser,
  setPosts,
  updateUser,
} from "../slices/authSlice";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

export default function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, posts, isLoading, errors, searchResults } = useSelector(
    (store) => store.auth
  );
  const [isLoggedOut, setisLoggedOut] = useState(false);
  const getUserPostsCalled = useRef(false);

  const SESSION_NAME = "userLogedIn";
  let isLoggedIn = localStorage.getItem(SESSION_NAME) == "true";

  const csrf = () => apiService.get("/sanctum/csrf-cookie");

  const getUser = async () => {
    dispatch(setIsLoading(true));
    try {
      const { data } = await apiService.get("/api/user");
      dispatch(setUser(data));
      localStorage.setItem(SESSION_NAME, "true");
    } catch (e) {
      const res = e.response;
      if (res && res.status === 401) {
        localStorage.removeItem(SESSION_NAME);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const getUserPosts = async () => {
    if (getUserPostsCalled.current) return;
    getUserPostsCalled.current = true;
    dispatch(setIsLoading(true));
    try {
      const { data } = await apiService.get("/api/user/posts");
      dispatch(setPosts(data.data));
    } catch (error) {
      console.error("Error fetching user posts:", error.response);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const updateUserData = async (data) => {
    dispatch(setIsLoading(true));
    try {
      const response = await apiService.put(`/api/users/${user.id}`, data);
      dispatch(updateUser(response.data));
    } catch (error) {
      console.error("Error updating user data:", error.response);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const searchUsers = async (searchQuery) => {
    try {
      const response = await apiService.get("/api/users/search", {
        params: { q: searchQuery },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  };

  // Token-based login
  const login = async (data) => {
    dispatch(setErrors({}));
    dispatch(setIsLoading(true));
    try {
      const response = await apiService.post("/api/token-login", data);
      const { token, user: userData } = response.data;

      // Store token
      localStorage.setItem("token", token);
      localStorage.setItem(SESSION_NAME, "true");

      // Set user in Redux
      dispatch(setUser(userData));

      toast.success("Login successfully");
      navigate("/home");
    } catch (error) {
      const response = error.response;
      if (response && response.status === 422) {
        dispatch(setErrors(response.data.errors || {}));
      } else if (response && response.status === 401) {
        dispatch(setErrors({ email: ["Invalid credentials"] }));
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  // Token-based register
  const register = async (data) => {
    dispatch(setErrors({}));
    dispatch(setIsLoading(true));
    try {
      // Register via Breeze endpoint (session-based, works for registration)
      await csrf();
      await apiService.post("/register", data);
      toast.success("Registered successfully", { duration: 2000 });

      // Auto-login after registration
      const loginResponse = await apiService.post("/api/token-login", {
        email: data.email,
        password: data.password,
      });
      const { token, user: userData } = loginResponse.data;
      localStorage.setItem("token", token);
      localStorage.setItem(SESSION_NAME, "true");
      dispatch(setUser(userData));
      navigate("/home");
    } catch (error) {
      const response = error.response;
      if (response && response.status === 422) {
        dispatch(setErrors(response.data.errors || {}));
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const logout = async () => {
    try {
      setisLoggedOut(true);
      // Revoke token on server
      await apiService.post("/api/logout").catch(() => {});
      dispatch(setUser(null));
      localStorage.removeItem(SESSION_NAME);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (e) {
      console.warn(e);
    } finally {
      setisLoggedOut(false);
    }
  };

  const clearErrors = () => dispatch(setErrors({}));

  return {
    clearErrors,
    login,
    register,
    getUser,
    updateUserData,
    getUserPosts,
    logout,
    searchResults,
    isLoggedIn,
    isLoggedOut,
    user,
    posts,
    searchUsers,
    errors,
    isLoading,
  };
}
