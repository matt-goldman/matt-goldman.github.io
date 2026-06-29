---
description: "."
title:  "Flagstone UI goes GA with FsShell"
date:   2026-07-01 00:00:01 +1000
image:  /images/posts/where-ai-goes-next.png
tags:   [mobile, maui, ui]
categories: [.NET, Mobile]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

Microsoft Shell is the navigation framework that ships with MAUI, and it does a lot well. Routing, deep linking, navigation state, lifecycle — the infrastructure underneath Shell is solid. If you've built a MAUI app with conventional navigation, you've probably had a fine time with it.

Right up until you wanted the navigation to look like something Shell hadn't anticipated.

The problem with Shell isn't that it's opinionated about presentation. Plenty of frameworks are opinionated and that's fine — you work within the opinions, you ship the app. The problem with Shell is that the opinions and the infrastructure are the same code. The tab bar isn't a presentation layer sitting on top of Shell's navigation system; it is Shell's navigation system, as far as your app is concerned. There's no seam between them. You can't take the routing without also taking the chrome. You can't customise the chrome without fighting the routing.

This is why every MAUI app that needs a non-default-shaped nav ends up in the same place: hacks layered on Shell until something breaks, or Shell abandoned entirely in favour of building navigation from scratch. Neither is a good answer. The first is fragile. The second throws away infrastructure that took Microsoft years to build.

FsShell is the missing seam. It separates the navigation system from the navigation presentation — so you get Shell-grade routing, state, and lifecycle, and you get to decide what the chrome actually looks like. The two aren't fused. They're composed.

FsShell just hit production-ready. This post is three apps that show what that means in practice — one that uses FsShell to make the conventional better, one that uses it to reach patterns Shell can't, and one that uses it to build navigation that nothing off-the-shelf would have given you. Same library, same primitives, three completely different navigation outcomes. That's the point.

(The docs cover the how. This post is about the what-for.)

---
Notes:
FsShell: Production-ready navigation for MAUI
1. Opening (200-300 words)
Purpose: Hook the reader on the problem, establish that FsShell exists to solve it, signal the post's structure.
Beats:

Shell is Microsoft's opinion about navigation, and it's a strong one. Flyout or tabs. Limited customisation. The rest is off-limits.
This is fine until you want a navigation shape Shell didn't anticipate. Then you're either fighting Shell or rebuilding from scratch.
FsShell is the missing middle: a navigation framework that gives you Shell's structure and conventions without Shell's ceiling.
It just hit production-ready. This post is three apps that show what that means in practice.
(Brief acknowledgment: docs exist for the how; this post is about the what for.)

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

