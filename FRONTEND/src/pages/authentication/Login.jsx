import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { loginSchema, loginDefaults } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/form-field-error";

function Login() {
  const { login, isLoggedIn } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaults,
  });

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success("Login successful");
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-extrabold">
            Welcome back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                placeholder="you@example.com"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Create account
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
