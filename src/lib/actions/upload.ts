"use server";

export async function uploadImageAction(formData: FormData): Promise<{ url: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { url: "", error: "No file provided" };
    }

    // Check file size (max 5MB for base64)
    if (file.size > 5 * 1024 * 1024) {
      return { url: "", error: "File too large (max 5MB)" };
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return { url: dataUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return { url: "", error: "Upload failed" };
  }
}