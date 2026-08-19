import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
      genre: user?.genre || "",
      statut: user?.statut || "",
      adresse: user?.adresse || "",
      ville_origine: user?.ville_origine || "",
      ville_habituelle: user?.ville_habituelle || "",
      situation_amoureuse: user?.situation_amoureuse || "",
      interets: user?.interets || "",
      education: user?.education || "",
      liens_sociaux: user?.liens_sociaux || "",
      date_de_naissance: user?.date_de_naissance || "",
      phone: user?.phone || "",
      website: user?.website || "",
      location: user?.location || "",
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Edit profile</CardTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Gender" id="genre" error={errors.genre?.message}>
              <select id="genre" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("genre")}>
                <option value="">—</option>
                <option value="masculin">Male</option>
                <option value="feminin">Female</option>
                <option value="autre">Other</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Date of birth" id="date_de_naissance" error={errors.date_de_naissance?.message}>
              <Input id="date_de_naissance" type="date" {...register("date_de_naissance")} />
            </FieldGroup>
          </div>

          <FieldGroup label="Phone" id="phone" error={errors.phone?.message}>
            <Input id="phone" type="tel" placeholder="+1 234 567 890" {...register("phone")} />
          </FieldGroup>

          <FieldGroup label="Website" id="website" error={errors.website?.message}>
            <Input id="website" type="url" placeholder="https://yoursite.com" {...register("website")} />
          </FieldGroup>

          <FieldGroup label="Location" id="location" error={errors.location?.message}>
            <Input id="location" placeholder="City, Country" {...register("location")} />
          </FieldGroup>

          <FieldGroup label="City (origin)" id="ville_origine" error={errors.ville_origine?.message}>
            <Input id="ville_origine" {...register("ville_origine")} />
          </FieldGroup>

          <FieldGroup label="City (current)" id="ville_habituelle" error={errors.ville_habituelle?.message}>
            <Input id="ville_habituelle" {...register("ville_habituelle")} />
          </FieldGroup>

          <FieldGroup label="Relationship status" id="situation_amoureuse" error={errors.situation_amoureuse?.message}>
            <Input id="situation_amoureuse" {...register("situation_amoureuse")} />
          </FieldGroup>

          <FieldGroup label="Interests" id="interets" error={errors.interets?.message}>
            <Textarea id="interets" rows={2} {...register("interets")} />
          </FieldGroup>

          <FieldGroup label="Education" id="education" error={errors.education?.message}>
            <Input id="education" {...register("education")} />
          </FieldGroup>

          <FieldGroup label="Address" id="adresse" error={errors.adresse?.message}>
            <Input id="adresse" {...register("adresse")} />
          </FieldGroup>

          <FieldGroup label="Social links" id="liens_sociaux" error={errors.liens_sociaux?.message}>
            <Input id="liens_sociaux" {...register("liens_sociaux")} />
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
