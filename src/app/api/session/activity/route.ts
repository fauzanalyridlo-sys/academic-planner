import { auth } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export async function POST() {
  // Auth.js memvalidasi session dan mengelola perpanjangan expires.
  const authSession = await auth();
  const userId = authSession?.user?.id;

  if (typeof userId !== "string" || !userId) {
    return NextResponse.json(
      { error: "Sesi tidak valid" },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("__Secure-authjs.session-token")?.value ??
    cookieStore.get("authjs.session-token")?.value;

  if (!sessionToken) {
    return NextResponse.json(
      { error: "Sesi tidak ditemukan" },
      { status: 401 },
    );
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      sessionToken: true,
      userId: true,
      expires: true,
      lastActivityAt: true,
    },
  });

  if (!session || session.userId !== userId) {
    return NextResponse.json(
      { error: "Sesi tidak valid" },
      { status: 401 },
    );
  }

  const now = new Date();

  const isExpired = session.expires.getTime() <= now.getTime();
  const isIdle =
    now.getTime() - session.lastActivityAt.getTime() >=
    IDLE_TIMEOUT_MS;

  if (isExpired || isIdle) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });

    return NextResponse.json(
      { error: "Sesi berakhir. Silakan login kembali." },
      { status: 401 },
    );
  }

  await prisma.session.update({
    where: { sessionToken },
    data: { lastActivityAt: now },
  });

  return NextResponse.json({ success: true });
}
