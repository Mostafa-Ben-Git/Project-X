import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiService from "../api/apiService";
import { setErrors, setIsLoading, setUser } from "../slices/authSlice";
import { useState } from "react";

export default function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, errors } = useSelector((store) => store.auth);
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

  const login = async (data) => {
    dispatch(setErrors({}));
    dispatch(setIsLoading(true));
    try {
      await csrf();
      await apiService.post("/login", data);
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

  return {
    login,
    register,
    getUser,
    logout,
    isLoggedIn,
    isLoggedOut,
    user,
    errors,
    isLoading,
  };
}
