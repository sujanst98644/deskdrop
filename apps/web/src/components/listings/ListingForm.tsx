"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema, type ListingInput } from "@deskdrop/validators";
import { createListingAction } from "@/lib/actions/listing";
import { ImageUploader } from "@/components/listings/ImageUploader";
import { Button } from "@/components/ui/button";

const conditions = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

interface ListingFormProps {
  categories: { id: string; name: string }[];
}

export function ListingForm({ categories }: ListingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      description: "",
      priceRs: undefined,
      condition: undefined,
      categoryId: "",
      campusCity: "",
      images: [],
    },
  });

  const images = watch("images");

  const handleImagesChange = (urls: string[]) => {
    setValue("images", urls, { shouldValidate: true });
  };

  const onSubmit = (data: ListingInput) => {
    setServerErrors({});
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("priceRs", String(data.priceRs));
    formData.append("condition", data.condition);
    formData.append("categoryId", data.categoryId);
    if (data.campusCity) formData.append("campusCity", data.campusCity);
    formData.append("images", JSON.stringify(data.images));

    startTransition(async () => {
      const result = await createListingAction(null, formData);

      if (!result.success && result.errors) {
        setServerErrors(result.errors);
        // Map server errors to form fields
        Object.entries(result.errors).forEach(([key, messages]) => {
          if (key !== "_form") {
            setError(key as any, { message: messages[0] });
          }
        });
        // Show form-level error in a simple alert
        if (result.errors._form) {
          alert(result.errors._form[0]);
        }
      } else if (result.success) {
        setSuccessMessage("Listing published! Redirecting...");
        setTimeout(() => {
          window.location.href = `/listings/${result.listingId}`;
        }, 1000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="e.g. Calculus Textbook 3rd Edition"
        />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={5}
          {...register("description")}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="Describe your item..."
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      {/* Price & Condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priceRs" className="block text-sm font-medium mb-1">
            Price (Rs) <span className="text-red-500">*</span>
          </label>
          <input
            id="priceRs"
            type="number"
            step="0.01"
            {...register("priceRs", { valueAsNumber: true })}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="500"
          />
          {errors.priceRs && <p className="text-sm text-red-500 mt-1">{errors.priceRs.message}</p>}
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium mb-1">
            Condition <span className="text-red-500">*</span>
          </label>
          <select
            id="condition"
            {...register("condition")}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">Select condition</option>
            {conditions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.condition && <p className="text-sm text-red-500 mt-1">{errors.condition.message}</p>}
        </div>
      </div>

      {/* Category & Campus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>}
        </div>

        <div>
          <label htmlFor="campusCity" className="block text-sm font-medium mb-1">
            Campus / City (optional)
          </label>
          <input
            id="campusCity"
            {...register("campusCity")}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="e.g. Kathmandu University"
          />
          {errors.campusCity && <p className="text-sm text-red-500 mt-1">{errors.campusCity.message}</p>}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Images (1-3) <span className="text-red-500">*</span>
        </label>
        <ImageUploader images={images} onChange={handleImagesChange} max={3} />
        {serverErrors.images && <p className="text-sm text-red-500 mt-1">{serverErrors.images[0]}</p>}
        {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images.message}</p>}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating..." : "Publish Listing"}
      </Button>

      {/* Server-level errors */}
      {serverErrors._form && (
        <p className="text-sm text-red-500 text-center">{serverErrors._form[0]}</p>
      )}
    </form>
  );
}