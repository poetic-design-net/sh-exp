import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin-server";
import type { UpdateCategoryInput } from "@/types/category";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const doc = await db.collection("categories").doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const data = await request.json() as UpdateCategoryInput;
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    };

    await db.collection("categories").doc(params.id).update(updateData);
    const updatedDoc = await db.collection("categories").doc(params.id).get();

    if (!updatedDoc.exists) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // First check if any products are using this category
    const productsSnapshot = await db
      .collection("products")
      .where("categoryId", "==", params.id)
      .get();

    if (!productsSnapshot.empty) {
      return NextResponse.json(
        { message: "Cannot delete category that has products assigned to it" },
        { status: 400 }
      );
    }

    // Then check if any categories are using this as a parent
    const childCategoriesSnapshot = await db
      .collection("categories")
      .where("parentId", "==", params.id)
      .get();

    if (!childCategoriesSnapshot.empty) {
      return NextResponse.json(
        { message: "Cannot delete category that has child categories" },
        { status: 400 }
      );
    }

    await db.collection("categories").doc(params.id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}
