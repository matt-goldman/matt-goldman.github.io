---
description: "Why I switched my blog to Blake, and why you should too."
title:  "The world's most boring static site generator"
date:   2025-08-21 00:00:01 +1000
image:  /images/posts/troops.jpg
tags: [web, blogs, blake, static site generators]
categories: [web development]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

I love learning new things. Every day is a struggle to not dive deep into some cool new concept or technology, I've got so much to do and keeping my attention focused is a never ending battle.

And that's the problem. I have to be brutally honest with myself - I'm _never_ going to get through my backlog of side projects. Not in one lifetime anyway (should I add fixing that to my backlog? Nah...) That means that my time is my most precious resource. It's the ultimate non-renewable, and that means I protect it more fiercely than any other.

This can often leave me feeling frustrated - while I do love learning new things, when having to learn something new becomes a barrier to accomplishing something else, that's often just part of life (and part of the fun). But at other times, it can become a source of rage inducing frustration, and long term source of this, for me, has been static site generators.

## What's your problem with SSGs?

Look, I'm not bashing Ghost, or Jekyll, or Gatsby, or Hugo, or whatever. They're awesome. They are undeniably wonderful accomplishments and have justifiably devoted followers. But for me, they just get in my way.

Take this blog for example. It started out on one (honestly I forget which), then moved to another, and most recently, prior to my latest update, it was running on Jekyll. They've all been good and served me well, but if I'm honest, they have frankly prematurely aged me as well.

Take Jekyll. It's fine, honestly. For many people I'm sure it does the job. Actually, for me, too, it's been mostly problem free. But I have sunk hours into it over pointless problems. And admittedly these problems are not insurmountable, but they require commitment to learning things which have absolutely zero utility to me outside of maintaining my blog. That, for me, is not a valuable investment of my most precious resource. Let me walk you through a typical and recurring problem.

## Writing a blog post

Writing a new blog post is a bread-and-butter, typical, standard affair that should be painless. Right? Here's how it usually goes for me. I open VS Code, switch to main if not already there, pull, create a new branch, add a markdown file, and start writing. Simple, right?

Yeah, no problem. Until I want to add a callout, or sidebar, or something like that. Ok this should be simple enough... it's something like this:

```markdown
> This is a callout
{: prompt-info }
```

Ok not too bad. I have to do a quote, then use that prompt thing underneath. Not the end of the world. Until I publish the page and it looks like this:

![Screenshot of how a callout renders when I get something wrong in the syntax](/images/posts/liquid-callout-screenshot.png)

So what went wrong here? Well, it depends. I get this wrong _every_ time, one way or another. Did I do something wrong with the quote? Should it be an underscore and not a hyphen? Should it have a colon at both ends?

Who knows?

More importantly, who the fuck cares?

And, honestly, this is just scratching the surface. What if I want multi-line callouts? Or what if I want callouts partway through numbered lists? These are not hypotheticals, these are real things that have happened (among many more) that have broken my blog and cost me hours. _Hours_.

:::note title="Why not just use snippets?"
Yeah, yeah...
:::

Honestly, I'm sure people love liquid syntax, and I'm sure it's with good reason. But for something that requires so little of my time to use, the disproportionate frustration it causes me is mind boggling. And the amount of time and effort I would have to put in to mastering it may seem valuable in the face of the frustration it would resolve, but I would much rather just remove the frustration.

## Previewing content

The small problem highlighted above is just one example. It's actually probably my most common issue, but it's not the only one. And given the unreliability of my own skill with the templating engine, it's critical that I spin up my blog locally to check through what a post looks like before publishing.

Yeah, I don't do that.

Seriously, look at this:

![Screenshots of multiple rapid pushes direct to main, fixing frustrating minor rendering problems](/images/posts/fix-prompts-commits.png)

I'm not kidding, the number of times I have rapidly fired off multiple commits directly to main, because I've had to let my workflow publish the site, then I frantically force refresh to make sure it's rendering properly now. Oh, it's not? FML, ok tweak that or whatever, push again, FML! Rinse, repeat, oh, wow, _finally_.

There has to be a better way. In fact, it was while pushing those very commits you see above that I asked myself that same question. Why the heck am I not just running this locally before publishing it?

## Running locally

So I scoured the depths of my brain for how to run my blog. It had been a while, but I remembered that I have to basically just run `jekyll serve`. So I opened my terminal and navigated to my blog folder and ran it.

