import { z } from "zod";

export const conditionEnum = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]);

export const signUpSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email(),
  password: z.string().min(8, "At least 8 characters"),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const listingSchema = z.object({
  title: z.string().min(5, "Too short").max(100),
  description: z.string().min(10, "Too short").max(5000),
  priceRs: z.coerce.number().positive("Must be > 0"),
  condition: conditionEnum,
  categoryId: z.string().min(1, "Pick a category"),
  campusCity: z.string().optional(),
  images: z.array(z.url()).min(1, "Add at least 1 image").max(4, "Max 4 images"),
});
// `priceRs` is coerced, so the schema's input and output shapes differ:
// ListingFormValues is what the form holds, ListingInput what it parses to.
export type ListingFormValues = z.input<typeof listingSchema>;
export type ListingInput = z.output<typeof listingSchema>;

export const orderActionSchema = z.object({
  orderId: z.string().min(1),
});
export type OrderActionInput = z.infer<typeof orderActionSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["ACCEPTED", "COMPLETED", "CANCELLED"]),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
