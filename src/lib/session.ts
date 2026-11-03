import "server-only";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isSessionValid } from "@/lib/session-validation";

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

  const isValid = isSessionValid({
    expires: session.expires,
    lastActivityAt: session.lastActivityAt,
    now: Date.now(),
  });

  if (!isValid) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });

    return false;
  }

  return true;
}