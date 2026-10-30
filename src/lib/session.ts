import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export async function validateIdleSession() {
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("__Secure-authjs.session-token")?.value ??
    cookieStore.get("authjs.session-token")?.value;

  if (!sessionToken) {
    return false;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      sessionToken: true,
      expires: true,
      lastActivityAt: true,
    },
  });

  if (!session) {
    return false;
  }

  const now = Date.now();

  const isExpired = session.expires.getTime() <= now;
  const isIdle =
    now - session.lastActivityAt.getTime() >= IDLE_TIMEOUT_MS;

  if (isExpired || isIdle) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });

    return false;
  }

  return true;
}