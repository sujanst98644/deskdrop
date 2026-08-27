"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { listingSchema, type ListingInput, conditionEnum } from "@deskdrop/validators";
import { createListingAction } from "@/lib/actions/listing";
import { ImageUploader } from "@/components/listings/ImageUploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState(createListingAction, {
    success: false,
    errors: {},
  });

  const form = useForm<ListingInput>({
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

  // Handle image changes separately – we need to set the field value
  const handleImagesChange = (urls: string[]) => {
    form.setValue("images", urls, { shouldValidate: true });
  };

  // If server returned field errors, set them on the form
  if (!state.success && state.errors) {
    // We'll display errors via the form's error state
    // The form will show errors when we call trigger() or on submit
  }

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        {/* Hidden field for images – we pass as JSON string */}
        <input type="hidden" name="images" value={JSON.stringify(form.watch("images"))} />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Calculus Textbook 3rd Edition" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your item..." rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priceRs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (Rs)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="campusCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campus / City (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Kathmandu University" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Uploader */}
        <div className="space-y-2">
          <FormLabel>Images (1-3)</FormLabel>
          <ImageUploader
            images={form.watch("images")}
            onChange={handleImagesChange}
            max={3}
          />
          {state.errors?.images && (
            <p className="text-sm text-destructive">{state.errors.images[0]}</p>
          )}
        </div>

        {state.errors?._form && (
          <p className="text-sm text-destructive">{state.errors._form[0]}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating..." : "Publish Listing"}
        </Button>
      </form>
    </Form>
  );
}