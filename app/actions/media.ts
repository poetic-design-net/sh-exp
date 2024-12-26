"use server";

import { revalidatePath } from "next/cache";
import { 
  uploadMedia, 
  deleteMedia, 
  getMediaItems,
  updateMediaTags,
  updateMediaCategory,
  type MediaItem 
} from "@/services/server/media-library";

export async function handleMediaUpload(formData: FormData): Promise<MediaItem> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("No file provided");
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;
    const parsedTags = tags ? JSON.parse(tags) : undefined;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer size:', arrayBuffer.byteLength);
    
    const buffer = Buffer.from(arrayBuffer);
    console.log('Buffer size:', buffer.length);
    
    const item = await uploadMedia(
      buffer,
      file.name,
      file.type,
      category,
      parsedTags
    );

    revalidatePath("/admin/media");
    revalidatePath("/admin/landing-pages");
    return item;
  } catch (error) {
    console.error('Error in handleMediaUpload:', error);
    throw error;
  }
}

export async function handleMediaDelete(id: string): Promise<void> {
  await deleteMedia(id);
  revalidatePath("/admin/media");
  revalidatePath("/admin/landing-pages");
}

export async function getAllMedia(): Promise<MediaItem[]> {
  return getMediaItems();
}

export async function handleUpdateTags(id: string, tags: string[]): Promise<void> {
  await updateMediaTags(id, tags);
  revalidatePath("/admin/media");
  revalidatePath("/admin/landing-pages");
}

export async function handleUpdateCategory(id: string, category: string): Promise<void> {
  await updateMediaCategory(id, category);
  revalidatePath("/admin/media");
  revalidatePath("/admin/landing-pages");
}
