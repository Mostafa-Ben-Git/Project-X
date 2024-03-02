import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiService from "../api/apiService";
import { setErrors, setIsLoading, setUser } from "../slices/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, errors } = useSelector((store) => store.auth);

  const SESSION_NAME = "userLogedIn";
  let isLoggedIn = localStorage.getItem(SESSION_NAME) == "true";

  const csrf = () => apiService.get("/sanctum/csrf-cookie");

  const getUser = async () => {
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
      await apiService.post("/logout");
      dispatch(setUser(null));
      localStorage.removeItem(SESSION_NAME);
      navigate("/login");
    } catch (e) {
      console.warn(e);
    }
  };

  return {
    login,
    register,
    getUser,
    logout,
    isLoggedIn,
    user,
    errors,
    isLoading,
  };
};
