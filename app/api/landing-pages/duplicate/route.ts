import { db } from "@/lib/firebase-admin-server";
import { NextResponse } from "next/server";
import type { LandingPage } from "@/types/landing-page";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    // Get the original landing page
    const doc = await db.collection("landing-pages").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Landing page not found" },
        { status: 404 }
      );
    }

    const originalData = doc.data() as LandingPage;
    const now = new Date();
    
    // Create new data with modified title and slug
    const newData = {
      ...originalData,
      title: `${originalData.title} (Copy)`,
      slug: `${originalData.slug}-copy`,
      createdAt: now,
      updatedAt: now,
      isActive: false, // Set the copy to inactive by default
    };

    // Create the new landing page
    const newDocRef = await db.collection("landing-pages").add(newData);

    const responseData: LandingPage = {
      ...newData,
      id: newDocRef.id,
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error duplicating landing page:", error);
    return NextResponse.json(
      { error: "Failed to duplicate landing page" },
      { status: 500 }
    );
  }
}
