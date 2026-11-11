import { describe, expect, it } from "vitest";
import { noteSchema, parseNoteForm } from "./note-validation";

function createFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();

  for (const [key, value] of Object.entries({
    title: "Catatan TA",
    content: "Persiapan tugas akhir",
    ...overrides,
  })) {
    formData.set(key, value);
  }

  return formData;
}

describe("noteSchema", () => {
  const validNote = {
    title: "Catatan TA",
    content: "Persiapan tugas akhir",
    isPinned: false,
  };

  it("accepts valid note data", () => {
    expect(noteSchema.safeParse(validNote).success).toBe(true);
  });

  it("trims whitespace from title", () => {
    const result = noteSchema.safeParse({
      ...validNote,
      title: "  Catatan TA  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Catatan TA");
    }
  });

  it("rejects an empty title", () => {
    expect(
      noteSchema.safeParse({ ...validNote, title: "   " }).success,
    ).toBe(false);
  });

  it("rejects a title longer than 150 characters", () => {
    expect(
      noteSchema.safeParse({
        ...validNote,
        title: "a".repeat(151),
      }).success,
    ).toBe(false);
  });

  it("accepts a title with exactly 150 characters", () => {
    expect(
      noteSchema.safeParse({
        ...validNote,
        title: "a".repeat(150),
      }).success,
    ).toBe(true);
  });

  it("trims whitespace from content", () => {
    const result = noteSchema.safeParse({
      ...validNote,
      content: "  Isi catatan  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.content).toBe("Isi catatan");
    }
  });

  it("converts omitted content into an empty string", () => {
    const noteWithoutContent = {
  title: validNote.title,
  isPinned: validNote.isPinned,
};
    const result = noteSchema.safeParse(noteWithoutContent);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.content).toBe("");
    }
  });

  it("rejects content longer than 10000 characters", () => {
    expect(
      noteSchema.safeParse({
        ...validNote,
        content: "a".repeat(10001),
      }).success,
    ).toBe(false);
  });

  it("accepts content with exactly 10000 characters", () => {
    expect(
      noteSchema.safeParse({
        ...validNote,
        content: "a".repeat(10000),
      }).success,
    ).toBe(true);
  });

  it("rejects a non-boolean pin value", () => {
    expect(
      noteSchema.safeParse({
        ...validNote,
        isPinned: "true",
      }).success,
    ).toBe(false);
  });
});

describe("parseNoteForm", () => {
  it("parses valid form data", () => {
    const result = parseNoteForm(createFormData());

    expect(result.success).toBe(true);
  });

  it("sets isPinned to true when checkbox is checked", () => {
    const result = parseNoteForm(
      createFormData({ isPinned: "on" }),
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.isPinned).toBe(true);
    }
  });

  it("sets isPinned to false when checkbox is unchecked", () => {
    const result = parseNoteForm(createFormData());

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.isPinned).toBe(false);
    }
  });

  it("trims title and content from form data", () => {
    const result = parseNoteForm(
      createFormData({
        title: "  Catatan Baru  ",
        content: "  Isi catatan  ",
      }),
    );

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.title).toBe("Catatan Baru");
      expect(result.data.content).toBe("Isi catatan");
    }
  });
});
