import type { EventWhen } from "@/lib/utils";
import LocationPin from "@/components/ui/location-pin";

/**
 * The per-day breakdown shown when the days of an event or a session do not
 * all share their hours or their room.
 *
 * A day is named once however many sittings it holds, so a workshop run in the
 * morning and again in the afternoon reads as one day with two times rather
 * than as the same date printed twice. Each sitting gets its own row, and a
 * place gets the same pin as anywhere else on the page: written as
 * "3:00 PM — Test" it read as part of the time rather than as a location.
 */
export default function ScheduleList({
  entries,
}: {
  readonly entries: EventWhen["schedule"];
}) {
  return (
    <ul className="space-y-2 text-sm text-text-secondary">
      {entries.map((entry) => (
        <li key={entry.day} className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="min-w-28 shrink-0 font-medium text-text-main">
            {entry.day}
          </span>
          <span className="flex flex-col gap-1">
            {entry.slots.map((slot, slotIndex) => (
              <span
                // Two sittings can share a time only if they differ by room,
                // and vice versa, so the pair plus its position is stable.
                key={`${slot.time}-${slot.location ?? ""}-${slotIndex}`}
                className="flex flex-wrap items-baseline gap-x-2"
              >
                {slot.time && <span>{slot.time}</span>}
                {slot.location && (
                  <span className="inline-flex items-baseline gap-1.5">
                    <LocationPin className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-primary" />
                    <span>
                      <span className="sr-only">Location: </span>
                      {slot.location}
                    </span>
                  </span>
                )}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}
