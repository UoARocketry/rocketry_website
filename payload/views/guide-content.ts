/**
 * The committee handbook, kept as data rather than markup so the same words can
 * be rendered in the admin (`ExecGuide.tsx`) and mirrored into
 * `docs/exec-guide.md` without the two drifting apart.
 *
 * Written for a marketing exec who has never used a CMS. Prefer the words they
 * see on screen ("Publish changes", "Save Draft") over the words in the code.
 */

export type GuideBlock =
  | { type: "text"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: string[] }
  | { type: "callout"; label: string; text: string };

export type GuideSection = {
  id: string;
  title: string;
  blocks: GuideBlock[];
};

export const GUIDE_CONTACT = {
  intro:
    "This site was built and handed over by Jerry Kim. If something here is broken, or you want to change something the admin does not let you change, get in touch rather than guessing.",
  email: "jerryputhikunkim@gmail.com",
  linkedin: "https://www.linkedin.com/in/puthikun-jerry-kim/",
  linkedinLabel: "Puthikun (Jerry) Kim",
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "how-this-works",
    title: "How this works",
    blocks: [
      {
        type: "text",
        text: "This admin is where the website's content lives. The public site reads from it, so anything you publish here appears on uoarocketry.com. You never need to touch code to change words, photos, events, rockets, people or sponsors.",
      },
      {
        type: "text",
        text: "The menu on the left is grouped by the part of the site each thing controls. Events and Event Tags feed the Events page. Rockets feeds the Rockets page. Executives feeds the team section on About. What We Do, Journey Items, Team Roles and Stats are the four blocks that make up the rest of the About page.",
      },
      {
        type: "callout",
        label: "Changes are not instant.",
        text: "The site caches pages for up to five minutes so it stays fast. If your change is not showing yet, wait a few minutes and refresh before assuming something went wrong.",
      },
    ],
  },
  {
    id: "draft-and-publish",
    title: "Draft and publish",
    blocks: [
      {
        type: "text",
        text: "This is the single most important thing to understand, because it is the easiest to get wrong in both directions.",
      },
      {
        type: "list",
        items: [
          "Save Draft stores your work privately. Nobody visiting the website can see it. Use this when something is half-finished.",
          "Publish changes puts it live. Anyone can see it straight away.",
        ],
      },
      {
        type: "text",
        text: "A new item you only ever saved as a draft is not on the site at all. If you have written an event and cannot find it on the site, this is almost always why: open it and press Publish changes.",
      },
      {
        type: "callout",
        label: "The reverse trap.",
        text: "Editing something already published and pressing Save Draft does not take the old version down. The site keeps showing the last published version until you press Publish changes.",
      },
      {
        type: "text",
        text: "To check something before it goes live, open it and use the preview link. That shows you the page as it will look, without publishing.",
      },
    ],
  },
  {
    id: "add-an-event",
    title: "Add an event",
    blocks: [
      {
        type: "steps",
        items: [
          "Go to Events in the left menu and press Create New.",
          "Give it a Title. The Slug on the right fills itself in from the title, which becomes the web address. Leave it alone unless you have a reason.",
          "Add the Event image. This is usually the Instagram poster. Leave it empty and the card shows a plain UARC panel instead.",
          "Write a Description. This is what people read on the event page.",
          "Set the Date, and the End time if you know when it finishes.",
          "Pick an Event Tag so it can be filtered on the Events page.",
          "Choose how people sign up under Signup.",
          "Press Publish changes.",
        ],
      },
      {
        type: "text",
        text: "Three fields exist for events that are not a single afternoon, and it is worth knowing which one you want:",
      },
      {
        type: "list",
        items: [
          "Extra days and times: one event spread over consecutive days, e.g. a build weekend on the Saturday and Sunday. Also use it to add a second sitting on a day already listed.",
          "Sessions: a series where each week is its own thing, e.g. Level 1 build workshops running over a term.",
          "Neither: a normal one-off event. Most events are this.",
        ],
      },
    ],
  },
  {
    id: "add-a-rocket",
    title: "Add or update a rocket",
    blocks: [
      {
        type: "steps",
        items: [
          "Go to Rockets and press Create New.",
          "Add the Name, the Rocket image and a Description.",
          "Leave the launch date empty while the rocket is still being built. A date in the future shows it as a scheduled launch; a date in the past shows it as launched.",
          "Add Specs if you want the details box on the rocket page. Leave it empty and the box is hidden.",
          "Add a Gallery for extra photos, and Videos for any footage.",
          "Press Publish changes.",
        ],
      },
      {
        type: "text",
        text: "Tick Featured to put a rocket in the Featured Rockets section on the home page. Up to three are shown. If you tick none, the home page falls back to the most recently launched.",
      },
    ],
  },
  {
    id: "update-the-team",
    title: "Update the exec team",
    blocks: [
      {
        type: "text",
        text: "Executives are grouped by year, so a new committee does not overwrite the old one. The About page shows the current year and lets visitors look back at previous ones.",
      },
      {
        type: "steps",
        items: [
          "Go to Executives and press Create New for each person.",
          "Fill in their Name, Role and a short Bio.",
          "Set Year to the committee year they are serving.",
          "Set Order to their position within that year, starting at 1.",
          "Add a Photo. If you have none, the site shows their initials, which looks deliberate rather than broken.",
          "Press Publish changes.",
        ],
      },
      {
        type: "callout",
        label: "You do not need to renumber everyone.",
        text: "If you give someone a position that is already taken, everyone below them shifts down automatically when you publish.",
      },
    ],
  },
  {
    id: "add-a-sponsor",
    title: "Add a sponsor",
    blocks: [
      {
        type: "steps",
        items: [
          "Go to Sponsors and press Create New.",
          "Add the Name, the Logo and the sponsor's website address.",
          "Pick the Tier, which decides the section of the Sponsors page they appear in.",
          "Press Publish changes.",
        ],
      },
      {
        type: "text",
        text: "Logos sit on a white plate by default, which suits most artwork. Only switch Logo backing to dark when the logo is white or very pale and its background is transparent. A logo with white baked into the image will show as a white rectangle on a dark backing.",
      },
      {
        type: "text",
        text: "The tiers themselves live in Sponsor Tiers. You can rename or reorder them there. A tier cannot be deleted while sponsors are still in it.",
      },
    ],
  },
  {
    id: "images",
    title: "Images",
    blocks: [
      {
        type: "text",
        text: "Every image lives in Media, so the same photo can be reused in several places without uploading it twice.",
      },
      {
        type: "list",
        items: [
          "Upload landscape photos where possible. Portrait posters work for events, but get cropped on wide screens elsewhere.",
          "Always fill in the alt text. It describes the picture for people using a screen reader, and shows if the image fails to load. A few words is enough, e.g. \"Aurora Mk II on the launch rail\".",
          "Some images offer a drag-to-position control. Use it when the crop cuts off the important part.",
        ],
      },
      {
        type: "callout",
        label: "You cannot delete an image that is in use.",
        text: "The Used in column shows where each one appears. Remove it from those pages first, then delete it. This is deliberate: it stops a photo vanishing from a page nobody was looking at.",
      },
    ],
  },
  {
    id: "ordering",
    title: "Ordering things on a page",
    blocks: [
      {
        type: "text",
        text: "Anything that appears in a row or list has an Order field: exec members, stats, team roles, journey items, what-we-do blocks and sponsor tiers. Position 1 comes first.",
      },
      {
        type: "text",
        text: "Give something a position that is already taken and the others shift down when you publish, so you never have to renumber a whole list by hand.",
      },
    ],
  },
  {
    id: "storage",
    title: "When storage runs low",
    blocks: [
      {
        type: "text",
        text: "The dashboard shows how much room the site is using, so you can see it without needing a Supabase login. Two bars: one for everything written on the site, one for the photos and files uploaded to it.",
      },
      {
        type: "text",
        text: "If either is getting close to full, the quickest win is deleting images nothing uses. Open Media and look for entries with nothing in the Used in column. If it is still tight after that, the club needs to move to a paid plan, which is a decision for the committee rather than something to fix here.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    blocks: [
      {
        type: "list",
        items: [
          "Editors can change everything on the site but cannot manage accounts. This is the right role for most committee members.",
          "Admins can additionally create, edit and delete accounts.",
        ],
      },
      {
        type: "callout",
        label: "Keep at least two admins.",
        text: "If the only admin leaves the club or loses access, nobody can create accounts for the next committee, and fixing that needs developer access to the database.",
      },
      {
        type: "text",
        text: "At handover, create accounts for the incoming committee before the outgoing one loses access, and delete accounts for people who have left.",
      },
    ],
  },
];
