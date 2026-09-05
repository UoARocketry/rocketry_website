<!--
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

1. [How this works](#how-this-works)
2. [Draft and publish](#draft-and-publish)
3. [Add an event](#add-an-event)
4. [Add or update a rocket](#add-or-update-a-rocket)
5. [Update the exec team](#update-the-exec-team)
6. [Add a sponsor](#add-a-sponsor)
7. [Images](#images)
8. [Ordering things on a page](#ordering-things-on-a-page)
9. [When storage runs low](#when-storage-runs-low)
10. [Accounts](#accounts)

## How this works

This admin is where the website's content lives. The public site reads from it, so anything you publish here appears on uoarocketry.com. You never need to touch code to change words, photos, events, rockets, people or sponsors.

The menu on the left is grouped by the part of the site each thing controls. Events and Event Tags feed the Events page. Rockets feeds the Rockets page. Executives feeds the team section on About. What We Do, Journey Items, Team Roles and Stats are the four blocks that make up the rest of the About page.

> **Changes are not instant.** The site caches pages for up to five minutes so it stays fast. If your change is not showing yet, wait a few minutes and refresh before assuming something went wrong.

## Draft and publish

This is the single most important thing to understand, because it is the easiest to get wrong in both directions.

- Save Draft stores your work privately. Nobody visiting the website can see it. Use this when something is half-finished.
- Publish changes puts it live. Anyone can see it straight away.

A new item you only ever saved as a draft is not on the site at all. If you have written an event and cannot find it on the site, this is almost always why: open it and press Publish changes.

> **The reverse trap.** Editing something already published and pressing Save Draft does not take the old version down. The site keeps showing the last published version until you press Publish changes.

To check something before it goes live, open it and use the preview link. That shows you the page as it will look, without publishing.

## Add an event

1. Go to Events in the left menu and press Create New.
2. Give it a Title. The Slug on the right fills itself in from the title, which becomes the web address. Leave it alone unless you have a reason.
3. Add the Event image. This is usually the Instagram poster. Leave it empty and the card shows a plain UARC panel instead.
4. Write a Description. This is what people read on the event page.
5. Set the Date, and the End time if you know when it finishes.
6. Pick an Event Tag so it can be filtered on the Events page.
7. Choose how people sign up under Signup.
8. Press Publish changes.

Three fields exist for events that are not a single afternoon, and it is worth knowing which one you want:

- Extra days and times: one event spread over consecutive days, e.g. a build weekend on the Saturday and Sunday. Also use it to add a second sitting on a day already listed.
- Sessions: a series where each week is its own thing, e.g. Level 1 build workshops running over a term.
- Neither: a normal one-off event. Most events are this.

## Add or update a rocket

1. Go to Rockets and press Create New.
2. Add the Name, the Rocket image and a Description.
3. Leave the launch date empty while the rocket is still being built. A date in the future shows it as a scheduled launch; a date in the past shows it as launched.
4. Add Specs if you want the details box on the rocket page. Leave it empty and the box is hidden.
5. Add a Gallery for extra photos, and Videos for any footage.
6. Press Publish changes.

Tick Featured to put a rocket in the Featured Rockets section on the home page. Up to three are shown. If you tick none, the home page falls back to the most recently launched.

## Update the exec team

Executives are grouped by year, so a new committee does not overwrite the old one. The About page shows the current year and lets visitors look back at previous ones.

1. Go to Executives and press Create New for each person.
2. Fill in their Name, Role and a short Bio.
3. Set Year to the committee year they are serving.
4. Set Order to their position within that year, starting at 1.
5. Add a Photo. If you have none, the site shows their initials, which looks deliberate rather than broken.
6. Press Publish changes.

> **You do not need to renumber everyone.** If you give someone a position that is already taken, everyone below them shifts down automatically when you publish.

## Add a sponsor

1. Go to Sponsors and press Create New.
2. Add the Name, the Logo and the sponsor's website address.
3. Pick the Tier, which decides the section of the Sponsors page they appear in.
4. Press Publish changes.

Logos sit on a white plate by default, which suits most artwork. Only switch Logo backing to dark when the logo is white or very pale and its background is transparent. A logo with white baked into the image will show as a white rectangle on a dark backing.

The tiers themselves live in Sponsor Tiers. You can rename or reorder them there. A tier cannot be deleted while sponsors are still in it.

## Images

Every image lives in Media, so the same photo can be reused in several places without uploading it twice.

- Upload landscape photos where possible. Portrait posters work for events, but get cropped on wide screens elsewhere.
- Always fill in the alt text. It describes the picture for people using a screen reader, and shows if the image fails to load. A few words is enough, e.g. "Aurora Mk II on the launch rail".
- Some images offer a drag-to-position control. Use it when the crop cuts off the important part.

> **You cannot delete an image that is in use.** The Used in column shows where each one appears. Remove it from those pages first, then delete it. This is deliberate: it stops a photo vanishing from a page nobody was looking at.

## Ordering things on a page

Anything that appears in a row or list has an Order field: exec members, stats, team roles, journey items, what-we-do blocks and sponsor tiers. Position 1 comes first.

Give something a position that is already taken and the others shift down when you publish, so you never have to renumber a whole list by hand.

## When storage runs low

The dashboard shows how much room the site is using, so you can see it without needing a Supabase login. Two bars: one for everything written on the site, one for the photos and files uploaded to it.

If either is getting close to full, the quickest win is deleting images nothing uses. Open Media and look for entries with nothing in the Used in column. If it is still tight after that, the club needs to move to a paid plan, which is a decision for the committee rather than something to fix here.

## Accounts

- Editors can change everything on the site but cannot manage accounts. This is the right role for most committee members.
- Admins can additionally create, edit and delete accounts.

> **Keep at least two admins.** If the only admin leaves the club or loses access, nobody can create accounts for the next committee, and fixing that needs developer access to the database.

At handover, create accounts for the incoming committee before the outgoing one loses access, and delete accounts for people who have left.

## Who to ask

This site was built and handed over by Jerry Kim. If something here is broken, or you want to change something the admin does not let you change, get in touch rather than guessing.

- Email: jerryputhikunkim@gmail.com
- LinkedIn: [Puthikun (Jerry) Kim](https://www.linkedin.com/in/puthikun-jerry-kim/)
