---
title: "PageResolver becomes SmartNavigation"
description: "PageResolver has been fully updated for .NET 10, and has a shiny new name to go along with some new functionality too."
date:   2025-11-08 00:00:01 +1000
image:  /images/posts/smart-navigation.png
tags:   [mobile, maui, ui, di]
categories: [.NET, Mobile, UI, UX, DI]
pin: true
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

For the past couple of years, PageResolver has quietly become one of the most useful pieces of plumbing in the .NET MAUI ecosystem. It takes the ceremony out of navigation, resolves pages and view models through DI, supports Shell and non-Shell apps, and generally reduces the cognitive overhead of building a modern MAUI app.

With .NET 10, it was time to finish something I’ve been putting off for too long: giving the library a proper name, a consistent namespace, and a cleaner foundation for what comes next.

Today, I’m happy to announce the new home of the project:

**Plugin.Maui.SmartNavigation**

NuGet: `Plugin.Maui.SmartNavigation`
Repo: [https://github.com/matt-goldman/Plugin.Maui.SmartNavigation](https://github.com/matt-goldman/Plugin.Maui.SmartNavigation)

## Why the rename?

When I first published PageResolver, .NET MAUI wasn't released yet, the naming guidelines for plugins were unclear (ok, _I_ was unclear about them), and NuGet’s namespace reservation system was still evolving. That’s how we ended up with the package effectively living under `Goldie.MauiPlugins.PageResolver`, even though the actual namespace was `Maui.Plugins.PageResolver`.

SmartNavigation fixes all of that:

* Correct naming aligned with MAUI plugin conventions
* A clean namespace (`Plugin.Maui.SmartNavigation`)
* A package name that reflects what the library actually does
* A fresh repo without the historical namespace baggage

It also positions the library for continued growth without carrying around its pre-MAUI origin story.

## What's new in SmartNavigation?

If you've been using PageResolver 2.x, you’ll feel right at home. SmartNavigation is a drop-in conceptual upgrade with several improvements.

## Unified navigation manager

`INavigationManager` now gives you a single, predictable API surface for:

* Shell routing
* Hierarchical navigation
* Modal navigation
* Automatic behaviour when going back

## Stronger lifecycle support

I've always wished we had something like Blazor's `OnInitializedAsync` and `OnAfterRenderAsync`, and now we do (well at least one of them). For apps that need structured, async initialisation in ViewModels, the `NavigatedInitBehaviour` and `IViewModelLifecycle` pattern has been added to take the guesswork out of where to initialise your ViewModels.

## Cleaner naming and structure

The core API hasn’t changed dramatically, but everything is now surfaced under a consistent, future-proof namespace.

## Source generator is now opt-in

This was a requested change, and was a mistake in the original implementation. The source generator was enabled by default, and I later added an attribute to opt-out. Mow, hf you want automatic DI registration, enable it, and ff you don’t, you don't.

Definitely the way it _should_ be.

## Best Practices patterns

As the community has grown, so have the architectural patterns. Strongly typed routes, modular navigation, and clean-MVVM setups will now be documented properly in the wiki rather than scattered across GitHub issues and replies.

I've also got some opinionated templates in the works that I intend to release in the next few weeks.

## What about the old PageResolver repo?

It has been archived and will remain available indefinitely.

If you’re using PageResolver today, your app won’t suddenly break, but all new work will happen in SmartNavigation.

The migration is straightforward:

```xml
<!-- Old -->
<PackageReference Include="Goldie.MauiPlugins.PageResolver" Version="2.x" />

<!-- New -->
<PackageReference Include="Plugin.Maui.SmartNavigation" Version="3.0" />
```

Namespaces change accordingly.
There are no behavioural differences unless you're using the source generator.

A full migration guide is in the README.

## Why "SmartNavigation"?

Two reasons.

First, it’s discoverable. Nobody goes looking for “resolvers” when they want help with navigation.

Second, the library has grown far beyond simply resolving pages. Today it provides:

* Navigation
* Lifecycle behaviour
* Parameter binding
* Dependency injection
* Modal support
* Type-safe routing
* Extensibility points for Shell, MVU, Mopups, and anything else you throw at it

I felt it needed a name that reflected its job, not its original proof-of-concept.

## Availability & Release Schedule

SmartNavigation 3.0.0-rc.1 is available today on NuGet for anyone who wants to start testing the new package, namespaces, behaviours, and migration steps in their existing MAUI projects. I’d love feedback over the coming week so the launch version is as solid as possible.

The final release, `Plugin.Maui.SmartNavigation 3.0.0`, will go live on Friday, alongside the official .NET 10 release. This is the earliest point I can ship it without preview dependencies, and it will be the formal successor to PageResolver 2.x under the new name and namespace.

If you'd like your app to be ready for .NET 10 from day one, the RC is stable enough to drop into a branch and test with immediately.

## What's next?

Now that the rename is complete and the structure is clean, I can finally move on from the administrative debt and focus on features.

Coming soon:

* A brand new example project
* Opinionated project templates
* Documentation on modular routing
* Updated video walkthrough
* Additional behaviours (maybe)
* More best practices patterns

## Thank you

What started as an experiment in seeing whether .NET MAUI navigation could be work the way _I_ thought it should has become something people build real apps with.

Thanks to everyone who has used the library, filed issues, contributed fixes, or quietly built projects on top of it.

SmartNavigation represents the next stage of its life, and I’m excited to build on a cleaner foundation with a proper name.

If you’d like to jump in, the new repo is open and ready.

_Happy navigating!_