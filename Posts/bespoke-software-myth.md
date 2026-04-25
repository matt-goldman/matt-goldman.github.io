---
title:  "The Bespoke Software Myth"
description: "Small businesses are often told bespoke software is expensive and risky. In many cases, the opposite is true: the risk is often higher when you rent your core capability from someone else."
date:   2026-04-24 00:00:01 +1000
image:  /images/posts/bespoke-software-myth.png
tags:   [management, leadership, architecture, business]
categories: [Management]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

[Liam Elliott](https://www.linkedin.com/in/liamelliott/), my friend and Beer Driven Devs co-host, recently posted something on LinkedIn that's bothered both of us for years: the way small businesses are told that custom software is a big company luxury, with off-the-shelf platforms positioned as the safe, responsible default.

He's right that the framing is wrong, and I'd go one step further.

For many SMBs, the risk is inverted. And the SMBs aren't the only ones being misled they're just at the sharp end of it. Mid-market and enterprise organisations get sold a different version of the same story: not "you can't afford bespoke", but "you shouldn't go bespoke, that's reinventing the wheel". Both narratives push toward the same conclusion, both ignore the question that actually matters, and the underlying mechanism that makes the standard advice wrong applies regardless of company size; it's just that SMBs have the least leverage to push back when the sales motion arrives.

The prevailing narrative says bespoke software is the risky, expensive option, while buying an off-the-shelf platform (especially a full ERP) is the safe, responsible one. In practice, that's often backwards, and the inversion gets lost in the sales pitch, because the sales pitch is built around it.

## Core vs commodity is the question that matters

Before anything else, the real question is this: which capabilities are strategic and differentiating for this business, and which are commodity?

This isn't a new framing. [Joel Spolsky put it cleanly back in 2001](https://www.joelonsoftware.com/2001/10/14/in-defense-of-not-invented-here-syndrome/): _"If it's a core business function — do it yourself, no matter what."_ Outsource the cafeteria. Outsource CD-ROM duplication. Don't outsource the thing you actually do.

Email is a good example of commodity. It's critical, but for most companies it's not differentiating. You don't run your own mail server unless email infrastructure is your business.

Payroll is similar. Most businesses depend on it, but very few should build and maintain their own payroll engine.

The same logic applies outside software. An accounting firm usually doesn't outsource accounting, but it may outsource HR or facilities. A law firm doesn't outsource legal advice, but may outsource IT support or cleaning. A hairdressing franchise might outsource cleaning, but not haircuts.

Software decisions should mirror that reality:

* Should you rebuild Excel? Obviously not.
* Should you build bespoke software for your proprietary auditing or reconciliation workflow? Maybe.
* Should you use off-the-shelf case management? If it supports your process well, yes.
* Should you contort a proprietary process until your edge disappears just to fit a product? No.

That's the most important distinction, and the only one that really matters.

## The ERP playbook was built for a different game

A lot of this post talks about ERP, and I want to be honest about why: ERP established the model for enterprise software. The playbook the rest of the industry runs - vendor-led process mapping, "best practice" reference architectures, multi-year implementations, deep platform dependency - all of it traces back to how big ERP rolled out from the 80s and 90s onwards. Even when you're not buying ERP, the COTS (commercial off-the-shelf software) sales motion you're being subjected to was shaped by it.

Don't believe me? Look at the language. Bills of materials, work orders, routings, MRP runs, inventory turns, lead times, capacity planning, resource levelling. This is manufacturing vocabulary, and it's everywhere: in CRMs, in project management tools, in HR systems, in software sold to consultancies and law firms and creative agencies that have never produced a physical thing in their lives. The terminology is so embedded in how we talk about enterprise software that we've stopped noticing it's there. But it tells you exactly where the model came from and what it was originally built for.

And that's something worth noticing: what that playbook was originally built _for_. ERP grew up in manufacturing, and in manufacturing, process standardisation across the back office is usually fine, because the differentiator sits somewhere else — the product, the formulation, the design, the brand, the supply chain, the plant itself. Two pharmaceutical companies running the same ERP still compete on the molecules, two automotive OEMs still compete on the vehicles. The barriers to competition in manufacturing are physical and capital-intensive: you need plant, you need inventory, you need scale. Standardising the office processes that surround all of that doesn't usually erode what makes the business win, because what makes the business win is mostly upstream.

In knowledge work, this is not true. The process _is_ the business.

A consulting engagement, a legal opinion, an architecture review, a research report, a piece of software; these are processes that produce documents, but the value is overwhelmingly in the process, not the document. The document is a residue. If your process is identical to your competitor's, your output is functionally identical too, notwithstanding brand and individual talent. There is no upstream artefact, no plant, no patent on the molecule. The way you do the work _is_ what you sell.

This means the COTS-driven process homogenisation that's mostly harmless in manufacturing is directly value-destroying in knowledge work. You're not standardising the back office while preserving the differentiator, you're standardising the differentiator itself. And because the harm is invisible (you can't see the deals you didn't win against the competitor running the same platform with the same default workflow) it's almost impossible to attribute the loss to the cause.

Worth noting: this distinction is dissolving even in manufacturing as fabrication itself becomes a commodity service, pushing more traditionally industrial businesses toward the same "process and brand are the differentiator" pattern. The trend is in one direction, and it's not toward the world the ERP playbook was designed for.

## The risk inversion the sales pitch needs you to miss

When people compare bespoke vs COTS, they usually compare only one number: build cost.

But that's not the real equation.

The real equation is:

* Upfront and ongoing cost
* Implementation and change-management cost
* Fit-to-process cost
* Opportunity cost
* Vendor dependency risk

A COTS platform often looks cheaper at the point of purchase, then gets expensive in all the places that don't appear on the first quote.

I've seen this more times than I can count. The software licence is just the ticket price, but the ride includes consultants, customisation, retraining teams around the product's assumptions, and the long tail of workarounds for things your business does that the platform doesn't value.

There's a specific mechanism worth naming, because it's the most common source of frustration I've seen in COTS implementations: the capability-vs-bundled gap. The sales pitch tells you everything the product can do and how it solves all your problems. You do your diligence. You ask all the right questions: _"can it do this?"_, _"does it meet that requirement?"_. You get told, with certainty and confidence, that yes, it's a perfect fit for your RFP. Then you sign the contract, and after the ink dries the truth comes out. Oh, yes, it has that feature, but that's an add-on, not standard, and it bumps the price by 25%. Oh, _that_ requirement, well, it does _this_ which is close enough.

This is a sales-motion problem, not a delivery problem, which is why bespoke doesn't have an equivalent. There's no spec sheet to oversell against, no add-on tier to retroactively unbundle features into, no "yes it does that, but…" reveal after the contract is signed. Bespoke can fail in plenty of other ways, but not this way.

If you're evaluating COTS, get it in writing: confirmation of exactly how the solution addresses each of your requirements, at the cost specified. If a vendor won't put their RFP answers in the contract, that tells you something.

This is, again, particularly prominent in ERP implementations, but it's not a niche concern; the ERP world is just where it's been measured most thoroughly. [Panorama Consulting's 2025 ERP Report](https://www.panorama-consulting.com/resource-center/erp-report/), based on independent surveys of recent implementations, consistently finds that a substantial proportion of ERP projects exceed budget, run over schedule, or fail to deliver expected benefits. Industry estimates of ERP implementation failure rates (projects that fail to meet their original objectives) commonly land in the 55–75% range. So when someone tells you bespoke is the risky option, ask them what their reference class for "safe" actually looks like.

## "Best practice" is often just someone else's compromise

One of the most common sales narratives is that you should change your business process to match the product because that's "industry best practice".

I once heard someone joke that SAP stands for "Should've Altered Processes". I can't verify where that came from, but the point behind it is real.

One SAP implementation I was involved in was preceded by months of business process mapping; not because, as we assumed, that would enable them to tailor the solution to our business, but rather it enabled them to instruct us on how to adapt our business to the new product.

That's insane.

In fairness, sometimes many businesses _do_ have messy processes that should be simplified. But often "best practice" is just "what this product can do without expensive custom work".

Those are not the same thing.

## How unique businesses become commoditised

If a process is genuinely part of your competitive edge, flattening it into the same shape as everyone else is self-sabotage.

This is the mechanism by which differentiated businesses become commoditised, and it's worth being explicit about. You start with a real edge, some way of doing the work that's faster, cleaner, more thoughtful, or more aligned to a particular kind of customer than the competition. You adopt a platform that doesn't model your edge, because the platform was built for the median customer in your category. You bend your process to fit the platform. Six months later, your process looks like everyone else's, because you're all running the same software with the same defaults.

The platform didn't steal your edge; you handed it over in exchange for a smoother implementation.

This is fine if your edge wasn't real to begin with, or if it was in something other than the process the platform replaced. But if you adopted a platform _because_ it would let you do what you do at scale, and the price of that scale is that you now do what everyone else does, you should at least be honest about the trade.

## You do not need an internal dev team to own custom software

Another myth that refuses to die: "If you get custom software, you'll need developers forever."

No, you won't. Not as a prerequisite.

What you do need is ownership.

If you're paying for bespoke software, you own the code, deployment assets, documentation, and credentials.

:::note
For bespoke delivery, if a developer won't give you ownership of what you paid them to build, find another developer.
:::

In COTS, you don't get that ownership. That's the model. You get access to the product, not ownership of the internals.

That's exactly why COTS can be fine for commodity capability, but risky for core capability.

With ownership, your risk profile changes dramatically:

* If one supplier disappears, another can take over.
* Your roadmap remains your roadmap.
* Changes are negotiated on your terms, not bundled into someone else's product strategy.

With COTS, you can absolutely get value, but you are renting strategic control. That can be fine for commodity functions, but it's dangerous for core capability.

And renting is exactly the right mental model. If the landlord changes the rules, or decides your category is no longer welcome, you're suddenly exposed to decisions you don't control.

## Vendor lock-in is still lock-in, even in the cloud era

We've become very good at pretending lock-in doesn't exist anymore because everything is "as-a-service".

But switching costs are still real, and they are often massive. Data migration, retraining, re-integration, contract constraints, process redesign, and productivity dips during transition all add up quickly. [Peer-reviewed research on cloud and SaaS migration](https://link.springer.com/article/10.1186/s13677-016-0054-z) makes the point bluntly: the complexity and cost of switching providers is consistently under-appreciated until you're in the middle of trying to do it.

Lock-in risk is not just technical, it's commercial and operational.

And for SMBs, where cash and runway are tighter, these costs bite harder.

A concrete example: in June 2025, Etsy [updated its Creativity Standards without prior notice](https://www.cindylouwho2.com/blog/2025/6/16/), narrowing what could be sold under several categories and immediately taking down listings that had been compliant the day before. Entire categories of seller — shops using purchased 3D printer or Cricut templates, sellers of resold gemstones and crystals, certain digital download shops — found themselves out of compliance overnight. Whatever you think of the merits of the policy itself, the lesson for any business depending on a platform is the same: when the rules change, you don't get a vote, and you don't get a transition window. You either rebuild your business inside the new rules or you start over somewhere else.

That's the real meaning of platform dependency risk.

## "But bespoke fails all the time"

Sure. So does packaged software implementation; and the data on that is, if anything, much harsher than the data on bespoke.

As we saw above, [Panorama Consulting's longitudinal data](https://www.panorama-consulting.com/resource-center/erp-report/) shows that close to half of ERP implementations exceed their budgets, and a substantial share fail to deliver the benefits originally projected. These aren't fringe numbers from cherry-picked failures, they're the baseline for the supposedly safer option.

The problem isn't custom vs off-the-shelf. the real failure mode is poor discovery, weak delivery discipline, and decision-makers outsourcing accountability.

Good bespoke delivery is not magic. It's clear scope, iterative delivery, measurable outcomes, and ruthless prioritisation.

In other words, the same things that make any project work.

## A practical rule of thumb

Use COTS when the problem is commodity.

Go bespoke when the capability is differentiating, highly specific, or central to how you make money.

And in either case, do a serious cost/risk comparison over 3-5 years, not just year one.

If you only compare licence cost to build quote, you're not doing due diligence. You're shopping.

## Conclusion

Bespoke software is not inherently expensive or risky. COTS is not inherently safe or cheap.

Both can be excellent choices in the right context.

But businesses of every size are too often sold certainty where there is only trade-off. SMBs are told they can't afford bespoke. Mid-market and enterprise are told they _shouldn't_ go bespoke. The narratives are different but the destination is the same, and in both cases, the question that actually matters (is this capability core or commodity?) gets quietly skipped over.

If this post has a point, it's this: evaluate the trade-off honestly, and include control, opportunity cost, and lock-in in the equation.

Because if your systems are core to your business, the safe-looking option is often the riskiest one in disguise.

## References and further reading

* Joel Spolsky, ["In Defense of Not-Invented-Here Syndrome"](https://www.joelonsoftware.com/2001/10/14/in-defense-of-not-invented-here-syndrome/) (2001) — the canonical statement of the core-vs-commodity framing for software decisions.
* [Panorama Consulting Group, *2025 ERP Report*](https://www.panorama-consulting.com/resource-center/erp-report/) — independent annual survey of ERP implementation outcomes, including budget overruns, schedule overruns, and benefits realisation.
* Opara-Martins, J., Sahandi, R., & Tian, F. (2016). ["Critical analysis of vendor lock-in and its impact on cloud computing migration: a business perspective"](https://link.springer.com/article/10.1186/s13677-016-0054-z), *Journal of Cloud Computing*, 5:4 — peer-reviewed analysis of switching costs and vendor lock-in in SaaS contexts.
* [OECD, *The Digital Transformation of SMEs*](https://www.oecd.org/en/publications/the-digital-transformation-of-smes_bdb9256a-en.html) (2021) — broader context on SMB technology adoption patterns and constraints. ([PDF](https://www.oecd.org/content/dam/oecd/en/publications/reports/2021/02/the-digital-transformation-of-smes_ec3163f5/bdb9256a-en.pdf))
* Samuelson, W., & Zeckhauser, R. (1988). ["Status Quo Bias in Decision Making"](https://scholar.harvard.edu/files/rzeckhauser/files/status_quo_bias_in_decision_making.pdf) — relevant to why "default to COTS" framing is so sticky even when the trade-offs don't favour it.
* CindyLouWho2, ["Etsy Updated The Creativity Standards Without Notice"](https://www.cindylouwho2.com/blog/2025/6/16/) (June 2025) — detailed walkthrough of the policy change discussed above, including before/after comparisons via the Internet Archive.


Cover image by <a href="https://pixabay.com/users/roszie-6000120/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7370147">Rosy / Bad Homburg / Germany</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=7370147">Pixabay</a>