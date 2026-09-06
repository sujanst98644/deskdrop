"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImageAction } from "@/lib/actions/upload";

interface ImageUploaderProps {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function ImageUploader({ images, onChange, max = 4 }: ImageUploaderProps) {
  const [pending, setPending] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = max - images.length;
  const uploading = pending > 0;

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      if (remaining <= 0) {
        setError(`You can upload at most ${max} images.`);
        return;
      }

      // Take only what still fits and say so, rather than silently dropping
      // the rest of the selection.
      const selected = files.slice(0, remaining);
      const skipped = files.length - selected.length;

      setPending(selected.length);
      setError(null);

      const results = await Promise.all(
        selected.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          try {
            const result = await uploadImageAction(formData);
            if (result.error || !result.url) {
              return { error: result.error ?? "Upload failed" };
            }
            return { url: result.url };
          } catch (err) {
            return {
              error: err instanceof Error ? err.message : "Upload failed",
            };
          }
        })
      );

      const uploaded = results.flatMap((r) => ("url" in r && r.url ? [r.url] : []));
      const firstError = results.find((r) => "error" in r && r.error);

      if (uploaded.length > 0) {
        onChange([...images, ...uploaded]);
      }

      const problems: string[] = [];
      if (firstError && "error" in firstError) problems.push(firstError.error!);
      if (skipped > 0) {
        problems.push(
          `${skipped} file${skipped === 1 ? "" : "s"} skipped — only ${remaining} more allowed.`
        );
      }
      setError(problems.length > 0 ? problems.join(" ") : null);
      setPending(0);
    },
    [images, max, onChange, remaining]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
      handleFiles(Array.from(e.dataTransfer.files));
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(Array.from(e.target.files ?? []));
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFiles]
  );

  const removeImage = (index: number) => {
    setError(null);
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <ul className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <li
              key={url}
              className="relative aspect-square overflow-hidden border border-border bg-muted"
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                sizes="25vw"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
                // Always visible: a hover-only control is unreachable on touch.
                className="absolute right-1 top-1 bg-foreground/70 p-1 text-background transition-colors hover:bg-foreground"
              >
                <X className="size-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 bg-foreground/70 px-2 py-0.5 text-xs font-medium text-background">
                  Cover
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "cursor-pointer border-2 border-dashed border-border p-8 text-center transition-colors",
          uploading && "pointer-events-none opacity-60",
          isDraggingOver ? "border-primary bg-accent" : "hover:border-primary",
          remaining <= 0 && "hidden"
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Uploading {pending} image{pending === 1 ? "" : "s"}…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click or drag &amp; drop — you can pick several at once
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP up to 5MB · {remaining} slot
              {remaining === 1 ? "" : "s"} left
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
        disabled={uploading}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        {images.length} / {max} images uploaded
        {images.length > 1 && " — the first is used as the cover"}
      </p>
    </div>
  );
}
