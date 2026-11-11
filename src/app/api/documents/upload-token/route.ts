import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { validateIdleSession } from "@/lib/session";
import { createStorageToken } from "@/lib/storage-auth";


export async function POST() {
  try {
    const isSessionValid = await validateIdleSession();

    if (!isSessionValid) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid." },
        { status: 401 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (typeof userId !== "string" || !userId) {
      return NextResponse.json(
        { success: false, message: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const token = createStorageToken(userId);

    return NextResponse.json({
      success: true,
      token,
      expiresIn: 300,
    });
  } catch (error) {
    console.error("Storage token error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal membuat token penyimpanan." },
      { status: 500 },
    );
  }
}
