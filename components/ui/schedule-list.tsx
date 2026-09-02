import type { EventWhen } from "@/lib/utils";
import LocationPin from "@/components/ui/location-pin";

/**
 * The per-day breakdown shown when the days of an event or a session do not
 * all share their hours or their room.
 *
 * A place gets the same pin here as anywhere else on the page. Written as
 * "3:00 PM — Test" it read as part of the time rather than as a location.
 */
export default function ScheduleList({
  entries,
}: {
  readonly entries: EventWhen["schedule"];
}) {
  return (
    <ul className="space-y-1.5 text-sm text-text-secondary">
      {entries.map((entry) => (
        <li
          key={entry.day}
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
        >
          <span className="min-w-28 shrink-0 font-medium text-text-main">
            {entry.day}
          </span>
          {entry.time && <span>{entry.time}</span>}
          {entry.location && (
            <span className="inline-flex items-baseline gap-1.5">
              <LocationPin className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-primary" />
              <span>
                <span className="sr-only">Location: </span>
                {entry.location}
              </span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
