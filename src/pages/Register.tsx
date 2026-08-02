import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";
import { getEvents } from "../lib/api";
import { PROGRAMS, type Event, type RegistrationInput } from "../lib/schemas";
import { safeParseRegistration } from "../lib/form";
import { createRegistration } from "../lib/api";

/* ─────────────────────────────────────────────────────────────
   Register page — single column form, max-w-md.
   Pre-selects event from ?event=<id> URL param.
   Uses react-hook-form with manual zod adapter (shared-schema validation).
   New design tokens: light theme, accent colors, Framer Motion animations.
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

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (eventLoading) {
    return (
      <div className="pt-24 pb-20 px-4 bg-background">
        <div className="mx-auto max-w-md">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
            className="animate-pulse space-y-4"
          >
            <motion.div className="h-10 bg-background rounded w-1/2" />
            <motion.div className="h-48 bg-surface border border-border rounded-2xl" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 bg-background">
      <div className="mx-auto max-w-md">
        {success ? (
          /* Success panel — echoes event title and registered name */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface border border-accent/30 rounded-2xl p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mb-4 w-12 h-12 text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="w-full h-full"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="font-display font-bold text-2xl text-primary mb-2"
            >
              Registration confirmed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-secondary mb-4"
            >
              <span className="font-medium text-primary">{success.name}</span>, you&apos;re registered for
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="text-lg font-medium text-accent mb-6"
            >
              {success.eventTitle}
            </motion.p>
            <motion.button
              type="button"
              onClick={() => {
                setSuccess(null);
                navigate("/events");
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              Browse more events
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        ) : (
          /* Registration form */
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="bg-surface border border-border rounded-2xl p-6 space-y-5"
            noValidate
          >
            <motion.header
              variants={itemVariants}
              className="text-center mb-4"
            >
              <h1 className="font-display font-bold text-2xl text-primary mb-1">
                Register for an event
              </h1>
              <p className="text-secondary">
                Fill in your details to reserve a seat.
              </p>
            </motion.header>

            {/* Server error banner */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent flex items-center gap-2"
                role="alert"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {serverError}
              </motion.div>
            )}

            {/* Event select */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="event_id"
                className="block mb-1.5 text-sm font-medium text-primary"
              >
                Event <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <select
                id="event_id"
                {...register("event_id")}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition min-h-[44px] appearance-none"
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
                <p id="event_id-error" className="mt-1.5 text-sm text-accent" role="alert">
                  {errors.event_id.message}
                </p>
              )}
            </motion.div>

            {/* Name */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="name"
                className="block mb-1.5 text-sm font-medium text-primary"
              >
                Full name <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition min-h-[44px]"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-sm text-accent" role="alert">
                  {errors.name.message}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="block mb-1.5 text-sm font-medium text-primary"
              >
                Email <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition min-h-[44px]"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-sm text-accent" role="alert">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="phone"
                className="block mb-1.5 text-sm font-medium text-primary"
              >
                Phone (10 digits) <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition min-h-[44px]"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1.5 text-sm text-accent" role="alert">
                  {errors.phone.message}
                </p>
              )}
            </motion.div>

            {/* Program */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="program"
                className="block mb-1.5 text-sm font-medium text-primary"
              >
                Program <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <select
                id="program"
                {...register("program")}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition min-h-[44px] appearance-none"
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
                <p id="program-error" className="mt-1.5 text-sm text-accent" role="alert">
                  {errors.program.message}
                </p>
              )}
            </motion.div>

            {/* Notes (optional) */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="notes"
                className="block mb-1.5 text-sm font-medium text-primary"
              >
                Notes <span className="text-secondary font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                {...register("notes")}
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-primary placeholder-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition resize-none min-h-[44px]"
                aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? "notes-error" : "notes-hint"}
              />
              {errors.notes ? (
                <p id="notes-error" className="mt-1.5 text-sm text-accent" role="alert">
                  {errors.notes.message}
                </p>
              ) : (
                <p id="notes-hint" className="mt-1.5 text-sm text-secondary">
                  Max 400 characters
                </p>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-6 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isSubmitting ? "Registering…" : "Register"}
              </motion.button>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-center text-xs text-secondary"
            >
              By registering you agree to receive event updates via email.
            </motion.p>
          </motion.form>
        )}
      </div>
    </div>
  );
}