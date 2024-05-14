import { PostsProvider } from "@/context/PostsContext";
import GuestLayout from "@/layouts/GuestLayout";
import UserLayout from "@/layouts/UserLayout";
import PageNotFound from "@/pages/PageNotFound";
import Login from "@/pages/authentication/Login";
import Register from "@/pages/authentication/Register";
import FriendsPage from "@/pages/home/FriendsPage";
import HomePage from "@/pages/home/HomePage";
import MessagesPage from "@/pages/home/MessagesPage";
import NotifPage from "@/pages/home/NotifPage";
import ProfilePage from "@/pages/home/ProfilePage";
import { createBrowserRouter, Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PostsProvider>
        <UserLayout />
      </PostsProvider>
    ),
    children: [
      {
        path: "/",
        element: <Navigate to={"/home"} />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "friends",
        element: <FriendsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "messages",
        element: <MessagesPage />,
      },
      {
        path: "notifications",
        element: <NotifPage />,
      },
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to={"/login"} />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },

  {
    path: "*",
    element: <PageNotFound />,
  },
]);

export default router;
