import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin-server";
import type { CreateCategoryInput } from "@/types/category";

export async function GET() {
  try {
    const snapshot = await db.collection("categories").get();
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as CreateCategoryInput;
    const now = Date.now();
    
    const categoryData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("categories").add(categoryData);
    const newDoc = await docRef.get();
    
    return NextResponse.json({
      id: newDoc.id,
      ...newDoc.data(),
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}
