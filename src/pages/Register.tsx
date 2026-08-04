import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { EventSummary } from "@/components/app/event-summary";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getEvents, createRegistration } from "@/lib/api";
import { PROGRAMS, type Event, type RegistrationInput } from "@/lib/schemas";
import { safeParseRegistration } from "@/lib/form";
import { formatDateTime } from "@/lib/format";
import { useDelayedLoading } from "@/lib/use-delayed-loading";
import { cn } from "@/lib/cn";

const NOTES_MAX = 400;

interface SuccessState {
  eventId: string;
  eventTitle: string;
  eventWhen: string;
  eventVenue: string;
  name: string;
  email: string;
}

interface ServerIssue {
  path: string;
  message: string;
}

interface ServerErrorBody {
  error?: string;
  issues?: ServerIssue[];
}

/**
 * Maps the known API failure strings to copy a person can act on. A JSON
 * blob must never reach the user (fixes D5) — this is the only place that
 * decides what text goes in the banner; everything else is inline field
 * errors via `issues[]`.
 */
function friendlyServerError(error: string | undefined): string {
  if (error === "Registration storage not configured") {
    return "Registrations are temporarily unavailable. Please try again later or email the committee.";
  }
  if (error === "Unknown event") {
    return "That event is no longer available. Please pick another.";
  }
  return "Something went wrong on our end. Please try again.";
}

export default function Register() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const errorBannerRef = useRef<HTMLDivElement>(null);

  const showSummarySkeleton = useDelayedLoading(eventsLoading);

  const initialEventId = searchParams.get("event") ?? "";

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    mode: "onTouched",
    defaultValues: {
      event_id: initialEventId,
      name: "",
      email: "",
      phone: "",
      program: PROGRAMS[0],
      notes: "",
    },
  });

  useEffect(() => {
    let active = true;
    getEvents().then((evs) => {
      if (!active) return;
      setEvents(evs);
      setEventsLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ?event=<id> pre-selects on load; changing the select writes it back so
  // the URL stays shareable.
  const watchedEventId = watch("event_id");
  useEffect(() => {
    if (watchedEventId) {
      setSearchParams({ event: watchedEventId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedEventId]);

  useEffect(() => {
    if (serverError) errorBannerRef.current?.focus();
  }, [serverError]);

  const selectedEvent = events.find((e) => e.id === watchedEventId) ?? null;
  const notes = watch("notes") ?? "";

  const onSubmit: SubmitHandler<RegistrationInput> = async (data) => {
    setServerError(null);

    // Client-side validation via the shared schema (manual adapter — no
    // @hookform/resolvers, per the contract).
    const validation = safeParseRegistration(data);
    if (!validation.success) {
      for (const [field, message] of Object.entries(validation.errors)) {
        setError(field as keyof RegistrationInput, { type: "manual", message });
      }
      return;
    }

    try {
      await createRegistration(validation.data);
      const event = events.find((e) => e.id === validation.data.event_id);
      setSuccess({
        eventId: validation.data.event_id,
        eventTitle: event?.title ?? "the event",
        eventWhen: event ? formatDateTime(event.date, event.time) : "",
        eventVenue: event?.venue ?? "",
        name: validation.data.name,
        email: validation.data.email,
      });
    } catch (err) {
      // api.ts throws with the raw response body as the message — parse it
      // defensively here (api.ts itself stays untouched). Fixes D5.
      const raw = err instanceof Error ? err.message : "";
      let parsed: ServerErrorBody | null = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }

      if (parsed?.issues?.length) {
        for (const issue of parsed.issues) {
          setError(issue.path as keyof RegistrationInput, { type: "server", message: issue.message });
        }
        // Errors are now inline, on the fields — no banner.
      } else {
        setServerError(friendlyServerError(parsed?.error));
      }
    }
  };

  function handleRegisterAnother() {
    const keepEventId = success?.eventId ?? "";
    setSuccess(null);
    reset({
      event_id: keepEventId,
      name: "",
      email: "",
      phone: "",
      program: PROGRAMS[0],
      notes: "",
    });
  }

  return (
    <div className="container-page pt-10 pb-16 lg:pt-14 lg:pb-24">
      <PageHeader title="Register" subtitle="Reserve your seat. Takes about a minute." />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_minmax(0,360px)] lg:items-start">
        <div className="order-2 lg:order-1">
          {success ? (
            <div
              className="rounded-md border border-border bg-surface p-6"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
              <h2 className="mt-3 text-title-2 text-fg">You&apos;re registered</h2>
              <dl className="mt-4 flex flex-col gap-2 text-ui">
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-muted">Name</dt>
                  <dd className="text-right text-fg">{success.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-muted">Email</dt>
                  <dd className="text-right text-fg">{success.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-muted">Event</dt>
                  <dd className="text-right text-fg">{success.eventTitle}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-muted">When</dt>
                  <dd className="numeric text-right text-fg">{success.eventWhen}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-fg-muted">Venue</dt>
                  <dd className="text-right text-fg">{success.eventVenue}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button variant="secondary" onClick={handleRegisterAnother}>
                  Register someone else
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/events">Browse events</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
              {serverError && (
                <div
                  ref={errorBannerRef}
                  tabIndex={-1}
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-danger-border bg-danger-subtle px-3 py-2.5 text-ui text-danger"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <Field id="event_id" label="Event" required error={errors.event_id?.message}>
                {(aria) => (
                  /* `value` makes this controlled so the DOM always matches
                     react-hook-form's state. Without it the ?event= pre-select
                     is lost: RHF holds the id from defaultValues, but the
                     native <select> had no matching <option> when it mounted
                     (they arrive with getEvents), and setValue can't repair it
                     because RHF sees no state change and skips the DOM write.
                     register() still supplies name/onChange/onBlur/ref. */
                  <Select
                    disabled={eventsLoading}
                    {...register("event_id")}
                    value={watchedEventId ?? ""}
                    {...aria}
                  >
                    <option value="">{eventsLoading ? "Loading events…" : "Select an event…"}</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>

              <Field id="name" label="Full name" required error={errors.name?.message}>
                {(aria) => <Input type="text" autoComplete="name" {...register("name")} {...aria} />}
              </Field>

              <Field id="email" label="Email" required error={errors.email?.message}>
                {(aria) => <Input type="email" autoComplete="email" {...register("email")} {...aria} />}
              </Field>

              <div className="flex flex-col gap-5 sm:flex-row">
                <Field
                  id="phone"
                  label="Phone"
                  required
                  error={errors.phone?.message}
                  className="sm:flex-1"
                >
                  {(aria) => (
                    <Input type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} {...aria} />
                  )}
                </Field>

                <Field
                  id="program"
                  label="Program"
                  required
                  error={errors.program?.message}
                  className="sm:flex-1"
                >
                  {(aria) => (
                    <Select {...register("program")} {...aria}>
                      {PROGRAMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>

              <Field id="notes" label="Notes" error={errors.notes?.message}>
                {(aria) => (
                  <div className="flex flex-col gap-1.5">
                    <Textarea rows={3} {...register("notes")} {...aria} />
                    <p
                      className={cn(
                        "numeric text-right text-caption",
                        notes.length > NOTES_MAX ? "text-danger" : "text-fg-subtle",
                      )}
                    >
                      {notes.length} / {NOTES_MAX}
                    </p>
                  </div>
                )}
              </Field>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner label="" />
                    Registering…
                  </>
                ) : (
                  "Register"
                )}
              </Button>

              <p className="text-caption text-fg-subtle">
                By registering you agree to receive event updates via email.
              </p>
            </form>
          )}
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-[calc(var(--nav-h)+24px)]">
          <EventSummary event={selectedEvent} loading={showSummarySkeleton} />
        </div>
      </div>
    </div>
  );
}
