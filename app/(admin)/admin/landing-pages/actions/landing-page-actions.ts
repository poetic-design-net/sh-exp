import { deleteLandingPage, getLandingPages } from "@/services/landing-pages";
import type { LandingPage } from "@/types/landing-page";

export async function refreshLandingPages(): Promise<LandingPage[]> {
  try {
    return await getLandingPages();
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    throw new Error("Failed to refresh landing pages");
  }
}

export async function handleDeleteLandingPage(id: string): Promise<void> {
  if (!window.confirm("Are you sure you want to delete this landing page?")) {
    return;
  }

  try {
    await deleteLandingPage(id);
  } catch (error) {
    console.error("Error deleting landing page:", error);
    throw new Error("Failed to delete landing page");
  }
}
