import { db } from "@/lib/firebase-admin-server";
import { NextResponse } from "next/server";
import type { LandingPage } from "@/types/landing-page";

export async function GET() {
  try {
    const snapshot = await db.collection("landing-pages").get();
    const pages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        components: data.components,
        navigation: data.navigation,
        isActive: data.isActive,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        metadata: data.metadata,
      } as LandingPage;
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch landing pages" },
      { status: 500 }
    );
  }
}
