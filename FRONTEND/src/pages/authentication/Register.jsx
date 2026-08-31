import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { registerSchema, registerDefaults } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/form-field-error";
import { Logo } from "@/components/logo";
import OAuthButtons from "@/components/OAuthButtons";

function Register() {
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: registerDefaults,
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      toast.success("Account created — welcome!");
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          setError(field, { message: msgs[0] });
        });
      } else {
        toast.error("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Logo size={40} wordmarkSize="lg" />
          </div>
          <CardTitle className="text-center text-2xl font-extrabold">
            Create your account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name">First name</Label>
                <Input id="first_name" {...register("first_name")} aria-invalid={!!errors.first_name} />
                <FieldError message={errors.first_name?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" {...register("last_name")} aria-invalid={!!errors.last_name} />
                <FieldError message={errors.last_name?.message} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" className="lowercase" {...register("username")} aria-invalid={!!errors.username} />
              <FieldError message={errors.username?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} aria-invalid={!!errors.password} />
              <FieldError message={errors.password?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password_confirmation">Confirm password</Label>
              <Input id="password_confirmation" type="password" autoComplete="new-password" {...register("password_confirmation")} aria-invalid={!!errors.password_confirmation} />
              <FieldError message={errors.password_confirmation?.message} />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Already have an account?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <OAuthButtons />
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
