/**
 * The committee handbook, kept as data rather than markup so the same words can
 * be rendered in the admin (`ExecGuide.tsx`) and mirrored into
 * `docs/exec-guide.md` without the two drifting apart.
 *
 * Written for a committee member who has never used a CMS. Use the words they
 * see on screen ("Publish changes", "Save Draft") rather than the words in the
 * code, and keep it plain: this is a handover note to the next exec, not
 * documentation.
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
    "I built this site and handed it over. If something's broken, or you want to change something this admin won't let you change, message me instead of guessing at it. Happy to help.",
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
        text: "This is where the website's content lives. The site reads from here, so anything you publish shows up on uoarocketry.com. You don't need to touch any code to change text, photos, events, rockets, people or sponsors.",
      },
      {
        type: "text",
        text: "The menu on the left is grouped by which part of the site each thing controls. Events and Event Tags feed the Events page. Rockets feeds the Rockets page. Executives feeds the team section on About. What We Do, Journey Items, Team Roles and Stats are the four blocks that make up the rest of the About page.",
      },
      {
        type: "callout",
        label: "Changes aren't instant.",
        text: "The site caches pages for up to five minutes so it loads fast. If your change isn't showing, give it a few minutes and refresh before you assume something's broken.",
      },
    ],
  },
  {
    id: "draft-and-publish",
    title: "Draft and publish",
    blocks: [
      {
        type: "text",
        text: "This is the bit people get wrong most, so it's worth reading properly. There are two buttons and they do very different things.",
      },
      {
        type: "list",
        items: [
          "Save Draft keeps your work private. Nobody on the website can see it. Use it when something's half finished.",
          "Publish changes puts it live. Anyone can see it straight away.",
        ],
      },
      {
        type: "text",
        text: "If you only ever saved a draft, it's not on the site at all. So if you've written an event and can't find it on the website, that's almost always why. Open it and hit Publish changes.",
      },
      {
        type: "callout",
        label: "It catches you the other way too.",
        text: "Editing something that's already live and hitting Save Draft doesn't take the old version down. The site keeps showing the last published version until you hit Publish changes.",
      },
      {
        type: "text",
        text: "If you want to see how something looks before it goes live, open it and use the preview link. That shows you the real page without publishing it.",
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
          "Go to Events in the left menu and hit Create New.",
          "Give it a Title. The Slug on the right fills itself in from that, and it becomes the web address. Leave it alone unless you've got a reason not to.",
          "Add the Event image, usually the Instagram poster. If you leave it empty the card shows a plain UARC panel instead, which is fine.",
          "Write a Description. That's what people read on the event page.",
          "Set the Date, and the End time if you know when it wraps up.",
          "Pick an Event Tag so people can filter for it on the Events page. You manage the tags themselves in Event Tags.",
          "Choose how people sign up under Signup.",
          "Hit Publish changes.",
        ],
      },
      {
        type: "text",
        text: "The rest of the form is optional:",
      },
      {
        type: "list",
        items: [
          "Signup has three modes. No signup hides it. Link to a signup page gives you a Signup URL and a Signup button label. Instructions in plain text gives you a Signup text box, for when the form only lives in the Instagram bio.",
          "End time: when it finishes that day. Leave it and the page shows a start time only.",
          "Location: where it's happening.",
          "Gallery: extra photos for the event's own page.",
          "Links: Label and Url pairs for slides, a reading list, an OpenRocket starter file. The section heading is editable.",
        ],
      },
      {
        type: "text",
        text: "There are three ways to handle an event that isn't just a single afternoon, and it's easy to pick the wrong one. Here's the difference:",
      },
      {
        type: "list",
        items: [
          "Extra days and times: one event spread over days in a row, like a build weekend on the Saturday and Sunday. Also use it if you're running the same day twice.",
          "Sessions: a series where each week is its own thing, like Level 1 build workshops across a term.",
          "Neither: a normal one-off event. That's most of them.",
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
          "Go to Rockets and hit Create New.",
          "Add the Name, the Rocket image and a Description.",
          "Leave Launched At empty while it's still being built. A date in the future shows it as a scheduled launch, and a date in the past shows it as launched.",
          "Hit Publish changes.",
        ],
      },
      {
        type: "text",
        text: "That's the minimum. Everything else on the form is optional, and here's the lot:",
      },
      {
        type: "list",
        items: [
          "Rocket image, plus Image position on cards if the crop is cutting off the important bit.",
          "Gallery: extra photos, shown after the cover image on the rocket's own page.",
          "Videos: a list of Label and Url pairs for footage. There's a Videos heading field if you want to call the section something other than \"Videos\".",
          "Links: same Label and Url setup, for anything else worth linking, like a telemetry spreadsheet or an OpenRocket file. Its heading is editable too.",
          "Details: Label and Value pairs that fill the details box on the rocket page, so things like Motor / J450 or Apogee / 1,200 m. Leave it empty and the box doesn't show at all.",
          "Show on home page: puts it in Featured Rockets. It shows up to three, next launch first. If nobody ticks any, the home page falls back to the most recently launched.",
        ],
      },
    ],
  },
  {
    id: "update-the-team",
    title: "Update the exec team",
    blocks: [
      {
        type: "text",
        text: "Executives are grouped by year, so adding a new committee doesn't wipe the old one. The About page shows the current year and lets people look back at previous ones.",
      },
      {
        type: "steps",
        items: [
          "Go to Executives and hit Create New for each person.",
          "Fill in their Name, Role and a short Bio.",
          "Set Year to the committee year they're serving.",
          "Set Order to where they sit in that year, starting at 1.",
          "Add a Photo. If you haven't got one, the site shows their initials instead, and that's meant to happen.",
          "Add their Linkedin Url if they're happy for it to be public. That turns into the Visit Profile link on their card.",
          "Hit Publish changes.",
        ],
      },
      {
        type: "text",
        text: "There's also Photo position, which only shows once you've added a photo. Use it if the crop is cutting off someone's face.",
      },
      {
        type: "callout",
        label: "You don't have to renumber everyone.",
        text: "Give someone a position that's already taken and everyone below them shifts down on their own when you publish.",
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
          "Go to Sponsors and hit Create New.",
          "Add the Name, the Logo and the Url, which is their website.",
          "Pick the Tier, which is the section of the Sponsors page they show up in.",
          "Add a Description if you want a line about them under the logo. It's optional.",
          "Hit Publish changes.",
        ],
      },
      {
        type: "text",
        text: "Logos sit on a white plate by default, which works for most of them. Only switch Logo backing to dark if the logo is white or very pale and its background is see-through. If the logo has white baked into the image, a dark backing just gives you a white rectangle.",
      },
      {
        type: "text",
        text: "The tiers themselves live in Sponsor Tiers, so you can rename or reorder them there. You can't delete a tier while sponsors are still in it.",
      },
    ],
  },
  {
    id: "about-page",
    title: "The About page",
    blocks: [
      {
        type: "text",
        text: "The About page is built out of four separate collections, all grouped under About Page in the menu. Each one is a different part of that page, and they all have an Order field that sets what comes first.",
      },
      {
        type: "list",
        items: [
          "What We Do: the blocks near the top. Title, Body, an Image and its position, plus Variant.",
          "Journey Items: the club's timeline. Same fields as What We Do, so Title, Body, Image and Variant.",
          "Team Roles: the sub-teams like Avionics or Recovery. Title, Body, a list of Bullets, and Variant.",
          "Stats: the headline numbers. Just a Value like \"150\" and a Label like \"Active members\".",
        ],
      },
      {
        type: "callout",
        label: "What Variant does.",
        text: "It sets the background shade of that block, either Background or Surface. Alternate it between neighbouring blocks so the page has visible banding instead of one flat wall of colour.",
      },
    ],
  },
  {
    id: "images",
    title: "Images",
    blocks: [
      {
        type: "text",
        text: "Every image lives in Media, so you can reuse the same photo in a few places without uploading it twice.",
      },
      {
        type: "list",
        items: [
          "Go for landscape photos where you can. Portrait posters are fine for events, but they get cropped on wide screens everywhere else.",
          "Always fill in the alt text. It describes the photo for anyone using a screen reader, and it shows if the image fails to load. A few words does the job, like \"Aurora Mk II on the launch rail\".",
          "Some images have a drag-to-position control. Use it if the crop is cutting off the important bit.",
        ],
      },
      {
        type: "callout",
        label: "You can't delete an image that's in use.",
        text: "The Used in column tells you where each one shows up. Take it off those pages first, then delete it. That's on purpose, so a photo can't quietly vanish from a page nobody was looking at.",
      },
    ],
  },
  {
    id: "ordering",
    title: "Ordering things on a page",
    blocks: [
      {
        type: "text",
        text: "Anything that shows up in a row or a list has an Order field: exec members, stats, team roles, journey items, what-we-do blocks and sponsor tiers. Position 1 goes first.",
      },
      {
        type: "text",
        text: "Give something a position that's already taken and the rest shift down when you publish, so you never have to renumber a whole list by hand.",
      },
    ],
  },
  {
    id: "storage",
    title: "When storage runs low",
    blocks: [
      {
        type: "text",
        text: "The dashboard shows how much room the site has left, so you can check without needing a Supabase login. There are two bars and they fill up for different reasons, so check which one is actually the problem before you start deleting things.",
      },
      {
        type: "list",
        items: [
          "Photos and files: everything uploaded. This is the one that usually fills up, because images are big. Open Media, sort or scan for anything with an empty Used in column, and delete those. Nothing on the site is pointing at them.",
          "Site content: the text side, so events, rockets, people and everything you've typed. It fills up far more slowly. If it's the one that's high, clear out events from years ago that nobody needs any more, along with old exec years you're not showing, and any rockets that never went anywhere.",
        ],
      },
      {
        type: "callout",
        label: "Deleting an event doesn't free up its photos.",
        text: "The images stay in Media. So if you're clearing space, delete the old events first, then go back to Media and remove the photos that have just become unused.",
      },
      {
        type: "text",
        text: "If it's still tight after all that, the club needs a paid plan, and that's a committee call rather than something you can fix in here.",
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
          "Editors can change everything on the site but can't manage accounts. That's the right role for most committee members.",
          "Admins can do all that plus create, edit and delete accounts.",
        ],
      },
      {
        type: "callout",
        label: "Keep at least two admins.",
        text: "If the only admin leaves the club or loses access, nobody can make accounts for the next committee, and sorting that out needs developer access to the database.",
      },
      {
        type: "text",
        text: "At handover, make accounts for the incoming committee before the outgoing one loses access, and delete the accounts of anyone who's left.",
      },
    ],
  },
];
