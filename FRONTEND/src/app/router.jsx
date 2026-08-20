/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { PostsProvider } from "@/context/PostsContext";
import GuestLayout from "@/layouts/GuestLayout";
import UserLayout from "@/layouts/UserLayout";
import LoaderCircle from "@/components/LoaderCircle";
import { createBrowserRouter, Navigate } from "react-router-dom";

// ── Route-level code splitting ──
const PageNotFound = lazy(() => import("@/pages/PageNotFound"));
const Login = lazy(() => import("@/pages/authentication/Login"));
const Register = lazy(() => import("@/pages/authentication/Register"));
const PostPage = lazy(() => import("@/pages/dynamic/PostPage"));
const FriendsPage = lazy(() => import("@/pages/home/FriendsPage"));
const HomePage = lazy(() => import("@/pages/home/HomePage"));
const MessagesPage = lazy(() => import("@/pages/home/MessagesPage"));
const NotifPage = lazy(() => import("@/pages/home/NotifPage"));
const ProfilePage = lazy(() => import("@/pages/home/ProfilePage"));
const SettingsLayout = lazy(() => import("@/pages/settings/SettingsLayout"));
const ProfileTab = lazy(() => import("@/pages/settings/tabs/ProfileTab"));
const PasswordTab = lazy(() => import("@/pages/settings/tabs/PasswordTab"));
const PrivacyTab = lazy(() => import("@/pages/settings/tabs/PrivacyTab"));
const AccountTab = lazy(() => import("@/pages/settings/tabs/AccountTab"));

function PageLoader({ children }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoaderCircle />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

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
        element: (
          <PageLoader>
            <HomePage />
          </PageLoader>
        ),
      },
      {
        path: "friends",
        element: (
          <PageLoader>
            <FriendsPage />
          </PageLoader>
        ),
      },
      {
        path: "profile",
        element: (
          <PageLoader>
            <ProfilePage />
          </PageLoader>
        ),
      },
      {
        path: "profile/:username",
        element: (
          <PageLoader>
            <ProfilePage />
          </PageLoader>
        ),
      },
      {
        path: "settings",
        element: (
          <PageLoader>
            <SettingsLayout />
          </PageLoader>
        ),
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <PageLoader><ProfileTab /></PageLoader> },
          { path: "password", element: <PageLoader><PasswordTab /></PageLoader> },
          { path: "privacy", element: <PageLoader><PrivacyTab /></PageLoader> },
          { path: "account", element: <PageLoader><AccountTab /></PageLoader> },
        ],
      },
      {
        path: "messages",
        element: (
          <PageLoader>
            <MessagesPage />
          </PageLoader>
        ),
      },
      {
        path: "messages/:userId",
        element: (
          <PageLoader>
            <MessagesPage />
          </PageLoader>
        ),
      },
      {
        path: "notifications",
        element: (
          <PageLoader>
            <NotifPage />
          </PageLoader>
        ),
      },
      {
        path: "/:username/post/:post_id",
        element: (
          <PageLoader>
            <PostPage />
          </PageLoader>
        ),
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
        element: (
          <PageLoader>
            <Login />
          </PageLoader>
        ),
      },
      {
        path: "/register",
        element: (
          <PageLoader>
            <Register />
          </PageLoader>
        ),
      },
    ],
  },

  {
    path: "*",
    element: (
      <PageLoader>
        <PageNotFound />
      </PageLoader>
    ),
  },
]);

export default router;
