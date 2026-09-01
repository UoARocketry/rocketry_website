/**
 * Builds the monogram shown on an exec card when no headshot was uploaded.
 *
 * First and last name only: a middle name would push it to three letters and
 * break the circle's optical balance at 112px.
 */
export function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  const first = parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : "";

  const letters = `${first.charAt(0)}${last.charAt(0)}`;
  return letters.toLocaleUpperCase();
}
