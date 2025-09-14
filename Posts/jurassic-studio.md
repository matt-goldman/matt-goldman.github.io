---
description: "Visual Studio is getting its first major update in four years - but it's still anchored to the past."
title: "Visual Studio’s Future: It’s Time to Move Beyond .NET Framework"
date: 2025-09-14 00:00:01 +1000
image: /images/posts/jurassic-studio.png
tags: [.NET, dotnet, Visual Studio, Modernisation]
categories: [.NET]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

## Introduction

With the announcement of the new insiders build of Visual Studio 2026, I’ve been thinking a lot recently about a big question that's been bugging me for years: why is there _still_ no macOS version?

Of course, I know the answer - it's because the shell is still running .NET Framework. It's built in WPF and tied to Windows - while much of the "guts" of the project have been modernised, _this_ part remains on .NET Framework, and is likeley the thing that, even 10 years on from .NET Core, is keeping .NET Framework on life support.

The question is, why?

As it happens, I saw a post on LinkedIn this morning (which in turns shared a screenshot of a tweet) about this very question, and I started to write a comment. But, the comment turned into a long rant, and at that point I figured it probably deserved its own blog post.

Obviously there are much smarter people than me working on this, as well as reams of background and inside information that I have no clue about. But, as a fun thought experiment, here's what I would do, if I were running this show.

## Context - what's the problem exactly?

The main thing holding Visual Studio back is the extension ecosystem. The IDE hosts decades of code and, more importantly, an enormous extension ecosystem. Thousands of extensions, from Microsoft’s own tooling to third-party add-ons, run in-process with the IDE. They rely on COM services, synchronous APIs, and UI thread affinity that only exist in the .NET Framework-based shell.

Moving the shell to modern .NET would break almost all of them. A wholesale rewrite would detonate the ecosystem, which is why Microsoft has focused on an out-of-proc extensibility model instead. That model runs on modern .NET but doesn’t yet cover every scenario. Until extension authors port their work (and until Microsoft closes the gaps) the IDE shell stays stuck on Framework.

This explains why the shell hasn’t moved. But it doesn’t mean it should stay that way forever.

## Set a Date

If I were running it, I’d have announced a 5-year end-of-life for the .NET Framework VS shell. And I've have done it _at least_ five years ago. 

Don't go running for the pitchforks just yet! I'll come back to this.

## A Migration Tool is a Key Enabler

Understandably, the question of how to move thousands of extensions forward without burning everything down is not one that can be considered lightly, but one thing that _could_ help is a migration tool.

It wouldn’t solve every problem, but it could do a lot, e.g.:

* Analyse extensions and flag Framework-only APIs or UI-thread assumptions
* Scaffold a new out-of-proc extension project on modern .NET
* Provide shims and stubs for common patterns like tool windows, services, and MEF parts
* Generate reports with effort estimates, blockers, and checklists

Granted, this isn’t a silver bullet, but it's not about waving a magic wand, it’s about lowering the barrier so extension authors have a realistic path forward.

## Microsoft’s Role

With the right tooling in place, Microsoft could make the transition achievable:

* Publish an official compatibility matrix and sample extensions
* Ship Analyzers and automated code-fixes to handle the common cases
* Provide a brokered UI toolkit for building tool windows without depending on in-proc WPF/WinForms
* Announce staged deprecations tied to specific VS versions, so everyone has a clear roadmap

This combination of carrots and clear deadlines would send a strong signal that the future of Visual Studio is modern .NET.

## Compatibility Options

Perhaps something that could speed things along is a limited compatibility shim; a proxy host that runs legacy extensions out-of-proc with a restricted surface, plus telemetry and performance warnings.

Honestly, though, I don't know if this is even feasible. If it were trivial, it would certainly exist already. But even a partial shim for the most common patterns could smooth the transition for the ecosystem.

Again, I'm not sure how feasible this is, but it's something I would want on the table, and at least invest a spike or two into.

## The Elephant in the Room: The Blast Radius

It's not just Visual Studio extensions, but tools built on top of it that would be impacted. 

No doubt there are teams out there who depend on extensions - and not just extensions, or other tools built on top of Visual Studio - that may never be upgraded. Sometimes (often?) even running critical business processes. I know this represents a serious problem for them; but, to be honest, _good!_

Yes, the blast radius would be huge. But let’s be honest: five years is an _eon_ in software modernisation. The longer Microsoft avoids putting a date on it, the harder the transition will be. And the more painful it gets.

Here’s the thing - it's not a technology problem, it's a business problem, and it's one you _should_ be losing sleep over. If you're one of those teams, desperate to modernise but held back by "if it ain't broke, don't fix it" purse-string holders or industry dinosaurs, go full Chicken Little. Tell your CFO you need funding to make your whole infrastructure not terrifying.

Because depending on unsupported tools, frankly, _is_ teerrifying. And it’s leadership who should lose sleep over it, not engineers.

## Legacy Isn’t Going Anywhere

Look, I get it. No matter what, there's going to be legacy stuff that will never get upgraded. And even in a modernisation project, it still needs to be supported, some of it for a long time, while you filter out onto your newer platform.

But moving Visual Studio forward doesn’t mean ripping away support overnight. Nobody is forcing you to uninstall older versions of Visual Studio (well, maybe your CISO, but if that's the case they'll likely support this move).

Legacy workloads could stay on old versions of Visual Studio, but new workloads would move to a shell built on modern .NET.

That’s how the ecosystem evolves without leaving anyone completely stranded.

## Closing

It's time to rip the band-aid off.

I know MSDN isn't the cashcow it once was, but even so, Visual Studio is stuck in the past while VS Code and Rider are eating its lunch.

Set the date, ship the tooling, and let the ecosystem move.

Who'd have thought: centuries from now, when aliens start digging through the post-apocalyptic rubble, that the two surviving relics they'd find from the Anthropecene would be - Nokia phones, and .NET Framework Visual Studio 🤦
