/**
 * Builds the `admin.components` block for a field whose explanation is too long
 * to sit on screen in full.
 *
 * Use it in place of `description` when the guidance runs past roughly one
 * line: `short` stays visible, `more` sits behind a "More help" toggle.
 *
 *   admin: fieldHelp(
 *     "Optional. Extra days for an event that runs across more than one.",
 *     "Running the same day twice? Add the same date again with its own times.",
 *   )
 *
 * A field with an already-short description should keep plain `description`.
 * There is nothing gained by hiding a line that already fits.
 */
export function fieldHelp(short: string, more?: string) {
  return {
    components: {
      Description: {
        path: "/payload/components/FieldHelp.tsx#FieldHelp",
        clientProps: { short, more },
      },
    },
  };
}
