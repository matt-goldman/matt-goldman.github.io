---
title: "Messaging Is a UI Code Smell"
description: "'Decoupled' messaging systems in UI applications are unsafe. There are better alternatives, and I've yet to see a use case that couldn't be solved with them."
date:   2026-02-08 00:00:01 +1000
image:  /images/posts/ui-messaging.png
tags:   [mobile, maui, ui, code-smell, mvvm, messaging]
categories: [Architecture]
pin: true
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---


I gave a talk at MAUIDay recently called *Opinionated by Necessity*, where I shared some lessons around building enterprise apps that scale; not in terms of concurrent users (that's largely a solved problem, and an easy one to band-aid with a SKU bump), but in terms of *teams*.

I define apps that scale not as:

> Systems that don't fall over under load from millions of users

but:

> Systems that don't fall over when the person who wrote the code is no longer around

Never have I seen this better articulated than when Jimmy Bogard said:

> Consistency >>>>>> your opinion

This is a whole other topic in itself, but generally, I hold very strong opinions that your app should have an opinionated architecture and very loose opinions about what that architecture should be. I'll cover this more in another post.

However, one idea in particular drew a lot of curiosity afterwards:

**Messaging in a UI application is a code smell.**

Not an anti-pattern per se, and certainly not a catastrophic bug. But it's a red flag, and should be something you reach for as a last resort, under very specific circumstances, with a well-reasoned justification, rather than a default. Especially when safer, more explicit alternatives exist.

## What I mean by “messaging”

When I say *messaging*, I'm talking about a global or ambient publish/subscribe mechanism inside a UI application. Typically something where:

* Publishers emit messages identified by a type, key, or string
* Subscribers register interest in those messages via a central broker
* Publishers and subscribers have no direct reference to each other

Examples include in-process message buses, messengers, or event aggregators commonly used in MVVM frameworks.

I am *not* talking about:

* Events exposed by a specific object
* Observables tied to a concrete source
* Explicit callbacks or continuations

Those are subscriptions to a *publisher*. Messaging is subscription to a *system*.

That distinction is key here. I am absolutely not opposed to subscriptions; in fact, I’d probably go so far as to say they’re essential in modern UI applications, especially for micro‑interactions.

It’s *decoupled, ambient messaging* in a UI that gives me the heebee-jeebees. 

## Let’s be clear about what I am not saying

I am not saying messaging is “bad”, or that nobody should ever use it. I am not saying your app is broken if it contains a message bus.

What I *am* saying is that messaging shifts correctness from the compiler to human discipline. And that is a trade‑off we should be very cautious about in UI code, where issues that are hard to trace and slow to fix can emerge in the wild. Remember that no UI survives first contact with the users; anything that provides compile-time guard rails *for free* is always a first choice for me.

Let's take a look at why I find this pattern so problematic.

## Messaging removes architectural gravity

In a typical MVVM‑style UI, there is a natural flow:

* Models publish facts about the world
* ViewModels coordinate behaviour and state
* Views observe and respond to state

This isn't breaking news, but it's important grounding for one of the risk vectors that messaging introduces to your apps.

Messaging neither directly undermines nor enforces this flow, but it is less aligned with it than other approaches.  

Once you introduce a global publish/subscribe mechanism, everything becomes equally reachable. Any layer can talk to any other layer, at any time, for any reason. The architecture stops pushing you back toward the correct shape.

Yes, you can impose rules. I do. My rule is simple:

* All publishers live in the Model layer
* All subscribers live in the ViewModel layer
* No exceptions

But notice what’s doing the work there. It’s not the tooling, it’s discipline. And discipline does not scale as well as structure.

I recognise that this is not a showstopper argument, and that's fine. I'll state my stronger case next, but in my view, any pattern that doesn't either mechanically enforce, or (at least) culturally encourage good architectural discipline is dangerous.

## UI systems are deterministic. Messaging is not.

This is the most important point, and the one that seemed to resonate most with the audience.

In distributed systems, messaging makes sense. Producers and consumers are non‑deterministic. A message may or may not be sent. A consumer may or may not be listening. That uncertainty is part of the model.

A UI is different.

If a ViewModel depends on something happening, that dependency is not optional. It is required for correctness. Treating it as best‑effort is a category error.

Here is a very mundane failure mode:

* You have a subscriber listening for a message
* Someone deletes or refactors the publisher
* The app still builds
* Nothing tells you the behaviour is now broken

You will find out at runtime (or, what actually happens, which is worse, a user will).

Subscribing to a *system* makes sense when producers (and consumers, but that's a different scenario) are optional. Subscribing to a *publisher* is required when producers are essential.

Events and observables encode that relationship explicitly. Messaging opts out of it entirely.

## Messaging destroys ownership

With messaging, there is nothing stopping anyone else from publishing the same message.

Once the message becomes the unit of coordination instead of the publisher, authority disappears. Behaviour can now be triggered by whoever feels like emitting, from wherever they happen to be.

In a UI, that is not decoupling. That is abdication, and it actively erodes cohesion.

With an event or an observable, behaviour flows from a known source. You can point to the owner. You can reason about when and why it fires. And, critically, you *can't* undermine, override, or work around it.

With messaging, you get emergent behaviour. The hardest kind of bug to diagnose, and the easiest kind to introduce.

## “But it works fine for us”

I believe you.

Most of the time, it works because experienced developers are compensating for the abstraction. You know, implicitly, where messages *should* come from. You follow conventions. You're careful.

That does not make the system safe. It just means the safety lives in people’s heads.

The real test is not whether something works today. It’s whether it fails loudly when someone makes a mistake tomorrow. And to be clear, loud failure is what you want. When things fail loudly, they tell you they are broken and demand to be fixed.

Messaging fails quietly.

## So what’s the actual position?

Messaging in a UI is not forbidden, it's simply too powerful for how little structure it provides.

If you choose to use it, you should be able to answer, clearly:

* Who owns this behaviour?
* What guarantees that exactly one thing publishes this?
* What breaks if the publisher disappears?
* Why can’t this be modelled as an explicit dependency?

If you cannot answer those questions, the abstraction is doing more harm than good.

And if you *can* answer them, you'll likely find you don't need messaging at all.

That’s why I call it a code smell, because it's not objectively or universally wrong.

But it _is_ unsafe by default.

Fire isn’t "wrong" either. It’s the bedrock of human civilisation. We need it, and we use it. But we don’t light a fire wherever we happen to be whenever we feel cold. *Especially* not now, when we have warm clothing and controlled heating appliances.

Messaging should be treated the same way.

If there isn’t a better alternative for your use case, then your use case is the exception. If you *have* to use it, and you've exhausted other (better) options, that's fine. Just don't get burned.
