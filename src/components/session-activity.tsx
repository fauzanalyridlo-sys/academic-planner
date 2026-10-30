"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

const ACTIVITY_INTERVAL = 60 * 1000;

export default function SessionActivity() {
  useEffect(() => {
    let lastPing = 0;
    let checking = false;

    async function checkActivity() {
      if (checking) return;

      checking = true;

      try {
        const response = await fetch("/api/session/activity", {
          method: "POST",
          cache: "no-store",
        });

        if (response.status === 401) {
          await signOut({ callbackUrl: "/login" });
          return;
        }

        if (!response.ok) {
          console.error("Gagal memeriksa sesi.");
        }
      } catch (error) {
        console.error("Gagal menghubungi server sesi:", error);
      } finally {
        checking = false;
      }
    }

    function handleActivity() {
      const now = Date.now();

      if (now - lastPing < ACTIVITY_INTERVAL) return;

      lastPing = now;
      void checkActivity();
    }

    const events = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ] as const;

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Validasi saat komponen pertama kali dipasang.
    void checkActivity();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return null;
}
