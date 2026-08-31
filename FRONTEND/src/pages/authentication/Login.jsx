import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { loginSchema, loginDefaults } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/form-field-error";
import { Logo } from "@/components/logo";
import OAuthButtons from "@/components/OAuthButtons";

function Login() {
  const { login, isLoggedIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaults,
  });

  const fillDemo = () => {
    setValue("email", "test@example.com");
    setValue("password", "12345678");
    toast.info("Demo credentials filled");
  };

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success("Welcome back!");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 422 && err?.response?.data?.errors) {
        const fieldErrors = err.response.data.errors;
        if (fieldErrors.email) setError("email", { message: fieldErrors.email[0] });
        if (fieldErrors.password) setError("password", { message: fieldErrors.password[0] });
      } else {
        toast.error("Invalid email or password");
      }
    }
  };

  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[hsl(var(--ring))] opacity-100" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />

        <div className="relative">
          <Logo variant="inverted" size={36} wordmarkSize="lg" wordmarkClassName="text-primary-foreground" />
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            New — GitHub & Google sign-in
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Connect,
            <br />
            share & discover.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/80">
            Join Project-X — the modern social feed. Follow creators, share moments, and stay in sync in real time.
          </p>
          <ul className="space-y-3 pt-2 text-sm text-primary-foreground/90">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary-foreground" /> End-to-end privacy controls
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary-foreground" /> Realtime posts, likes & messages
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/60">© 2026 Project-X. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-6 lg:px-8">
        <Card className="w-full max-w-[420px] border-border/60 shadow-xl shadow-black/5">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex justify-center lg:hidden">
              <Logo size={36} wordmarkSize="lg" />
            </div>
            <div className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription>Sign in to your account to continue</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2.5">
              <div className="text-xs">
                <p className="font-medium leading-none">Demo account</p>
                <p className="text-muted-foreground">test@example.com / 12345678</p>
              </div>
              <Button type="button" variant="secondary" size="sm" className="h-7 text-xs" onClick={fillDemo}>
                Fill
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    placeholder="you@example.com"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                <FieldError message={errors.email?.message} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-xs text-muted-foreground hover:text-primary" tabIndex={-1}>
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    placeholder="••••••••"
                    className="pl-9 pr-9"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox id="remember" {...register("remember")} />
                  Remember me
                </label>
                <Link to="/register" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  Create account
                </Link>
              </div>

              <Button type="submit" className="w-full h-10 text-sm font-semibold" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              <span className="bg-card px-2">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <OAuthButtons />

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing in you agree to our Terms and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
