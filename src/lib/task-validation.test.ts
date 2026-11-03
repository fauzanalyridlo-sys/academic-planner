
import { describe, expect, it } from "vitest";
import { parseTaskForm, taskSchema } from "./task-validation";

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  formData.set("title", "Mengerjakan TA");

  for (const [key, value] of Object.entries({
    status: "TODO",
    priority: "MEDIUM",
    ...overrides,
  })) {
    formData.set(key, value);
  }

  return formData;
}

describe("taskSchema", () => {
  const validTask = {
    title: "Mengerjakan TA",
    status: "TODO",
    priority: "MEDIUM",
  };

  it("accepts valid task data", () => {
    expect(taskSchema.safeParse(validTask).success).toBe(true);
  });

  it("trims whitespace from title", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      title: "  Mengerjakan TA  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Mengerjakan TA");
    }
  });

  it("rejects an empty title", () => {
    expect(
      taskSchema.safeParse({ ...validTask, title: "   " }).success,
    ).toBe(false);
  });

  it("rejects a title longer than 150 characters", () => {
    expect(
      taskSchema.safeParse({
        ...validTask,
        title: "a".repeat(151),
      }).success,
    ).toBe(false);
  });

  it("rejects a description longer than 5000 characters", () => {
    expect(
      taskSchema.safeParse({
        ...validTask,
        description: "a".repeat(5001),
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid status", () => {
    expect(
      taskSchema.safeParse({ ...validTask, status: "PENDING" }).success,
    ).toBe(false);
  });

  it("rejects an invalid priority", () => {
    expect(
      taskSchema.safeParse({ ...validTask, priority: "URGENT" }).success,
    ).toBe(false);
  });

  it("accepts a valid leap date", () => {
    expect(
      taskSchema.safeParse({ ...validTask, dueDate: "2028-02-29" }).success,
    ).toBe(true);
  });

  it("rejects an impossible calendar date", () => {
    expect(
      taskSchema.safeParse({ ...validTask, dueDate: "2026-02-31" }).success,
    ).toBe(false);
  });

  it("rejects an invalid date format", () => {
    expect(
      taskSchema.safeParse({ ...validTask, dueDate: "31-02-2026" }).success,
    ).toBe(false);
  });

  it("converts an empty due date into null", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      dueDate: "",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.dueDate).toBeNull();
    }
  });

  it("converts an omitted due date into null", () => {
    const result = taskSchema.safeParse(validTask);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.dueDate).toBeNull();
    }
  });
});

describe("parseTaskForm", () => {
  it("uses default status and priority when omitted", () => {
    const formData = createFormData({
      status: "",
      priority: "",
    });

    const result = parseTaskForm(formData);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.status).toBe("TODO");
      expect(result.data.priority).toBe("MEDIUM");
    }
  });

  it("parses valid form data", () => {
    const result = parseTaskForm(
      createFormData({
        title: "Mengerjakan TA",
        dueDate: "2028-02-29",
      }),
    );

    expect(result.success).toBe(true);
  });
});
