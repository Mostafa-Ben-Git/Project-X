import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Lock, User, Shield, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { profileSchema } from "@/lib/validation/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/form-field-error";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { changePassword } from "@/api/users";
import { useState } from "react";

function EditProfilePage() {
  const { user, updateUserData, logout } = useAuth();
  const navigate = useNavigate();
  const [pwdLoading, setPwdLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      is_private: user?.is_private || false,
      language: user?.language || "en",
      status: user?.status || "online",
    },
  });

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === "avatar" || key === "cover_image") {
          if (val instanceof File) formData.append(key, val);
        } else if (key === "is_private") {
          formData.append(key, val ? "1" : "0");
        } else {
          formData.append(key, val ?? "");
        }
      });
      await updateUserData(formData);
      toast.success("Profile updated");
      navigate("/profile");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    const form = e.target;
    const current = form.current_password.value;
    const newPwd = form.new_password.value;
    const confirm = form.confirm_password.value;
    if (!current || !newPwd) return toast.error("Fill all fields");
    if (newPwd.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPwd !== confirm) return toast.error("Passwords don't match");
    setPwdLoading(true);
    try {
      await changePassword({ current_password: current, new_password: newPwd, new_password_confirmation: confirm });
      toast.success("Password updated");
      form.reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="mx-auto max-w-xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/profile" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Account settings</h1>
      </div>

      {/* Profile section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User size={18} /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} loading="lazy" />
              <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" encType="multipart/form-data">
            <FieldGroup label="Username" id="username" error={errors.username?.message}>
              <Input id="username" {...register("username")} />
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="First name" id="first_name" error={errors.first_name?.message}>
                <Input id="first_name" {...register("first_name")} />
              </FieldGroup>
              <FieldGroup label="Last name" id="last_name" error={errors.last_name?.message}>
                <Input id="last_name" {...register("last_name")} />
              </FieldGroup>
            </div>

            <FieldGroup label="Email" id="email" error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </FieldGroup>

            <FieldGroup label="Bio" id="bio" error={errors.bio?.message}>
              <Textarea id="bio" rows={3} {...register("bio")} />
            </FieldGroup>

            <div className="space-y-1.5">
              <Label htmlFor="avatar">Avatar</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={(e) => setValue("avatar", e.target.files?.[0])} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cover_image">Cover image</Label>
              <Input id="cover_image" type="file" accept="image/*" onChange={(e) => setValue("cover_image", e.target.files?.[0])} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy & Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield size={18} /> Privacy & preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Private account</p>
              <p className="text-sm text-muted-foreground">Only followers can see your posts</p>
            </div>
            <Switch
              checked={watch("is_private")}
              onCheckedChange={(val) => setValue("is_private", val)}
            />
          </div>
          <Separator />

          <FieldGroup label="Status" id="status" error={errors.status?.message}>
            <select id="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("status")}>
              <option value="online">🟢 Online</option>
              <option value="away">🟡 Away</option>
              <option value="offline">⚫ Offline</option>
              <option value="dnd">🔴 Do not disturb</option>
            </select>
          </FieldGroup>

          <FieldGroup label="Language" id="language" error={errors.language?.message}>
            <select id="language" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("language")}>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
            </select>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Password section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock size={18} /> Change password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current_password">Current password</Label>
              <Input id="current_password" type="password" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new_password">New password</Label>
              <Input id="new_password" type="password" required minLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">Confirm new password</Label>
              <Input id="confirm_password" type="password" required minLength={8} />
            </div>
            <Button type="submit" variant="outline" disabled={pwdLoading}>
              {pwdLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield size={18} /> Account info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Followers</span>
            <span>{user.followers_count ?? 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Following</span>
            <span>{user.following_count ?? 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Posts</span>
            <span>{user.posts_count ?? 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-destructive/50">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="font-medium">Sign out</p>
            <p className="text-sm text-muted-foreground">You&apos;ll need to log in again</p>
          </div>
          <Button variant="destructive" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function FieldGroup({ label, id, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

export default EditProfilePage;
