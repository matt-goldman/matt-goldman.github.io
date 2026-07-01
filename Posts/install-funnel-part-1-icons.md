---
description: "Your icon should never be an after thought, but in this post I explore the interesting trend of using prominent white items, why it might be the case, and how we can do this in our .NET MAUI apps."
title:  "The Install Funnel, Part 1: Make Your Icon Stand Out"
date:   2026-07-02 00:00:01 +1000
image:  /images/posts/install-funnel-part1.png
tags:   [mobile, maui, ui]
categories: [.NET, Mobile]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

There are at least four places you can lose a user before they've done anything useful with your app: the store page, the icon, the onboarding flow, and the first screen of real UI. Each user lost is invisible; none of them show up in your retention dashboard, because a user who never installs never becomes a data point. This is why pre-install losses tend to get less attention (which makes sense).

This series is about the two pre-install stages, because they're the ones most teams (in my experience) generally don't get the time to think about as much. This first post is about the icon.

:::note
This post is part of MAUI UI July 2026. [See the full lineup here](/posts/mauiuijuly-26) and check back every day for new content!
:::

## Ten Years Ago, Someone Complained About White Icons

Just to state the core thing up front: white app icons dominate the top of the App Store and Play Store lists.

I noticed this by chance a few weeks ago, and assumed there must be some design rule for this. But after looking around I found nothing.

Well, not nothing. In 2015, a designer named Michael Flarup wrote a piece on Medium called ["Let's Talk About White App Icons"](https://medium.com/swlh/let-s-talk-about-white-app-icons-ce2e83b9eb86). The complaint was that too many apps were reaching for white backgrounds as a default, that it was becoming a lazy shorthand for "premium," and that home screens were starting to look homogenised.

Ten years later, the trend hasn't reversed. It's stronger. And I don't think it's laziness, I think there's a real strategic logic behind it that becomes visible once you actually count. But I don't think anyone has articulated it, which is why I decided to share this post.

## The Observation

I was scrolling the App Store and noticed that a striking proportion of the most popular apps had icons that were either mostly white or built around a white graphic. Not universally, but frequently enough that it felt like a pattern rather than a coincidence. My gut estimate was nine in ten of the top hundred.

Gut estimates are usually wrong, and this one turned out to be *sort of* right and *sort of* misleading. The interesting part is which part is which.

## Counting It Properly

I took the top 25 apps from three lists:

- **iOS App Store — Top Free**
- **iOS App Store — Top Paid**
- **Google Play Store — Top Free Apps**
- **Google Play Store — Top Free Games**

I skipped Google Play's paid category because Google only publishes "top grossing," which I didn't think was a like-for-like or fair comparison (it's dominated by IAP-heavy games and doesn't measure install intent the same way).

For each icon I noted whether it used white in one of four ways, or not at all:

- **White background** — the dominant surface of the icon is white, with a coloured mark on top
- **White text/wordmark** — the icon centres on white text on a coloured or gradient background
- **White graphic** — a white shape or symbol as the primary mark on a coloured background
- **White as non-primary element** — white is present but decorative (highlights, teeth on a character, shine on a tile)
- **No white** — no meaningful use of white at all


:::note
These lists, which I captured on 11th June 2026, are not stable. I saved the list, made a mistake, went back five minutes later, and three or four apps had swapped in or out with several others changing rank. iOS was steady over the same window.  The specific apps themselves are not what's interesting though, it's the proportions of apps with icons following this rule.
:::

## The Three Lists

### iOS Free — Top 25

| Category | Count |
|---|---|
| White background | 10 |
| White text/wordmark | 9 |
| White graphic on colour | 5 |
| White non-primary | 0 |
| No white at all | 2 |

**23 out of 25 icons — 92% — use white as a primary design element.**

(As per the above noted volatility, the count is 22 in the below screenshot, but was 23 at the time of analysis, but the difference is inconsequential).

This is the list where the pattern is most prominent. ChatGPT, Claude, Gemini, WhatsApp, Threads, Gmail, Google Maps, Chrome, Depop, Temu...pretty much all of them have a a white wordmark on a gradient, a white symbol on a saturated background, or a coloured mark on pure white. Note the list is slightly different now than it was a few weeks ago when I first looked as there are a small handful of World Cup related apps. And each of those follows this pattern.

![The top 25 free iPHone apps](/images/posts/ios-top25-free.png)

The two exceptions (Whatnot and Kalshi) are interesting because both are apps whose primary users arrive via referral or intent-driven search rather than App Store discovery. That's a pattern that'll come back later.

### iOS Paid — Top 25

| Category | Count |
|---|---|
| White background | 5 |
| White text/wordmark | 4 |
| White graphic on colour | 5 |
| White non-primary | 5 |
| No white at all | 6 |

**19 out of 25 — 76% — use white in some form. But 24% have no meaningful white at all.**

![The top 25 paid iPhone apps](/images/posts/ios-top25-paid.png)

The paid apps list itself is different. Shadowrocket, Procreate Pocket, AnkiMobile, RadarScope, FL Studio Mobile, Paprika, Streaks, Ableton Note are pro tools, hobby tools, and deep-domain apps. They don't typically rely on grabbing attention in the store, they acquire through word of mouth referrals.  And even some of those follow the pattern, as do more than 3/4 of them overall.

### Google Play Free — Top 25 Apps

| Category | Count |
|---|---|
| White background | 3 |
| White text/wordmark | 5 |
| White graphic on colour | 11 |
| White non-primary | 4 |
| No white at all | 4 |

**21 out of 25 — 84% — use white in some form.**

![The top 25 free Android apps](/images/posts/google-play-top9-apps.png)

This is the like-for-like comparison against iOS Free, and the pattern is here too. ChatGPT, Meta AI, Claude, WhatsApp, TikTok, Instagram, X, Temu, AliExpress, Shop, Prime Video, HBO Max, Paramount+, ShopBack... the same white-forward design language as the iOS list, with substantial roster overlap.

The Australian angle shows through here (SBS On Demand, myGov, EatClub) because I'm running the analysis from Sydney; your local top 25 will differ, but the aesthetic distribution shouldn't.

Notable that of the four "no white" apps (SBS On Demand, UKG Pro, myGov, Amazon Shopping) three are apps users seek out by name for a specific task (government services, enterprise HR, a known retailer). Amazon in particular doesn't need white to win a grid; the wordmark is the point. Same pattern as Whatnot and Kalshi on the iOS list.

### Google Play Free — Top 25 Games

| Category | Count |
|---|---|
| White background | 4 |
| White text/wordmark | 2 |
| White graphic on colour | 3 |
| White non-primary | 9 |
| No white at all | 8 |

**17 out of 25 — 68% — use white in some form, but only 12 use it as a primary element.**

![The top 25 free Android apps](/images/posts/google-play-top9-games.png)

The App Store combines apps and games into a single top 25 list, whereas Google Play separates them. Seeing as neither is a proper like-for-like comparison, I've included both here for completeness. Games have their own icon language, which is illustrative, character-forward, screenshot-adjacent, and white shows up as decoration (a tile's shine, a character's teeth) rather than as design intent.

That's why the "non-primary" column balloons to nine here, but white still shows up frequently.

## The Trend Across the Three Lists

Line them up side by side and there's a clean, monotonic gradient:

| List | Primary white | No white |
|---|---|---|
| iOS Free (top 25) | 92% | 8% |
| Google Play Free Apps (top 25) | 84% | 16% |
| iOS Paid (top 25) | 76% | 24% |
| Google Play Free Games (top 25) | 68% | 32% |

The data shows a clear trend favouring white for app icons. Not everyone uses it, but looking at the distinction for those that don't the pattern appears to be this:

**The more an app needs to win a stranger's attention in a grid, the whiter it gets.**

That reframes the observation as strategy rather than aesthetic, which is much more useful.

## Why White Wins

A few overlapping hypotheses. I don't think any single one is the full explanation, but stacked together they make the pattern feel coherent.

### Contrast Against the Grid

Home screens are dense with saturated gradients and photographic icons. Iconography as a category has drifted toward vivid colour over the last decade, partly because HDR displays have evolved and display it well, and partly because it's the easiest way to signal "modern app" to a designer. In that sea of colour, absence of colour is the loudest move available.

White doesn't compete for attention with the neighbouring icons; it opts out of the competition entirely, which paradoxically makes it win the competition. There's a reason the same trick works for luxury branding in retail environments crowded with red-and-yellow discount signage.

### The Squircle Disappears

iOS and Android both mask icons into a rounded shape. When the icon background is white and the wallpaper is anything other than pure white, the squircle's edge becomes the *only* visible boundary of the icon. The mark inside — the ChatGPT swirl, the Claude asterisk, the Gemini spark — gets to occupy the full perceived area of the tile because the tile itself has no internal detail competing with it.

Coloured backgrounds spend part of their pixel budget on being a background. White backgrounds spend all of it on the mark.

### Premium Signalling

White space has been shorthand for "expensive" in visual design for a long time. Apple's own store, hardware packaging, and marketing material have been reinforcing this association for two decades. Consumers arrive at the App Store pre-trained to read white-on-something as "considered" and colour-on-colour as "shouty."

Whether the association is deserved is a separate question, but it exists, and designers are responding to it.

### Survivorship Bias (The Honest Caveat)

It would be unfair to confuse causation and correlation, and these apps are certainly not only in the top 25 because of their icons. ChatGPT is in the top 25 because it's ChatGPT. If OpenAI shipped a magenta icon tomorrow, it would still be in the top 5 or 10.

The correct claim isn't that white icons cause success, it's that when designers with the resources and stakes of top-25 apps make icon decisions, they overwhelmingly converge on white. But the convergence is itself evidence, just not evidence of the naive causal claim.

## The Strategic Principle

Pull the three lists together and the actionable version is this:

- **The further you are from a known audience, the more you should lean into high-contrast minimalism.** White is the extreme case of that.
- **The closer you are to a known audience (e.g. pro tools, verticals, apps discovered through community rather than store browsing) the more latitude you have.** Procreate can get away with a dark, illustrative icon because nobody arrives at Procreate by accident.

This is essentially the difference between an *acquisition* design brief and an *identity* design brief. Both are legitimate, neither is superior, but they're different jobs, and using the wrong tool for the job is where most icon design goes wrong.

Devs building a consumer app for discovery keep insisting on their brand colour because it feels right. Devs building a niche pro tool keep insisting on high contrast because they think that's what good icons look like. But the evidence suggests that both are wrong.

## What Does This Means for .NET MAUI Devs?

### If You're Building for Discovery

Your icon is competing in a grid you don't control. Audit it against the actual top-25 grid of your target category (not against your own homepage mockup). Screenshot the store category listing and drop your icon into position five, ten, twenty. Does it read? Does a stranger's eye land on it at all?

If your icon needs to be seen at 60 pixels next to twenty saturated gradients, white is a defensible default and the burden of proof is on anything else.

### If You're Building for a Known Audience

The data says you have latitude. A dark icon, a photographic icon, an illustrative icon — all of these can work when the user is arriving with intent. You don't have to perform "modern app design" when it costs you identity.

### The Practical Bit

.NET MAUI generates platform icons from a single `MauiIcon` source, split into foreground and background layers. This is one of the areas where the framework does the boring work for you, if you set it up correctly.

A minimal setup in your `.csproj`:

```xml
<ItemGroup>
    <MauiIcon Include="Resources\AppIcon\appicon.svg"
              ForegroundFile="Resources\AppIcon\appiconfg.svg"
              Color="#FFFFFF" />
</ItemGroup>
```

A few things to check:

- **Foreground safe zone.** Both iOS and Android apply their own masking. Content in the outer ~15% of the foreground SVG will be clipped on at least one target. Keep the mark centred and give it breathing room.
- **Background as a solid colour vs an SVG.** For the white-background pattern, a solid `Color="#FFFFFF"` is enough and produces the cleanest result. Reach for a background SVG only if you actually need a gradient or texture.
- **Test against the grid, not against a Figma frame.** Build your app, install it on a device, and place it on a home screen next to your top three competitors. If you can't pick it out at a glance, you probably need to change it.
- **Light and dark home screens.** A white icon on a white-heavy wallpaper vanishes. Most icons handle this fine because the squircle mask provides an implicit shadow, but if you're going pure white on white, add a subtle border tone (`#F5F5F5` for the outer ring, `#FFFFFF` for the interior) to preserve edge definition.

## Try This Today

A two-minute exercise:

1. Screenshot the current top 25 in your app's App Store category.
2. Paste the grid into any image editor.
3. Replace one of the icons with your own.
4. Ask someone who's never seen your app to find it in five seconds.

If they can't, the icon isn't doing its job. That's not a comment on the icon's aesthetic quality; most icons that fail this test are objectively well-designed. It's a comment on fit-for-purpose.

## Coming Next

In part two: screenshots, and the argument that you, the person who built the app, are the worst possible person to pick which screens to show on the store page. There's a way out, and it involves handing the job to something that has never seen your app before.