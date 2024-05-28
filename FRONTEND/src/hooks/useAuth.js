import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiService from "../api/apiService";
import {
  setErrors,
  setIsLoading,
  setUser,
  setPosts,
  updateUser,
  setSearchResults
  
} from "../slices/authSlice";
import { useState } from "react";
import toast from "react-hot-toast";

export default function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, posts, isLoading, errors,searchResults } = useSelector((store) => store.auth);
  const [isLoggedOut, setisLoggedOut] = useState(false);

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
      if (res.status === 401) {
        localStorage.removeItem(SESSION_NAME);
        navigate("/login");
      }
    } finally {
      // setTimeout(() => dispatch(setIsLoading(false)), 2000);
      dispatch(setIsLoading(false));
    }
  };
  const getUserPosts = async () => {
    dispatch(setIsLoading(true));
    try {
      const { data } = await apiService.get("/api/user/posts");
      dispatch(setPosts(data.data));
    } catch (error) {
      const response = error.response;
      console.error("Error fetching user posts:", response);
    } finally {
      dispatch(setIsLoading(false));
    }
  };
  const updateUserData = async (data) => {
    dispatch(setIsLoading(true));
    try {
      await csrf();
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
      const response = await apiService.get('/api/users/search', {
        params: {
          q: searchQuery
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  };
  // const searchUsers = async (query) => {
  //   dispatch(setIsLoading(true));
  //   try {
  //     const { data } = await apiService.get(`/api/users/search?query=${query}`);
  //     dispatch(setSearchResults(data.data));
  //   } catch (error) {
  //     console.error("Error searching users:", error.response);
  //   } finally {
  //     dispatch(setIsLoading(false));
  //   }
  // };
  
 

  const login = async (data) => {
    dispatch(setErrors({}));
    dispatch(setIsLoading(true));
    try {
      await csrf();
      await apiService.post("/login", data);
      toast.success("Login successfully");
      await getUser();
    } catch (error) {
      const response = error.response;
      if (response && response.status === 422) {
        const { errors } = response.data;
        dispatch(setErrors(errors));
      }
    } finally {
      // setTimeout(() => dispatch(setIsLoading(false)), 2000);
      dispatch(setIsLoading(false));
    }
  };
  const register = async (data) => {
    dispatch(setErrors({}));
    dispatch(setIsLoading(true));
    try {
      await csrf();
      await apiService.post("/register", data);
      toast.success("Registered successfully", { duration: 2000 });
      await getUser();
    } catch (error) {
      const response = error.response;
      if (response && response.status === 422) {
        const { errors } = response.data;
        // console.log(errors, message);
        dispatch(setErrors(errors));
      }
    } finally {
      // setTimeout(() => dispatch(setIsLoading(false)), 2000);
      dispatch(setIsLoading(false));
    }
  };
  const logout = async () => {
    try {
      setisLoggedOut(true);
      await apiService.post("/logout");
      dispatch(setUser(null));
      localStorage.removeItem(SESSION_NAME);
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