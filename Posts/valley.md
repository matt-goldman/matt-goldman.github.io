---
description: "The more I think about it, the more I've been circling the same idea. And the more I understand it, the more I realise the best thing I can do is try and solve the core problem myself."
title:  "I probably shouldn't create my own programming language..."
date:   2026-03-09 00:00:01 +1000
image:  /images/posts/valley.png
tags:   [architecture, productivity, security, programming, culture]
categories: [Architecture]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

I've been saying the same thing for years, in different contexts, about different problems.

[In my most recent post](/posts/ui-messaging/), I said it about messaging in UI applications: messaging shifts correctness from the compiler to human discipline, and that's a trade-off we should be very cautious about.

[I've said it about JavaScript](/posts/its-time-javascript/): the npm ecosystem cannot be secured, not because developers are careless, but because the architecture makes enforcement impossible. Governance isn't failing there, it simply cannot exist.

I said it about my blog when I got fed up with Jekyll and built [Blake](https://github.com/matt-goldman/blake): I didn't want a smarter workflow or better habits, I wanted a tool that couldn't be wrong by default.

[I've even said it about meetings](/first-things-first/): protect your cognitive budget, because overhead that shouldn't exist is stealing from work that matters.

Different domains. Same sentence, every time: **correctness should be structural, not disciplinary.**

As I said, I've been thinking about this for years. I even drafted a blog post recently about structuring modules, but I ultimately scrapped it because I realised it doesn't operate where the root of the problem is.

## The Discipline Tax

Here's the honest version of where this is coming from.

I'm _tired_.

Not burnt out, or disillusioned. Just tired. Tired of spending cognitive budget on things that shouldn't cost anything, and tired of having to do so. Over. And over. Again.

[Keith Code](https://en.wikipedia.org/wiki/Keith_Code), the champion motorcyclist, coach, and founder of [California Superbike School](https://superbikeschool.com/) talks in his seminal work [A Twist of the Wrist](https://www.goodreads.com/book/show/570478.A_Twist_of_the_Wrist) about an attention budget. You have ten dollars to get you through a corner. If you're spending eight of them thinking about braking, you've only got two left for your line, your throttle, the gravel on the exit, the oncoming driver who picked that moment to switch Spotify playlists. The solution isn't to become a better braker under pressure. The solution is to make braking automatic, so you can spend those eight dollars on the things that actually require judgment.

I'm a solution architect. My cognitive budget should be spent on the hard, interesting, valuable problems: domain design, system boundaries, the tradeoffs that actually shape what gets built. And "valuable" here is important, because it's not about what's valuable to _me_, it's about what's a valuable use of my time for the people _paying_.

Instead I find myself spending it on null checks, and making sure the architectural conventions haven't drifted since last sprint. I spend it on code review comments that shouldn't be needed; mine and other peoples'. I spend it maintaining patterns that require discipline, which means they require discipline to maintain correctly across every developer, every day, under every deadline, forever.

That's tax. It's not architecture, and it's not product. It's tax. Except it isn't, because like it or hate it, taxes (in principle, at least) go toward the public good. This just disappears into entropy.

And the thing about tax is, it compounds. Every dollar of cognitive budget spent on correctness ceremony is a dollar not spent on the problem that actually matters. Over a career, over a codebase, over a team, it adds up to an enormous amount of value that was never created because everyone was busy doing the thing the language or the tooling or the framework should have been doing for them.

I've been arguing for years that .NET should take the Python philosophy more seriously. In Python circles, "that's clever" is an insult. Simplicity is the goal. Readability is a form of correctness. The language and the culture around it push you toward the clear thing, not the impressive thing. That's what C# was supposed to be, and I still want that for C#. I love C#. I've just always wished it was a bit less willing to hand me a loaded gun.

[TODO: consider adapted "You were supposed to destroy the Sith, not join them!" meme here]

## What I'm Thinking About

I've been circline various ideas about how to fix this for years. A few posts here touch on these, and Liam and I discuss this on the podcast more often than probably any other topic. But I had a realisation recently, resulting from a few converged events, some of which I'll describe below, and one which I won't, but for completeness, was sparked by a comment an episode of [The Modern .NET Show](https://dotnetcore.show/).

I've realised that the problem is the language. Not that the language is _wrong_, but that if the problems are systemic, and build into the language itself, then any tooling or automation that I can build around it is still papering over the cracks. That's by definition a workaround, and not a solution.

Fixing it, _properly_, requires removing the unsafe features from the language, but C# can never do that; part of its charter includes a commitment to backward compatibility that is honourable, permanent, and means that every decision ever made is load-bearing forever. That's definitely a strength, but it's also the thing that's holding it back.

Perhaps one frustrating thing is that we know from comments made by various maintainers and architects of the C# language over the years that there are things they've included that they have later come to regret. And as I mentioned above, we are now all stuck with these things. They can't remove them; but the _community_ could. That's what I've been thinking about.

I've been provisionally calling it _Valley_.

It's not a new language. It's C#, but with the regretted parts removed, and one meaningful addition.  

Valley is the question: the things we wish were never added to C# are there forever, but what if they didn't have to be?

## The Philosophy

The philosophy is two principles.

**Move as many runtime errors to build time as possible.** A runtime error is a problem that hides. It compiles, passes review, works in development, and surfaces in production at 2am. A build-time error cannot hide. The compiler finds it. The developer fixes it. The user never sees it.

**If it requires discipline, it is broken.** Discipline is fragile. It depends on individuals, on culture, on who reviewed this PR and whether they were having a good day. Any system that relies on developers remembering to do the right thing will eventually meet a developer who forgets. Valley doesn't ask for better discipline. It encodes the constraint.

From those two principles, a lot follows. Null doesn't exist in Valley: absence is a typed value, explicit and compiler-enforced. You handle it or you don't compile. Reflection is gone, because it defers type resolution to runtime, which is the thing Valley exists to prevent. `dynamic` is gone. Unsafe blocks are gone.

Valley's ultimate ambition is the removal of `try/catch` entirely.

Don't reach for the pitchforks just yet. I know that's a bold and controversial assertion, but hear me out.

If we're doing things right, we don't need it. I've thought about other approaches, like replacing it with `Result` types. That's actually a better approach than exceptions for control flow, but it's mechanism built on the same wrong mental model, the idea that failure is a special case to be caught rather than an outcome to be modelled.

Valley's position is more radical: **the compiler does not accept failure as an option**.

[TODO: Dr Evil meme "This compiler does not tolerate failure]

A function that compiles has accounted for every state it can encounter. There is no failure. There are only outcomes. This is not fully designed yet - the honest answer is that complete outcome modelling is an open problem, particularly around what a catch-all case is permitted to do - but it's the direction, and every other decision needs to be compatible with eventually getting there (and more importantly not contra to it).

The one addition is first-class Modules and Blueprints. C# has namespaces, which are labels, and assemblies, which are deployment units. Nothing in between. Valley's Modules are bounded contexts that actually enforce their own boundaries. Blueprints are to modules what interfaces are to classes: structural contracts that the compiler verifies. Some teams enforce this today through architecture tests in CI/CD pipelines. Those are valuable, but they are also discipline by another name. Someone has to write them, maintain them, run them, act on them. In Valley, the same guarantees are compilation failures. The architecture isn't tested. It is the type system.

A C# developer can write Valley immediately. They'll notice what they can't reach for. The compiler will tell them what to do instead. The transition isn't a paradigm shift. It's a constraint, and constraints that remove danger are liberating rather than limiting. That's what Blake taught me, actually. Boring is a feature. "Doesn't let you do the wrong thing" is a killer feature.

## One More Thing, And It's Bigger Than I Expected

There's something else worth mentioning here, and it's something I've been thinking about for a while too. I've mentioned several times that I've been interested in Python for a long time (actually because I had a few IoT projects I wanted to do), but recently I got curious about how Python became the de facto standard language of the AI world; both the tooling and the models themselves. It turns out the two things are connected in an interesting way.

LLMs are exceptionally good at Python partly because the language's clarity and consistency made it excellent training material, not just excellent code. Simple, readable, unambiguous: the same properties that make it good for humans make it good for models learning from human-generated code. I've been saying for years that .NET should adopt the Python philosophy. It turns out the argument is even stronger than I realised, because the same feedback loop exists in the other direction.

This week the latest Qwen3.5 family of models released, and I've been watching a few videos of people runnig variants through different coding tests. Generally, they does quite well, but when they fail, they _fail_, and can't seem to recover. When the user highlights an issue, the model either hallucinates a solution or denies the problem exists at all.

Because a language should _enforce_ correctness. Discovery of these errors shouldn't be down to the human; the human should be requesting tweaks, not fixing straight up broken code.

These aren't model quality failures. They're training data failures. Human developers have been writing code with null references and swallowed exceptions for decades. That code compiled. It shipped. It's on GitHub. It's in the training corpus. The models aren't hallucinating these patterns, they're reproducing them faithfully from the best available source, which was already compromised. And there's nothing stopping them.

And the vibe coding ecosystem has standardised almost entirely on JavaScript and React. Of all the possible choices. The language I've been writing about for years as structurally impossible to secure, in an ecosystem that cannot be governed. That's what we're generating at scale, reviewing minimally, and feeding back into the corpus.

Now those models are generating more of the same patterns, faster than humans can review them, and that generated code is becoming training data for the next generation. Entropy only increases; there must be an injection of energy to correct this.

A compiler that refuses to accept null, that won't compile unhandled outcomes, that makes architectural violations build errors — that's a circuit breaker. Code that doesn't compile doesn't ship. Code that doesn't ship doesn't become training data. The constraint propagates backward through the loop. And guardrails - not aspirational ones, structural ones - are there the whole way to ensure gravity keeps everything in the valley (not pit) of success.

I didn't start thinking about Valley as an answer to the LLM training data problem, I thought about it because I'm tired of paying the discipline tax. But it turns out the same thing that drains my cognitive budget is also, at scale, degrading the models we're all starting to rely on. That felt worth a mention.

## Where This Goes

I haven't actually built Valley, it's just a thought experiment at the momeent. But I have thought about it a fair bit, and have some concrete ideas about how I might go about building it. I've put together some artifacts, like a pholosophy document, a working minimum viable list of what would get removed from C#, and some practical implementation ideas. And don't get me wrong, I have also thought (a lot) aboout F#, which also solves several of these problems. I've thought about how it would interoperate with the CLR and BCL, and what the challenges would be. I've even started thinking about how I would address some of those. I've thought about how, strategically and semantically, it could appropriate OOP principles and _inherit_ the C# language specification, overriding the parts it needs to and adding the bits that are missing.

But I haven't built it.

I would actually love to, but I've got too many high priority projects at the moment. So I thought I might test the waters first.

Is this something you would be interested in? If so, using, or helping to build? Have I got it all completely wrong?

I feel that correctness should be structural, not disciplinary. I've been saying it for years. I'm tired of just saying it. If you feel that too, and if you're also tired (probably of me harping on about it more than anything else), maybe Valley is what you're looking for too.