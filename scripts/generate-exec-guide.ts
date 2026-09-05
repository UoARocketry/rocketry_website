/**
 * Renders `docs/exec-guide.md` from the same content the admin guide uses.
 *
 * The guide that matters is the one inside the admin, because that is where
 * committee members are. This mirror exists so the text is readable from the
 * repository too. Generating it means the two cannot drift: edit
 * `payload/views/guide-content.ts` and run `npm run guide:docs`.
 *
 * Usage: npm run guide:docs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GUIDE_CONTACT,
  GUIDE_SECTIONS,
  type GuideSection,
} from "../payload/views/guide-content.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(dirname, "..", "docs", "exec-guide.md");

function renderSection(section: GuideSection): string {
  const parts: string[] = [`## ${section.title}`, ""];

  for (const block of section.blocks) {
    if (block.type === "text") {
      parts.push(block.text, "");
    } else if (block.type === "steps") {
      block.items.forEach((item, i) => parts.push(`${i + 1}. ${item}`));
      parts.push("");
    } else if (block.type === "list") {
      block.items.forEach((item) => parts.push(`- ${item}`));
      parts.push("");
    } else {
      parts.push(`> **${block.label}** ${block.text}`, "");
    }
  }

  return parts.join("\n");
}

const contents = GUIDE_SECTIONS.map(
  (section, i) =>
    `${i + 1}. [${section.title}](#${section.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")})`,
).join("\n");

const markdown = `<!--
  GENERATED FILE - do not edit by hand.
  Source: payload/views/guide-content.ts
  Regenerate: npm run guide:docs
-->

# Guide for committee members

How to keep the UARC website up to date. You do not need to know anything about
code. Work through a section when you need it, rather than reading the whole
thing.

This is a copy of the guide built into the admin. The version committee members
should use is at **/admin/guide**, reachable from the dashboard and from the
bottom of the admin sidebar.

## Contents

${contents}

${GUIDE_SECTIONS.map(renderSection).join("\n")}
## Who to ask

${GUIDE_CONTACT.intro}

- Email: ${GUIDE_CONTACT.email}
- LinkedIn: [${GUIDE_CONTACT.linkedinLabel}](${GUIDE_CONTACT.linkedin})
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown, "utf8");
console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
