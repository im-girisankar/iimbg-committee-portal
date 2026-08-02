import { registrationSchema, type RegistrationInput } from "./schemas";

/**
 * Manual adapter for zod v4 validation with react-hook-form.
 * We don't use @hookform/resolvers (not installed) — instead we call
 * `registrationSchema.safeParse` directly and map zod issues to the
 * flat `field -> message` shape that `setError` expects.
 *
 * This keeps the shared-schema talking point intact: the FE and BE
 * both validate against `registrationSchema` from `schemas.ts`.
 */
export function safeParseRegistration(
  data: unknown
): { success: true; data: RegistrationInput } | { success: false; errors: Record<string, string> } {
  const result = registrationSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Map zod issues (first message per field wins) to flat record.
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    // issue.path is an array; we use the first segment as the field key.
    const field = String(issue.path[0] ?? "form");
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}