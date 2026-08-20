import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { profileSchema } from "@/lib/validation/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/form-field-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function ProfileTab() {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === "avatar" || key === "cover_image") {
          if (val instanceof File) formData.append(key, val);
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

  if (!user) return null;

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setValue("avatar", file);
    }
  };

  const onCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setValue("cover_image", file);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Edit profile</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Cover image */}
        <div className="relative h-40 w-full bg-muted">
          {coverPreview || user.cover_image ? (
            <img
              src={coverPreview || user.cover_image}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No cover image
            </div>
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/75"
          >
            <Camera className="h-3.5 w-3.5" />
            Change cover
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onCoverChange}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 p-6"
          encType="multipart/form-data"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative -mt-16">
              <Avatar className="h-24 w-24 border-4 border-card shadow">
                <AvatarImage src={avatarPreview || user.avatar} loading="lazy" />
                <AvatarFallback className="text-lg">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition hover:opacity-100"
                aria-label="Change avatar"
              >
                <Camera className="h-6 w-6" />
              </button>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
            <p className="mt-2 text-sm font-medium">{user.first_name} {user.last_name}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>

          {/* Basic info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldGroup label="First name" id="first_name" error={errors.first_name?.message}>
                <Input id="first_name" {...register("first_name")} />
              </FieldGroup>
              <FieldGroup label="Last name" id="last_name" error={errors.last_name?.message}>
                <Input id="last_name" {...register("last_name")} />
              </FieldGroup>
            </div>

            <FieldGroup label="Username" id="username" error={errors.username?.message}>
              <Input id="username" {...register("username")} />
            </FieldGroup>

            <FieldGroup label="Email" id="email" error={errors.email?.message}>
              <Input id="email" type="email" {...register("email")} />
            </FieldGroup>

            <FieldGroup label="Bio" id="bio" error={errors.bio?.message}>
              <Textarea id="bio" rows={3} {...register("bio")} />
            </FieldGroup>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t bg-card/95 px-6 py-4 backdrop-blur">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/profile")}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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
