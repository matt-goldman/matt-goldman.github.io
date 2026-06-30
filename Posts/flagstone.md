---
description: "."
title:  "Flagstone UI goes GA with FsShell"
date:   2026-07-01 00:00:01 +1000
image:  /images/posts/flagstoneui.png
tags:   [mobile, maui, ui]
categories: [.NET, Mobile]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

## Welcome MAUI UI July and Flagstone UI!

Welcome to MAUI UI July 2026! I'm kicking things off with a celebration: Flagstone UI is now generally available.

It's been around for a while, some of you may even be using it, and it's been stable. I haven't and am not planning to make any breaking changes to the API, but I've been reluctant to remove the "experimental" caveat because it has felt incomplete. But the latest release includes a new control, `FsShell`, which to me elevates Flagstone UI to a full and valuable addition to any .NET MAUI app.

`FsShell` may not sound like a big deal but it's a prime example of the specific reason why Flagstone UI exists. .NET MAUI is great, but it doesn't expose the full gamut of styling capabilities at the cross-platform layer that modern apps require. They're all there, but you have to drop down to platform code to get access to them, which for many developers, especially those coming from .NET rather than iOS or Android, defeats the purpose. Flagstone UI addresses that by lifting a common set of styling properties to the cross-platform layer.

Shell is a powerful tool, providing opinionated routing and navigation foundations, and for the past four years it has been included in the default .NET MAUI app template. But Shell has a few problems:

* Routes are magic strings, which turns navigation from strongly-typed to stringly typed. `FsShell` doesn't help with that (but `[Plugin.Maui.SmartNavigation](https://github.com/matt-goldman/Plugin.Maui.SmartNavigation/)` does).
* It's opinionated about routing and navigation, which is good, but it's also opinionated about UI, which is not. This is exacerbated by:
* It couples navigation and presentation. This is the biggest problem.

The second two points are arguably two sides of the same coin, either way it's a big problem. Common complaints about .NET MAUI apps looking like .NET MAUI apps come from this. You have very limited styling options with Shell, and you can't wholesale lift out the UI and replace it with your own while still using the built-in routing and navigation framework.

Well, you _couldn't_; you can now.

Much like the other controls in Flagstone UI, `FsShell` doesn't try to give you a stylish looking Shell replacement, instead it completely decouples presentation from navigation. You can use everything you get with Shell (routes, navigation state, everything) and use your own UI for the presentation, fully built in cross-platform .NET MAUI (XAML or C#). With that said it does come with a relatively straightforward tab bar out of the box, it's not overly sophisticated but it gives you an `ItemTemplate` for tabs; something stock Shell only gives you for flyout items. It also provides some primitives for building your own Shell navigation UI so you don't have to start completely from scratch.

In a sense, you can think of Flagstone UI as being analogous to Tailwind. It's not a control library, but rather a styling surface that gives you more control, and gives you the tools you need to build your UI using .NET MAUI rather than platform code wrapped in C#.

In this post I'll show you three apps that show what that means in practice. One that uses `FsShell` to improve on the standard tab bar, one that uses it to reach patterns stock Shell can't, and one that uses it to build navigation that nothing off-the-shelf would have given you.

This article includes code snippets, but it's more showcase than documentation. You can find full docs, including tutorials, [in the repo](https://github.com/matt-goldman/flagstone-ui).

## A better tab bar

If you do nothing else, you should replace Shell in your app with `FsShell`. Even if you don't need a fancy tab bar or bespoke navigation. Why? Well, take a look at this:

[TODO: insert video here of stock FsShell tab bar]

This may not be particularly sophisticated, and to be honest the stock `FsTabBar` is intended as a reference, but it should still replace the default Shell in your apps/

Notes:

2. Case study one: The default tab bar (300-400 words)
Purpose: Show that even "stock-looking" navigation is better with FsShell. Lowest barrier to entry for the reader.
Beats:

Design intent: tab navigation that feels like a modern mobile app — responsive to touch, motion that signals state changes, layout that breathes.
The obstacle: stock Shell's tab bar is functional but inert. Tab transitions are abrupt. There's no notion of motion or hierarchy in the interaction itself.
What FsShell gives you: animated transitions, layout flexibility, the ability to make the default feel intentional.
Visual: short clip of the default FsShell tab bar in motion. Side-by-side with stock Shell if it strengthens the point.
The takeaway sentence: even if you want the most conventional navigation possible, FsShell makes that conventional thing better.

3. Case study two: Instagrim (400-500 words)
Purpose: Show consumer/social patterns that are common in modern apps and effectively impossible in stock Shell.
Beats:

Design intent: a Halloween-themed photo-sharing app. Needs tab icons that show unread counts (badges). Needs a prominent central action for "capture" (action button). Needs to feel like a social app, not a line-of-business app with a theme.
The obstacle: badges don't exist in stock Shell's tab bar. Floating action buttons inside the tab bar don't exist in stock Shell either. You can fake them with overlays and hacks, but they break under real use — they don't survive theme changes, they don't animate correctly, they don't work cross-platform without per-platform code.
What FsShell gives you: badges as a first-class concept, action buttons as a first-class concept, both composable with the rest of the navigation.
Visual: clip showing the tab bar in action — badges appearing, action button being tapped, capture flow opening.
The takeaway sentence: the patterns every consumer app uses are no longer unreachable in MAUI.

4. Case study three: Beer Driven Devs (500-600 words)
Purpose: Show the upper end of what's possible — fully custom navigation that no off-the-shelf solution could provide.
Beats:

Design intent: a podcast app with a persistent media player. The player needs to live in the navigation chrome (so it stays visible during navigation) and needs to expand into a full-screen now-playing view. Below it, navigation needs to be vertically oriented because the layout suits it better than tabs.
The obstacle: stock Shell doesn't support custom navigation orientations at all. Adding a persistent media player on top of Shell is a fight — Shell wants to own the chrome, and putting anything in the chrome that Shell didn't put there means working against the framework rather than with it.
What FsShell gives you: the navigation chrome as a composable surface, not an opaque control. You can put what you need where you need it, and the navigation logic doesn't fight you.
Visual: clip showing the BDD app — playback continuing across navigation, expanding player view, vertical nav behaviour.
The takeaway sentence: when stock navigation isn't an option, FsShell isn't a workaround. It's the right tool.

5. The throughline (200-300 words)
Purpose: Tie the three case studies together with the bigger point.
Beats:

The three case studies sit on a progression: vanilla-but-better, conventional-but-richer, fully-custom.
Same library, same primitives, three completely different navigation outcomes. That's the point of FsShell — it doesn't push you toward one design. It gets out of the way of whatever design you've already decided on.
The "production-ready" milestone isn't about FsShell becoming feature-complete. It's about FsShell being trustworthy enough that you can build real apps on it without hedging.
(Optional: nod to the broader Flagstone UI ecosystem, since FsShell elevating to production is what unlocks the rest.)

6. Where to go from here (100-150 words)
Purpose: Send the reader somewhere useful without padding.
Beats:

Link to docs for the how-to.
Link to the repo / NuGet.
One or two lines about what's next (without committing to a roadmap you don't want to commit to).
If you're doing a livestream later in July, mention it briefly here as a deeper dive.

