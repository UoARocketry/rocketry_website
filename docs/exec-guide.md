<!--
  GENERATED FILE - do not edit by hand.
  Source: payload/views/guide-content.ts
  Regenerate: npm run guide:docs
-->

# Guide for committee members

How to keep the UARC website up to date. You don't need to know anything about
code, and you don't have to read all of this. Jump to whatever you're trying to
do.

This is a copy of the guide built into the admin. The one committee members
should actually use is at **/admin/guide**, linked from the dashboard and from
the bottom of the admin sidebar.

## Contents

1. [How this works](#how-this-works)
2. [Draft and publish](#draft-and-publish)
3. [Add an event](#add-an-event)
4. [Add or update a rocket](#add-or-update-a-rocket)
5. [Update the exec team](#update-the-exec-team)
6. [Add a sponsor](#add-a-sponsor)
7. [Event tags and sponsor tiers](#event-tags-and-sponsor-tiers)
8. [The About page](#the-about-page)
9. [Images](#images)
10. [Ordering things on a page](#ordering-things-on-a-page)
11. [When storage runs low](#when-storage-runs-low)
12. [Accounts](#accounts)

## How this works

This is where the website's content lives. The site reads from here, so anything you publish shows up on uoarocketry.com. You don't need to touch any code to change text, photos, events, rockets, people or sponsors.

The menu on the left is grouped by which part of the site each thing controls. Events and Event Tags feed the Events page. Rockets feeds the Rockets page. Executives feeds the team section on About. What We Do, Journey Items, Team Roles and Stats are the four blocks that make up the rest of the About page.

> **Changes aren't instant.** The site caches pages for up to five minutes so it loads fast. If your change isn't showing, give it a few minutes and refresh before you assume something's broken.

## Draft and publish

This is the bit people get wrong most, so it's worth reading properly. There are two buttons and they do very different things.

- Save Draft keeps your work private. Nobody on the website can see it. Use it when something's half finished.
- Publish changes puts it live. Anyone can see it straight away.

If you only ever saved a draft, it's not on the site at all. So if you've written an event and can't find it on the website, that's almost always why. Open it and hit Publish changes.

> **It catches you the other way too.** Editing something that's already live and hitting Save Draft doesn't take the old version down. The site keeps showing the last published version until you hit Publish changes.

If you want to see how something looks before it goes live, open it and use the preview link. That shows you the real page without publishing it.

## Add an event

1. Go to Events in the left menu and hit Create New.
2. Give it a Title. The Slug on the right fills itself in from that, and it becomes the web address. Leave it alone unless you've got a reason not to.
3. Add the Event image, usually the Instagram poster. If you leave it empty the card shows a plain UARC panel instead, which is fine.
4. Write a Description. That's what people read on the event page.
5. Set the Date, and the End time if you know when it wraps up.
6. Pick an Event Tag so people can filter for it on the Events page. You manage the tags themselves in Event Tags.
7. Choose how people sign up under Signup.
8. Hit Publish changes.

The rest of the form is optional:

- Signup has three modes. No signup hides it. Link to a signup page gives you a Signup URL and a Signup button label. Instructions in plain text gives you a Signup text box, for when the form only lives in the Instagram bio.
- End time: when it finishes that day. Leave it and the page shows a start time only.
- Location: where it's happening.
- Gallery: extra photos for the event's own page.
- Links: Label and Url pairs for slides, a reading list, an OpenRocket starter file. The section heading is editable.

There are three ways to handle an event that isn't just a single afternoon, and it's easy to pick the wrong one. Here's the difference:

- Extra days and times: one event spread over days in a row, like a build weekend on the Saturday and Sunday. Also use it if you're running the same day twice.
- Sessions: a series where each week is its own thing, like Level 1 build workshops across a term.
- Neither: a normal one-off event. That's most of them.

## Add or update a rocket

1. Go to Rockets and hit Create New.
2. Add the Name, the Rocket image and a Description.
3. Leave Launched At empty while it's still being built. A date in the future shows it as a scheduled launch, and a date in the past shows it as launched.
4. Hit Publish changes.

That's the minimum. Everything else on the form is optional, and here's the lot:

- Rocket image, plus Image position on cards if the crop is cutting off the important bit.
- Gallery: extra photos, shown after the cover image on the rocket's own page.
- Videos: a list of Label and Url pairs for footage. There's a Videos heading field if you want to call the section something other than "Videos".
- Links: same Label and Url setup, for anything else worth linking, like a telemetry spreadsheet or an OpenRocket file. Its heading is editable too.
- Details: Label and Value pairs that fill the details box on the rocket page, so things like Motor / J450 or Apogee / 1,200 m. Leave it empty and the box doesn't show at all.
- Show on home page: puts it in Featured Rockets. It shows up to three, next launch first. If nobody ticks any, the home page falls back to the most recently launched.

## Update the exec team

Executives are grouped by year, so adding a new committee doesn't wipe the old one. The About page shows the current year and lets people look back at previous ones.

1. Go to Executives and hit Create New for each person.
2. Fill in their Name, Role and a short Bio.
3. Set Year to the committee year they're serving.
4. Set Order to where they sit in that year, starting at 1.
5. Add a Photo. If you haven't got one, the site shows their initials instead, and that's meant to happen.
6. Add their Linkedin Url if they're happy for it to be public. That turns into the Visit Profile link on their card.
7. Hit Publish changes.

There's also Photo position, which only shows once you've added a photo. Use it if the crop is cutting off someone's face.

> **You don't have to renumber everyone.** Give someone a position that's already taken and everyone below them shifts down on their own when you publish.

## Add a sponsor

1. Go to Sponsors and hit Create New.
2. Add the Name, the Logo and the Url, which is their website.
3. Pick the Tier, which is the section of the Sponsors page they show up in.
4. Add a Description if you want a line about them under the logo. It's optional.
5. Hit Publish changes.

Logos sit on a white plate by default, which works for most of them. Only switch Logo backing to dark if the logo is white or very pale and its background is see-through. If the logo has white baked into the image, a dark backing just gives you a white rectangle.

The tiers themselves live in Sponsor Tiers, so you can rename or reorder them there. You can't delete a tier while sponsors are still in it.

## Event tags and sponsor tiers

These two are lists that other things point at. Event Tags are the filter buttons along the top of the Events page. Sponsor Tiers are the sections the Sponsors page is split into. You'll only touch them when the club adds a new kind of event or a new sponsorship level.

1. For a tag, open Event Tags under Events. For a tier, open Sponsor Tiers under Sponsors.
2. Hit Create New.
3. Type the Name. This is what people see on the site, so write it the way you want it to read.
4. For a tier you can also add a Description, which shows under the section heading. It's optional.
5. Set the Order, which is where it sits in the row or down the page. Position 1 goes first.
6. Hit Save.

> **These two save straight away.** There's no Save Draft or Publish changes on tags and tiers, just a Save button, and it's live the moment you hit it. Everything else in this guide has a draft step, so it's worth knowing these two don't.

Renaming works the way you'd hope. Events and sponsors point at the tag or tier rather than keeping their own copy of the name, so renaming one updates it everywhere it appears. You don't need to go back and re-tag anything.

- Deleting a tag is safe. It just clears off any event that used it, and those events stay published.
- Deleting a tier is blocked while sponsors are still in it. Move them to another tier first, then delete the empty one. The message tells you which sponsors are holding it.
- A tier with no sponsors in it doesn't show on the Sponsors page at all, so an empty tier isn't a problem, it's just invisible until you put someone in it.

## The About page

The About page is built out of four separate collections, all grouped under About Page in the menu. Each one is a different part of that page, and they all have an Order field that sets what comes first.

- What We Do: the blocks near the top. Title, Body, an Image and its position, plus Variant.
- Journey Items: the club's timeline. Same fields as What We Do, so Title, Body, Image and Variant.
- Team Roles: the sub-teams like Avionics or Recovery. Title, Body, a list of Bullets, and Variant.
- Stats: the headline numbers. Just a Value like "150" and a Label like "Active members".

> **What Variant does.** It sets the background shade of that block, either Background or Surface. Alternate it between neighbouring blocks so the page has visible banding instead of one flat wall of colour.

## Images

Every image lives in Media, so you can reuse the same photo in a few places without uploading it twice.

- Go for landscape photos where you can. Portrait posters are fine for events, but they get cropped on wide screens everywhere else.
- Always fill in the alt text. It describes the photo for anyone using a screen reader, and it shows if the image fails to load. A few words does the job, like "Aurora Mk II on the launch rail".
- Some images have a drag-to-position control. Use it if the crop is cutting off the important bit.

> **You can't delete an image that's in use.** The Used in column tells you where each one shows up. Take it off those pages first, then delete it. That's on purpose, so a photo can't quietly vanish from a page nobody was looking at.

## Ordering things on a page

Anything that shows up in a row or a list has an Order field: exec members, stats, team roles, journey items, what-we-do blocks and sponsor tiers. Position 1 goes first.

Give something a position that's already taken and the rest shift down when you publish, so you never have to renumber a whole list by hand.

## When storage runs low

The dashboard shows how much room the site has left, so you can check without needing a Supabase login. There are two bars and they fill up for different reasons, so check which one is actually the problem before you start deleting things.

- Photos and files: everything uploaded. This is the one that usually fills up, because images are big. Open Media, sort or scan for anything with an empty Used in column, and delete those. Nothing on the site is pointing at them.
- Site content: the text side, so events, rockets, people and everything you've typed. It fills up far more slowly. If it's the one that's high, clear out events from years ago that nobody needs any more, along with old exec years you're not showing, and any rockets that never went anywhere.

> **Deleting an event doesn't free up its photos.** The images stay in Media. So if you're clearing space, delete the old events first, then go back to Media and remove the photos that have just become unused.

If it's still tight after all that, the club needs a paid plan, and that's a committee call rather than something you can fix in here.

## Accounts

- Editors can change everything on the site but can't manage accounts. That's the right role for most committee members.
- Admins can do all that plus create, edit and delete accounts.

> **Keep at least two admins.** If the only admin leaves the club or loses access, nobody can make accounts for the next committee, and sorting that out needs developer access to the database.

At handover, make accounts for the incoming committee before the outgoing one loses access, and delete the accounts of anyone who's left.

## Who to ask

I built this site and handed it over. If something's broken, or you want to change something this admin won't let you change, message me instead of guessing at it. Happy to help.

- Email: jerryputhikunkim@gmail.com
- LinkedIn: [Puthikun (Jerry) Kim](https://www.linkedin.com/in/puthikun-jerry-kim/)
