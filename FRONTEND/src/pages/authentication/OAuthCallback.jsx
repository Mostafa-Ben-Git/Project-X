import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import apiService from "@/api/apiService";
import LoaderCircle from "@/components/LoaderCircle";
import { setUser } from "@/slices/authSlice";

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const detail = searchParams.get("detail");

    window.history.replaceState({}, "", "/auth/callback");

    if (error || !token) {
      localStorage.removeItem("token");
      localStorage.removeItem("userLogedIn");
      const msg =
        error === "provider_denied"
          ? "Sign-in was cancelled"
          : error === "oauth_failed"
            ? `GitHub sign-in failed${detail ? `: ${detail}` : " — check that the app's callback URL is http://localhost:8000/api/auth/github/callback and the secret is correct"}`
            : error === "email_unavailable"
              ? "GitHub didn't return an email — make sure your GitHub email is public or grant email permission"
              : "Social sign-in failed";
      toast.error(msg, { duration: 6000 });
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("userLogedIn", "true");

    (async () => {
      try {
        const { data } = await apiService.get("/api/user");
        dispatch(setUser(data.data || data));
        toast.success("Signed in successfully");
        navigate("/home", { replace: true });
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("userLogedIn");
        const status = e?.response?.status;
        toast.error(status === 401 ? "Token rejected — please try again" : `Social sign-in failed (GET /api/user → ${status || "network error"})`, {
          duration: 6000,
        });
        navigate("/login", { replace: true });
      }
    })();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle size={28} />
        <p className="text-sm text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}

export default OAuthCallback;
