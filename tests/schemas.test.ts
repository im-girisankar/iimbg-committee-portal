import { describe, it, expect } from "vitest";
import { registrationSchema, PROGRAMS, type RegistrationInput } from "../src/lib/schemas";

describe("registrationSchema", () => {
  const validBase: RegistrationInput = {
    event_id: "tech-tuesday-genai-08",
    name: "Aanya Raj",
    email: "aanya@iimbg.ac.in",
    phone: "9876543210",
    program: "MBA",
    notes: "Looking forward to this",
  };

  it("passes for a fully valid registration", () => {
    const result = registrationSchema.safeParse(validBase);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("9876543210"); // transform strips non-digits
    }
  });

  it("fails when name is too short (<2 chars)", () => {
    const result = registrationSchema.safeParse({ ...validBase, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "name")?.message;
      expect(msg).toMatch(/at least 2/i);
    }
  });

  it("fails when email is invalid", () => {
    const result = registrationSchema.safeParse({ ...validBase, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "email")?.message;
      expect(msg).toMatch(/valid email/i);
    }
  });

  it("fails when phone is not 10 digits", () => {
    const result = registrationSchema.safeParse({ ...validBase, phone: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "phone")?.message;
      expect(msg).toMatch(/10 digits/i);
    }
  });

  it("fails when phone contains non-digits after transform", () => {
    const result = registrationSchema.safeParse({ ...validBase, phone: "98765abcde" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "phone")?.message;
      expect(msg).toMatch(/10 digits/i);
    }
  });

  it("fails when event_id is missing", () => {
    const result = registrationSchema.safeParse({ ...validBase, event_id: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "event_id")?.message;
      expect(msg).toMatch(/select an event/i);
    }
  });

  it("fails when program is not a known enum", () => {
    const result = registrationSchema.safeParse({ ...validBase, program: "BTech" as any });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "program")?.message;
      expect(msg).toMatch(/expected one of/i);
    }
  });

  it("fails when notes exceed 400 chars", () => {
    const longNotes = "x".repeat(401);
    const result = registrationSchema.safeParse({ ...validBase, notes: longNotes });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path[0] === "notes")?.message;
      expect(msg).toMatch(/under 400/i);
    }
  });

  it("accepts notes at exactly 400 chars", () => {
    const maxNotes = "x".repeat(400);
    const result = registrationSchema.safeParse({ ...validBase, notes: maxNotes });
    expect(result.success).toBe(true);
  });

  it("accepts optional empty notes", () => {
    const result = registrationSchema.safeParse({ ...validBase, notes: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe("");
    }
  });

  it("accepts all valid programs", () => {
    for (const p of PROGRAMS) {
      const result = registrationSchema.safeParse({ ...validBase, program: p });
      expect(result.success).toBe(true);
    }
  });

  it("transform strips spaces, dashes, parens from phone", () => {
    const result = registrationSchema.safeParse({ ...validBase, phone: "987-654-3210" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("9876543210");
    }
    const result2 = registrationSchema.safeParse({ ...validBase, phone: "(987) 654 3210" });
    expect(result2.success).toBe(true);
    if (result2.success) {
      expect(result2.data.phone).toBe("9876543210");
    }
  });
});