import { z } from "zod";

export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
  email: z.string().email("Enter a valid email address"),
  bio: z.string().max(500, "Bio must be 500 characters or fewer").optional().or(z.literal("")),
  genre: z.string().optional().or(z.literal("")),
  statut: z.string().optional().or(z.literal("")),
  adresse: z.string().optional().or(z.literal("")),
  ville_origine: z.string().optional().or(z.literal("")),
  ville_habituelle: z.string().optional().or(z.literal("")),
  situation_amoureuse: z.string().optional().or(z.literal("")),
  interets: z.string().optional().or(z.literal("")),
  education: z.string().optional().or(z.literal("")),
  liens_sociaux: z.string().optional().or(z.literal("")),
  date_de_naissance: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  is_private: z.boolean().default(false),
  language: z.string().default("en"),
  status: z.string().default("online"),
  avatar: z.any().optional(),
  cover_image: z.any().optional(),
});
