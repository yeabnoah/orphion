import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for game images
export const GAME_IMAGES_BUCKET = "game-images";

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  bucket: string = GAME_IMAGES_BUCKET,
  path?: string
): Promise<{
  data: { path: string; publicUrl: string } | null;
  error: Error | null;
}> {
  try {
    // Generate unique filename if no path provided
    const fileName =
      path ||
      `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("No authenticated user, attempting public upload...");
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);

      // If RLS error, provide helpful message
      if (error.message.includes("row-level security")) {
        return {
          data: null,
          error: new Error(
            "Upload blocked by security policy. Please check Supabase RLS settings for the storage bucket."
          ),
        };
      }

      return { data: null, error };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      data: {
        path: data.path,
        publicUrl: urlData.publicUrl,
      },
      error: null,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return { data: null, error: error as Error };
  }
}

// Delete file from Supabase Storage
export async function deleteFile(
  path: string,
  bucket: string = GAME_IMAGES_BUCKET
): Promise<{ data: string[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);

    return { data: data as string[] | null, error: error as Error };
  } catch (error) {
    console.error("Delete error:", error);
    return { data: null, error: error as Error };
  }
}
