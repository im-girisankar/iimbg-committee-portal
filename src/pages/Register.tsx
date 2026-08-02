import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { getEvents } from "../lib/api";
import { PROGRAMS, type Event, type RegistrationInput } from "../lib/schemas";
import { safeParseRegistration } from "../lib/form";
import { createRegistration } from "../lib/api";

/* ─────────────────────────────────────────────────────────────
   Register page — single column form, max-w-md.
   Pre-selects event from ?event=<id> URL param.
   Uses react-hook-form with manual zod adapter (shared-schema validation).
   ───────────────────────────────────────────────────────────── */

export default function Register() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ eventTitle: string; name: string } | null>(null);

  // Fetch events for the select dropdown
  useEffect(() => {
    getEvents().then((evs) => {
      setEvents(evs);
      setEventLoading(false);
    });
  }, []);

  // Pre-select event from URL param
  const initialEventId = searchParams.get("event") || "";

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<RegistrationInput>({
    defaultValues: {
      event_id: initialEventId,
      name: "",
      email: "",
      phone: "",
      program: PROGRAMS[0],
      notes: "",
    },
  });

  // Update URL when event selection changes (keeps shareable link)
  const watchedEventId = watch("event_id");
  useEffect(() => {
    if (watchedEventId) {
      setSearchParams({ event: watchedEventId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [watchedEventId, setSearchParams]);

  const onSubmit: SubmitHandler<RegistrationInput> = async (data) => {
    clearErrors("form");
    setServerError(null);

    // Client-side validation via shared schema
    const validation = safeParseRegistration(data);
    if (!validation.success) {
      for (const [field, message] of Object.entries(validation.errors)) {
        setError(field as keyof RegistrationInput, { type: "manual", message });
      }
      return;
    }

    try {
      await createRegistration(validation.data);
      // Look up event title for success panel
      const event = events.find((e) => e.id === validation.data.event_id);
      setSuccess({ eventTitle: event?.title || "Event", name: validation.data.name });
      // Clear form but keep the selected event in URL
      setValue("name", "");
      setValue("email", "");
      setValue("phone", "");
      setValue("program", PROGRAMS[0]);
      setValue("notes", "");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setServerError(message);
    }
  };

  if (eventLoading) {
    return (
      <div className="pt-24 pb-20 px-4">
        <div className="mx-auto max-w-md">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-[#1C1915] rounded w-1/2" />
            <div className="h-48 bg-[#1C1915] border border-[#322C24] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4">
      <div className="mx-auto max-w-md">
        {success ? (
          /* Success panel — echoes event title and registered name */
          <div
            className="bg-[#1C1915] border border-[#C9A227]/30 rounded-xl p-8 text-center animate-fade-up"
            role="status"
            aria-live="polite"
          >
            <svg
              className="mx-auto mb-4 w-12 h-12 text-[#C9A227]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 className="text-2xl font-display font-bold text-[#F2EDE3] mb-2">
              Registration confirmed
            </h2>
            <p className="text-[#9C948A] mb-4">
              <span className="font-medium text-[#F2EDE3]">{success.name}</span>, you&apos;re registered for
            </p>
            <p className="text-lg font-medium text-[#C9A227] mb-6">{success.eventTitle}</p>
            <button
              type="button"
              onClick={() => {
                setSuccess(null);
                navigate("/events");
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A227] text-[#12100C] font-semibold rounded-xl hover:bg-[#C9A227]/90 transition"
            >
              Browse more events
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        ) : (
          /* Registration form */
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#1C1915] border border-[#322C24] rounded-xl p-6 space-y-5 animate-fade-up"
            noValidate
          >
            <header className="text-center mb-4">
              <h1 className="text-2xl font-display font-bold text-[#F2EDE3] mb-1">
                Register for an event
              </h1>
              <p className="text-[#9C948A]">
                Fill in your details to reserve a seat.
              </p>
            </header>

            {/* Server error banner */}
            {serverError && (
              <div
                className="p-3 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-lg text-sm text-[#C9A227] flex items-center gap-2"
                role="alert"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {serverError}
              </div>
            )}

            {/* Event select */}
            <div>
              <label
                htmlFor="event_id"
                className="block mb-1.5 text-sm font-medium text-[#F2EDE3]"
              >
                Event <span className="text-[#C9A227]" aria-hidden="true">*</span>
              </label>
              <select
                id="event_id"
                {...register("event_id")}
                className="w-full px-4 py-3 bg-[#241F19] border border-[#322C24] rounded-lg text-[#F2EDE3] placeholder-[#9C948A] focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition min-h-[44px]"
                aria-invalid={!!errors.event_id}
                aria-describedby={errors.event_id ? "event_id-error" : undefined}
              >
                <option value="">Select an event…</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
              {errors.event_id && (
                <p id="event_id-error" className="mt-1.5 text-sm text-[#C9A227]" role="alert">
                  {errors.event_id.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block mb-1.5 text-sm font-medium text-[#F2EDE3]"
              >
                Full name <span className="text-[#C9A227]" aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 bg-[#241F19] border border-[#322C24] rounded-lg text-[#F2EDE3] placeholder-[#9C948A] focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition min-h-[44px]"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-sm text-[#C9A227]" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-1.5 text-sm font-medium text-[#F2EDE3]"
              >
                Email <span className="text-[#C9A227]" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 bg-[#241F19] border border-[#322C24] rounded-lg text-[#F2EDE3] placeholder-[#9C948A] focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition min-h-[44px]"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-[#C9A227]" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block mb-1.5 text-sm font-medium text-[#F2EDE3]"
              >
                Phone (10 digits) <span className="text-[#C9A227]" aria-hidden="true">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="w-full px-4 py-3 bg-[#241F19] border border-[#322C24] rounded-lg text-[#F2EDE3] placeholder-[#9C948A] focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition min-h-[44px]"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1.5 text-sm text-[#C9A227]" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Program */}
            <div>
              <label
                htmlFor="program"
                className="block mb-1.5 text-sm font-medium text-[#F2EDE3]"
              >
                Program <span className="text-[#C9A227]" aria-hidden="true">*</span>
              </label>
              <select
                id="program"
                {...register("program")}
                className="w-full px-4 py-3 bg-[#241F19] border border-[#322C24] rounded-lg text-[#F2EDE3] focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition min-h-[44px]"
                aria-invalid={!!errors.program}
                aria-describedby={errors.program ? "program-error" : undefined}
              >
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.program && (
                <p id="program-error" className="mt-1.5 text-sm text-[#C9A227]" role="alert">
                  {errors.program.message}
                </p>
              )}
            </div>

            {/* Notes (optional) */}
            <div>
              <label
                htmlFor="notes"
                className="block mb-1.5 text-sm font-medium text-[#F2EDE3]"
              >
                Notes <span className="text-[#9C948A] font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                {...register("notes")}
                rows={3}
                className="w-full px-4 py-3 bg-[#241F19] border border-[#322C24] rounded-lg text-[#F2EDE3] placeholder-[#9C948A] focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition resize-none min-h-[44px]"
                aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? "notes-error" : "notes-hint"}
              />
              {errors.notes ? (
                <p id="notes-error" className="mt-1.5 text-sm text-[#C9A227]" role="alert">
                  {errors.notes.message}
                </p>
              ) : (
                <p id="notes-hint" className="mt-1.5 text-sm text-[#9C948A]">
                  Max 400 characters
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-[#C9A227] text-[#12100C] font-semibold rounded-xl hover:bg-[#C9A227]/90 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:ring-offset-2 focus:ring-offset-[#1C1915] transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? "Registering…" : "Register"}
            </button>

            <p className="text-center text-xs text-[#9C948A]">
              By registering you agree to receive event updates via email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}