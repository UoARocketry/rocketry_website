"use client";

import type { DateFieldClientComponent } from "payload";
import { useField } from "@payloadcms/ui";
import { fromDayInputValue, toDayInputValue } from "../../lib/day-date.ts";

/**
 * A calendar-day picker that cannot drift.
 *
 * Payload's `dayOnly` appearance is unusable in New Zealand: it converts to UTC
 * on write but formats in browser-local time on read, and at UTC+12 the stored
 * noon-UTC instant lands on the following day. Every date redisplayed one day
 * later than it was picked, so editors "corrected" dates that were already
 * right and the CMS and the site disagreed permanently.
 *
 * A native date input takes and returns a bare `YYYY-MM-DD` with no timezone
 * anywhere in the round trip, which removes the class of bug rather than
 * compensating for it. See `lib/day-date.ts` for the storage convention.
 */
export const DayOnlyDateField: DateFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({
    path,
  });

  const description =
    typeof field?.admin?.description === "string"
      ? field.admin.description
      : null;
  const label = typeof field?.label === "string" ? field.label : "Date";
  const inputId = `field-${path.replace(/\./g, "__")}`;

  return (
    <div className={`field-type date-time-field${showError ? " error" : ""}`}>
      <label className="field-label" htmlFor={inputId}>
        {label}
        {field?.required && <span className="required">*</span>}
      </label>
      <input
        className="day-only-date-input"
        id={inputId}
        name={path}
        type="date"
        value={toDayInputValue(value)}
        onChange={(event) => setValue(fromDayInputValue(event.target.value))}
        style={{
          // Payload's own tokens, so the control keeps the admin's look in
          // both themes rather than falling back to the browser default.
          background: "var(--theme-input-bg)",
          border: "1px solid var(--theme-elevation-150)",
          borderRadius: "var(--style-radius-s, 3px)",
          color: "var(--theme-elevation-800)",
          colorScheme: "var(--theme-elevation-0) light dark",
          fontFamily: "inherit",
          fontSize: "1rem",
          lineHeight: 1.5,
          padding: "0.5rem 0.75rem",
          width: "100%",
        }}
      />
      {showError && errorMessage && (
        <div className="field-error">{errorMessage}</div>
      )}
      {description && <div className="field-description">{description}</div>}
    </div>
  );
};
