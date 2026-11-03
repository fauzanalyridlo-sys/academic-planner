import { describe, expect, it } from "vitest";
import { isSessionValid } from "./session-validation";

describe("isSessionValid", () => {
  const now = new Date("2026-11-02T10:00:00Z").getTime();

  const validSession = {
    expires: new Date("2026-11-03T10:00:00Z"),
    lastActivityAt: new Date("2026-11-02T09:00:00Z"),
    now,
  };

  it("accepts an active session", () => {
    expect(isSessionValid(validSession)).toBe(true);
  });

  it("rejects an expired session", () => {
    expect(
      isSessionValid({
        ...validSession,
        expires: new Date("2026-11-02T09:59:59Z"),
      }),
    ).toBe(false);
  });

  it("rejects a session that expires exactly at the current time", () => {
    expect(
      isSessionValid({
        ...validSession,
        expires: new Date(now),
      }),
    ).toBe(false);
  });

  it("rejects a session idle for exactly two hours", () => {
    expect(
      isSessionValid({
        ...validSession,
        lastActivityAt: new Date(now - 2 * 60 * 60 * 1000),
      }),
    ).toBe(false);
  });

  it("accepts a session idle for less than two hours", () => {
    expect(
      isSessionValid({
        ...validSession,
        lastActivityAt: new Date(now - 2 * 60 * 60 * 1000 + 1),
      }),
    ).toBe(true);
  });

  it("rejects a session idle for more than two hours", () => {
    expect(
      isSessionValid({
        ...validSession,
        lastActivityAt: new Date(now - 3 * 60 * 60 * 1000),
      }),
    ).toBe(false);
  });
});