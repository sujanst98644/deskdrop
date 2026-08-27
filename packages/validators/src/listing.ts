import { z } from "zod";

export const conditionEnum = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]);

export const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  priceRs: z.coerce.number().positive("Price must be greater than 0"),
  condition: conditionEnum,
  categoryId: z.string().uuid("Please select a category"),
  campusCity: z.string().optional(),
  images: z.array(z.string().url()).min(1, "Add at least 1 image").max(3, "Maximum 3 images"),
});

export type ListingInput = z.infer<typeof listingSchema>;