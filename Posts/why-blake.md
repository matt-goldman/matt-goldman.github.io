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

![Running jekyll serve just errors and says the term 'jekyll' is not recognised](/images/posts/jekyll-serve-nope.png)

Uh, nope. I guess that's not it. A quick check of [the docs](https://jekyllrb.com/docs/usage/) though tells me that, actually, that _is_ correct. Well, better go back to the [quick start](https://jekyllrb.com/docs/) and check I've got everything set up then...ah, wait, yeah that's right, I have to run `bundle exec jekyll serve` (whatever the heck that means). Ok let's try that...

...you know what? I'm not going to bore you with the details. But needless to say, after at least a couple of hours of crawling through Ruby rabbit holes (again, I'm sure people love Ruby, but I don't use it for anything else), gem version conflicts, and god knows what else, I eventually _finally_ got it running in a container. Let me just say that again - I had to use docker to get my blog to run. So, back to my question:

> Why the heck am I not just running this locally before publishing it?

Oh, yeah. That's why.

I knew there was something wrong about committing and pushing to main. I knew there was something wrong about not previewing before publishing. But I'd obviously forgotten about the hassle of literally just running the thing, and no doubt I'll file that memory away somewhere until I hit this problem again another year from now. (That won't happen now, thankfully, which is the point of this post).

## What about other SSGs?

I mentioned at the start that I'd tried others, and they all have similar problems. And not just this one - they _all_ have their own templating syntax and logic, configuration, conventions...I'm not criticising, as I said these are impressive tools and I know people love them, and with good reason. But having to learn about `_layouts` and `_partials`, TOML files, site configuration...it's too much. Honestly, it's enough to make me want to go back to WordPress.

...but then of course I remember how that's its own set of problems. Switching between blogging platforms, I can't help but remembering Gabriel Byrne's classic line in _Stigmata_(1999)

> Basically, what I've done is I've exchanged one set of complications for another.

Like I said, I've got other things to do. I'm tired. Honestly, most of the time I feel like Ynyr from _Krull_ (1983), desperately scrambling to finish my urgent task as I feel the sands slipping through my fingers, counting down the infinitesimal speck of time I have left in this world.

Those other SSGs are awesome. Until they're not. And yes, that's not a problem with them, it's a problem with me. But it's a problem I don't have time for.

And that's not even counting the other major problem I have with static site generators, and that's timed releases.

One thing you have to accept with a static site, when compared to a served site with a CMS, is that, once you publish it, that's it. There it is. That's a trade-off, and a more than acceptable one, but it does mean you can't do things like schedule a post to go live. It's not really that big a deal, it's a minor inconvenience - a papercut - but it's one that, when it happens frequently, is annoying enough to matter.

## And that's why I built the world's most boring static site generator

Right now, you're reading a site that was built with [Blake](https://github.com/matt-goldman/blake), the world's most boring SSG. And, yes, I built it. And, yes, I spent a fair bit more time on it than I would have spent solving those other annoying issues.

But the value of building something new far outweighs the value of solving problems in something old. Especially when the knowledge you gain from fixing those problems serves no other purpose. And non-reinforced skills are perishable, so I don't really learn anything. I have to re-learn (most of) it every time.

Blake is built in .NET and is fundamentally a Blazor based tool. Is it better than other SSGs? That depends on your perspective. And the answer is, unquestionably, no. But also, unquestionably, yes.

But none of that matters. What matters is it's better for _me_. If "better" to you means a granular configuration capability then, no, Blake is not better. It's boring, it doesn't do anything like that. It works on the premise of one, simple, convention, and that's it.

But that's the point. Boring is a feature, and more than that, for me it's the _killer_ feature. It's predictable, it "just works".

Does it do a whole bunch of other stuff?

No.

Thankfully, beautifully, _mercifully_, no.

Blake is fundamentally nothing more than Markdown to Razor parser (built around a [Markdig](https://github.com/xoofx/markdig) pipeline).

## Sounds terrible. How does it work then?

Ok, admittedly it doesn't do much. But, as I said, that's the point.

Thinking about the things that I got fed up with, I wanted something that didn't make any assumptions, that didn't make any demands, that seamlessly dovetailed into the tools and workflows I already use.

The simple explanation is this:

1. You have a folder that contains a file called `template.razor`.
2. In that folder you have a Markdown file (or files).

That's it. That's literally it.

There's a bit more nuance to it than that, but the nuance doesn't alter that, it just builds on it (and even then only slightly). I thought about all the frustrating things I get annoyed with and asked myself a bunch of stupid questions. Because stupid questions are the most powerful tool we have. Stupid questions are where innovation comes from.

Let's look at some of the questions I asked myself when pondering whether to build this:

### How will you handle templating?

I won't. Why would I? Razor is already a templating engine. I already know Razor and HTML, why learn or invent something else?

### How will you let users define site structure and navigation?

I won't. Why would I? Directories are already a way of organising that kind of hierarchy. Why would I invent something else?
    
    

...I'm sure you can see the pattern emerging here. The point is I didn't want to invent solutions for things we already have solutions for. I just wanted to be able to write blog posts in Markdown and have them render reliably. And that's what Blake gives me.

Let's look at the example I started out with - callouts. Let's take a look at how I had to do that in my previous Jekyll "theme" (you can see why I put that in quotes [here](https://blake-ssg.org/2%20using%20blake/sitetemplates)):

```markdown
> This is a callout
{: prompt-info }
```

Is this the "official" way to do this in Jekyll? Well, no. In Jekyll you define your `_includes` and can add them to your content using this Liquid syntax. The author of the template I was using just happened to call them prompts.

What about Hugo? Well that does have a slightly more standardised way.

```markdown
{{< alert info >}}
This is a callout
{{</ alert >}}
```

Actually this isn't _entirely_ standard. I got this from the [Hugo Bootstrap shortcodes](https://mafelp.github.io/hugo-bootstrap-shortcodes/). But that's for the specifics; the _approach_, at least, of using these "shortcodes" is standard for Hugo. Looking at the Hugo docs you can actually get quite explicit. Look at [this example](https://gohugo.io/shortcodes/figure/):

```markdown
{{< figure
  src="/images/examples/zion-national-park.jpg"
  alt="A photograph of Zion National Park"
  link="https://www.nps.gov/zion/index.htm"
  caption="Zion National Park"
  class="ma0 w-75"
>}}
```

According to the above linked page this would get rendered into HTML as follows:

```html
<figure class="ma0 w-75">
  <a href="https://www.nps.gov/zion/index.htm">
    <img 
      src="/images/examples/zion-national-park.jpg" 
      alt="A photograph of Zion National Park"
    >
  </a>
  <figcaption>
    <p>Zion National Park</p>
  </figcaption>
</figure>
```

Although that's so verbose it makes you wonder why you wouldn't just write the HTML in your Markdown directly. Which is fully supported.

## Well what makes Blake so special?

You might be tempted to ask, "ok well how do _you_ handle callouts?" (by the way 'callouts' is also not a standard term here; on the web they tend to be called 'alerts'). But if you think back to my earlier questions, I'll give you the same style of answer.

I won't. Markdown _already has an idiomatic convention for this_. Why would I invent something else?

Granted, Markdown is only a baseline standard, and there are different "flavours". But most implementations support _custom containers_. These are not part of the official Markdown specification (in fact there isn't one per sé), but they are ubiquitous, and that makes them the _de facto_ standard.

You've probably seen them, they look like this:

```markdown
::: info
This is a callout
:::
```

In Blake, _that's_ how you do it. Is it better? Arguably, but that's not the point. The point is, I'm writing Markdown, Markdown has a way of doing it, therefore, as a Markdown tool, Blake expects you to do it that way. Not a bespoke, custom, arcane syntax.

::: info title="Default Renderers"
Granted, you still have to provide a way to render that in your template. That's no different in Blake than it is in other SSGs, but Blake _does_ include "default renderers". These are container renderers for the common "callouts" (as I've referred to them) that you might want to include (like `tip`, `info`, etc.). These use standard Bootstrap alerts, because Bootstrap is the default CSS framework that you get with the Blazor WASM template. But you can turn these off easily if you want to provide your own (that's what I do on this site). You can see more [here](https://blake-ssg.org/2%20using%20blake/components#default-container-renderers) in the docs.
:::

## But wait, there's more...

...but I don't want to go through all that now. The point is, with Blake, you don't have to _do_ anything. Of course, you can, but you don't have to. It's a CLI tool that generates Razor pages using Markdown content based on a template. And that's it.

There's no config, no special syntax, no domain specific language, in fact there's nothing outside the realm of what your content language (Markdown) and your _site's_ templating language (Razor) already want.

If you want to do more with Blake, you can. I knew I would need to right from the start, so I made it [extensible through plugins](https://blake-ssg.org/2%20using%20blake/usingplugins). Plugins aren't unique to Blake, other SSGs support them too. In Blake they work the way you would expect them to in a Blazor site (as nuget packages or project references), but I suppose if there's one thing I did differently, it was the decision that the Blake core would non-negotiably do _nothing_ other than baking Markdown into Razor. Granted, there is tooling wrapped around it, but that tooling is there purely to support that core functionality.

There _are_ some cool features I have planned for Blake, things that _would_ make it stand out as an attractive SSG compared to others. You can see them under the issues tab in the repo, but they're all based on the assumption that other people want to use it.

Right now, I don't know if anyone else ever will. And if it just ends up being me, it will _still_ have been worth it. Because while I may not want to spend time learning things that are getting in my way, I'm a full-time .NET developer, so no .NET side project is wasted. And besides that, I now have a SSG that I can use and re-use, I can easily customise, I'll _never_ have to churn through docs or old posts to see how to do some weird thing. I can drop in arbitrary Razor components if I want (this is something I can't do with _any_ other SSG), I'll never have frustrating build chain issues.

It just works. Well, it works for _me_. And that's all that matters.

But, if you're curious, why not give it a try?

```bash
dotnet tool install -g Blake.CLI
blake new --includeSampleContent
```

Have a poke around. It doesn't bite. But if you want it to, you could write a plugin for that.