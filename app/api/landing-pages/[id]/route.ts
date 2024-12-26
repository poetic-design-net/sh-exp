import { db } from "@/lib/firebase-admin-server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await db.collection("landing-pages").doc(id).delete();
    
    // Revalidate the landing pages list
    revalidatePath("/admin/landing-pages");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    return NextResponse.json(
      { error: "Failed to delete landing page" },
      { status: 500 }
    );
  }
}
