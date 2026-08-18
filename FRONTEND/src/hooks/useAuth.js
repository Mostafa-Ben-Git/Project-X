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
  let isLoggedIn = localStorage.getItem(SESSION_NAME) === "true" && !!localStorage.getItem("token");

  const getUser = async () => {
    dispatch(setIsLoading(true));
    try {
      const { data } = await apiService.get("/api/user");
      dispatch(setUser(data.data || data));
      localStorage.setItem(SESSION_NAME, "true");
    } catch (e) {
      if (e.response && e.response.status === 401) {
        localStorage.removeItem(SESSION_NAME);
        localStorage.removeItem("token");
        dispatch(setUser(null));
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
      dispatch(updateUser(response.data.data || response.data));
      toast.success("Profile updated");
    } catch (error) {
      console.error("Error updating user data:", error.response);
      toast.error("Failed to update profile");
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

  // Token-based login via controller
  const login = async (data) => {
    dispatch(setErrors({}));
    dispatch(setIsLoading(true));
    try {
      const response = await apiService.post("/api/token-login", data);
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem(SESSION_NAME, "true");
      dispatch(setUser(userData.data || userData));

      toast.success("Login successful");
      navigate("/home");
    } catch (error) {
      const response = error.response;
      if (response && response.status === 422) {
        dispatch(setErrors(response.data.errors || {}));
      } else if (response && response.status === 401) {
        dispatch(setErrors({ email: ["Invalid credentials"] }));
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed");
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const register = async (data) => {
    dispatch(setErrors({}));
    dispatch(setIsLoading(true));
    try {
      await apiService.post("/register", data);
      toast.success("Registered successfully");

      // Auto-login after registration
      const loginResponse = await apiService.post("/api/token-login", {
        email: data.email,
        password: data.password,
      });
      const { token, user: userData } = loginResponse.data;
      localStorage.setItem("token", token);
      localStorage.setItem(SESSION_NAME, "true");
      dispatch(setUser(userData.data || userData));
      navigate("/home");
    } catch (error) {
      const response = error.response;
      if (response && response.status === 422) {
        dispatch(setErrors(response.data.errors || {}));
      } else {
        toast.error("Registration failed");
      }
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const logout = async () => {
    try {
      setisLoggedOut(true);
      await apiService.post("/api/logout").catch(() => {});
    } finally {
      dispatch(setUser(null));
      localStorage.removeItem(SESSION_NAME);
      localStorage.removeItem("token");
      setisLoggedOut(false);
      navigate("/login");
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
