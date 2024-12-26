import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-Mail-Adresse ist erforderlich" },
        { status: 400 }
      );
    }

    // Generiere Reset-Link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/login?email=${encodeURIComponent(email)}`,
      handleCodeInApp: false
    };

    const resetLink = await auth.generatePasswordResetLink(
      email,
      actionCodeSettings
    );

    return NextResponse.json({
      success: true,
      resetLink,
      message: `Password-Reset-Link wurde generiert für ${email}`
    });

  } catch (error: any) {
    console.error("Fehler beim Generieren des Reset-Links:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Generieren des Reset-Links" },
      { status: 500 }
    );
  }
}
