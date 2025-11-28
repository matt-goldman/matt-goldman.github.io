# It's Time To Let JavaScript Go

[Sha1-Hulud popped up again this week](https://blog.checkpoint.com/research/shai-hulud-2-0-inside-the-second-coming-the-most-aggressive-npm-supply-chain-attack-of-2025/). Another poisoned npm wave. Hundreds of packages compromised. Tens of thousands of repositories (potentially millions) affected. Another security blog cycle. Another industry-wide sigh.

There's nothing new in the news. It's the same story and same advice - audit your dependencies, enforce MFA, do all the things you're already doing - and the same chorus of "we need stronger governance" and "supply chain hygiene matters," as though the problem is that we didn't wash our hands before dinner.

But when these attacks keep appearing in the same supply chain, it isn't hygiene, and it isn't governance. It's the structure.

At some point, you have to stop asking the same question and start accepting the answer.

It's time to take JavaScript out behind the shed, level the shotgun, wipe away the solitary tear, and let it go.

This isn't just about a rant, a personal distaste for JavaScript and the culture that glorifies its shortcomings. It's the silent horror at all the "governance" and "risk management" around the single greatest vulnerability we've ever known. And it's everywhere.

This is about the fact that modern civilisation runs on an ecosystem that cannot be secured, cannot be governed, and cannot be fixed.

## Why npm Is Uniquely Vulnerable

Often, when an npm supply chain attack hits the news, people try to equate it to the proliferation of malware that targets Windows compared to other OSes (which is not really true any more - most attack vectors are via the browser). "Well, npm is popular. Of course attackers target the biggest ecosystem."

That's part of the picture. A small part.

If Windows viruses are 80 percent prevalence and 20 percent architecture, npm supply chain attacks are closer to 40 percent prevalence and 60 percent architecture. It's not just popularity. npm is structurally easier to attack.

Here's why:

### npm's dependency explosion problem

npm's model encourages micro-packages and extremely deep dependency trees. It's normal for a single project to transitively pull in hundreds to thousands of packages, many of them single-file utilities maintained by one person, not version-pinned, and unreviewed by anyone upstream.

![The famous XKCD #2347 dependency stack. It's precisely because it's true that it's _not_ funny.](https://imgs.xkcd.com/comics/dependency.png)

This makes npm uniquely fragile. A single compromised tiny package cascades into millions of downstream repos without anyone noticing. NuGet and other ecosystems simply don't have this extreme level of fragmentation.

### npm install executes code

npm's lifecycle scripts (`preinstall`, `install`, `postinstall`) let packages run arbitrary code on the developer's machine at install time. This is the single biggest structural weakness in the JavaScript ecosystem.

In the light of other package distribution systems, this seems absurd. NuGet for example does not allow code execution at install time.

Yarn/PNPM don't solve the problem either. They inherit the same vulnerability because they use npm package manifests and respect lifecycle scripts unless explicitly disabled.

This one feature alone makes the attack surface wildly larger.

### npm publishes are frictionless

`npm publish` takes seconds. No signing, no approval, and until recently, no mandatory MFA (and historically, many maintainers didn't secure accounts with MFA).

Hijacked accounts are famously common.

### npm versioning culture is chaos

The JavaScript community updates constantly, rarely pins exact versions, often uses `^` or `~` in production, and often auto-updates with bots like Dependabot or Renovate.

When a malicious version appears, the propagation window is measured in minutes.

.NET developers mostly pin versions manually and bump intentionally. Ruby/Bundler ecosystems often lock aggressively. Rust/Cargo uses locking by default. Go modules use immutable, cryptographic continuity. Python/pip is somewhere in the middle, but still less chaotic than npm.

### npm rewrites packages on install

npm performs dependency resolution and `node_modules` flattening in a way that provides no stable, verifiable dependency graph. Contrast this with Rust's Cargo.lock with reproducible builds, Go's sumdb with verified module proxy, or NuGet's deterministic restore where the same machine state produces identical outcomes.

The package lock system deserves its own special place in hell for manageability reasons alone, but that same nightmare exacerbates this problem beyond any reasonable expectations of management (we'll get to that later). npm's approach has historically made deterministic builds inconsistent, which is completely incompatible with any sense of control.

### npm's early design predated modern supply chain thinking

By the time people realised the risks, the ecosystem had scaled to millions of packages and billions of downloads per week. Retrofitting safety into that scale is extremely difficult. NuGet, Cargo, and Go Modules all came later and learned from what npm got wrong.

## Other Ecosystems Aren't Perfect, But They Aren't This

No package ecosystem is flawless, but many have structural safeguards that npm simply never had.

**NuGet** has binary packages, deterministic restore, signing support, namespace ownership, and no arbitrary install scripts. It strongly encourages signing, enforces API key scopes, has much slower ecosystem turnover, and has fewer single-maintainer micro-packages.

**Cargo** enforces crate ownership, reproducible builds, no install-time execution, and cultural bias towards fewer dependencies.

**Go Modules** provide verifiable sums with transparency logs (sumdb), module paths tied to DNS ownership, and immutable versions.

**PyPI, RubyGems, and Maven** all have weaknesses, but none operate on the premise that a text file with arbitrary lifecycle scripts from a stranger on the internet should run executable code on your machine.

npm is the only major ecosystem that grew without a hard ownership layer and with executable install scripts as a default feature.

npm is the outlier.

## The Sleeper Agent in Every System We Rely On

JavaScript is everywhere. It is all around us, even now, in this very room. You use it when you turn on your smart lights or open your blinds. When you check your bank balance. When your child logs in for school. When you watch television. When you pay your taxes. And it thrives in a world that has been pulled over your eyes to blind you from the truth: **Modern civilisation runs on unsigned, unaudited code written by strangers and distributed through a system that was never designed to carry this weight.**

It has become the substrate of modern life, woven through systems so deeply that most people don't even realise they're touching it.

And lying there, quietly, is a devastating sleeper agent, completely unaware of its own catastrophic nature, unknowingly waiting for an activation signal.

### The bigger problem

Well, you can forget everything I said about npm being uniquely vulnerable.

Earlier I said that other package ecosystems are materially better-designed than npm. They are. Stronger signing models, stricter namespace ownership, no lifecycle scripts, deterministic restores. But there’s a catch.

The moment they touch npm, _even once_, they inherit all of npm’s problems. And they do. Constantly.

For example, a NuGet package can legally include:

* a package.json
* a targets file
* an MSBuild hook that runs npm install

And it won’t run on install, which is why NuGet feels safer. But that’s not protection. It just pushes execution back a few minutes. Because someone, somewhere, is going to run:

```bash
dotnet build
```

And when they do, that MSBuild target fires, npm runs, lifecycle scripts run, and then we have exactly the same problems: unsigned code, deep transitive chains, abandoned authors, typosquatting, stale dependencies four thousand layers down.

This isn't hypothetical either, this _literally_ happened, today, with this very same exploit, and not by accident, nor by deliberate malicious intent. It happened via zoonotic spillover. In just a couple of days, [Sha1-Hulud 2.0 made the jump from npm to Maven](https://thehackernews.com/2025/11/shai-hulud-v2-campaign-spreads-from-npm.html?m=1).

## The Governance Illusion

Our financial institutions, government systems, defence agencies, and healthcare providers run software built on an ecosystem where:

* packages are unsigned
* scripts run pre, during, and post install
* anyone could originally publish a higher version of someone else's package
* maintainers can be compromised silently
* dependencies are unbounded in depth
* and MFA is… "encouraged"

Encouraged.

Not required. Not enforced. Not mandatory for publishing. Not mandatory for organisations who depend on the ecosystem.

Encouraged.

If you wanted to parody risk management, you couldn't write something better than that.

Can you tell at install time that a package is verified? Maybe. Sometimes. If the maintainer opted in.

Can you tell whether the package author is using MFA? Does your pipeline know? Should it?

Can you detect whether a dependency eleven layers down was published by a hijacked account by someone in a different continent?

No.

And here is the important part:

**This is not because JavaScript developers are careless. It is because the architecture makes enforcement impossible.**

npm was designed for frictionless innovation. Not enterprise security, or global infrastructure, or hyperscale workloads. And certainly not national defence, and not "the entire world now depends on this".

It simply cannot meet the requirements now placed on it.

Governance isn't _failing_; it simply cannot exist here.

Trying to govern npm is like trying to lock Old Yeller in the corn pen. It isn't making him safer. It isn't making anyone safer. It's just delaying the moment when you admit what has to happen.

And it's not only the architecture. It's the culture that grew around it.

For more than a decade, JavaScript became the poster child for frictionless innovation. Move fast. Ship now. Patch later. Vibe your way into an MVP. Impress investors with a shiny prototype. Get traction before you get discipline. The ecosystem rewarded speed over rigour, convenience over safety, and novelty over reliability. That is not a criticism of developers. It is an observation of incentives.

Now add to that the explosion of no-code and low-code tooling, the rise of vibe-coded SaaS platforms making extravagant claims, and a startup culture built on hype cycles rather than engineering discipline. As someone responsible for governance, risk, or compliance, how do you meaningfully assess trust in a world where entire products can be assembled from unknown transitive dependencies and launched into production before anyone involved understands what is running under the hood?

It's true that cultures _can_ evolve - Linux is proof, as is Python. Even C++ reinvented itself. But the web is the last ungoverned frontier. There are no gatekeepers, no zoning laws, no building codes. No borders. Its very identity is rooted in permissiveness. That is why it exploded. That is why it became ubiquitous. And that is why it cannot be tamed.

The Old West wasn't civilised. It was replaced. That is the only way frontier cultures change.

## Why This Cannot Be Fixed

JavaScript is held together by the same rope it's hanging from.

Every modern feature that people praise — flexibility, dynamic typing, living in the browser, universality, massive ecosystem, npm's speed of iteration — is directly linked to the things that make it an operational hazard: impossible static guarantees, runtime type chaos, execution of arbitrary code on install, historically zero security posture, fragmentation, accidental complexity everywhere.

It's not despite its strengths that JavaScript is a mess. It's _because_ of them.

:::sidenote title="You don't have to take my word for it"
Sonatype’s annual State of the Software Supply Chain report has been warning about JavaScript’s dependency bloat for years. In their latest edition, they found that the JavaScript ecosystem grows faster, forks faster, and abandons packages faster than any other ecosystem they measured. That’s the soil everything else grows in. [URL]

Snyk’s State of JavaScript Security research shows the same problem from another angle: most of the ecosystem is built on shallow ownership, deep transitive chains, and packages that have been unmaintained for years. That’s not moral failure. That’s architecture. [URL]

Socket’s analysis of npm install scripts shows that more than half of the high‑impact malware waves on npm involve install scripts. Why wouldn’t they? They’re arbitrary shell commands that run on your machine just because you typed `npm install`. [URL]

ReversingLabs has documented wave after wave of npm malware, from dependency‑confusion attacks to hijacked maintainer accounts. None of it requires brilliance. None of it requires sophistication. It just requires that the ecosystem works exactly the way it was designed. [URL]

Even GitHub’s own advisory database reads like a running commentary on structural weakness. Over and over, the root cause isn’t a bug. It’s the model.

CISA and the NSA have both released guidance warning that modern software supply chains are brittle by design. We just don’t treat it like a crisis because JavaScript feels familiar. [URL]

While I was writing this, I realised I had designed a viable supply-chain attack in about thirty seconds without meaning to. Not because I am especially clever, but because the path is obvious. The ecosystem makes it obvious. If a tired engineer can sketch out an attack over coffee, imagine what a motivated attacker with time, money, and intent can do. I don’t need to implement it to make the point. The fact that it practically designs itself is the point.
:::

JavaScript is the internal combustion engine of the web. It changed everything, it powered an era, and it made the modern world possible. But just like the engine that defined the twentieth century, its success became its trap. We built our civilisation around it. We kept scaling it long after the warning lights were flashing. We convinced ourselves we could tune it, regulate it, govern it, bolt safety rails onto it.

But some technologies don't merely accumulate flaws. They accumulate **risk**. They grow into existential dependencies. They become too entrenched to fix and too dangerous to continue.

This is an honest assessment, not a dunk. It was the right tool in 1995. It was tolerable in 2005. It was survivable in 2015. By 2025, it became the weakest point in virtually every attack chain.

When language-level weaknesses endanger supply chains, developer machines, CI pipelines, package repositories, and global infrastructure, it's no longer a quirk. It's a liability.

And that is the tragedy here: we don't want to let go. Culturally, emotionally, historically, we are bound to JavaScript, in the same way that we're culturally bound to sitting in metal killing machines, propelled along by explosions. It feels unthinkable to imagine the web without it. But the scale of what now runs on this foundation makes the cost of sentimentality untenable.

Its greatest strength is _all_ of its greatest weaknesses. In order for it to remain viable and modernise for the future, it would need such a huge overhaul that you'd be better off replacing it altogether. And I have no doubt that WASM _will_ do that.

JavaScript's architecture, its ecosystem, and its culture are inseparable. And all three have reached a point where incremental modernisation is no longer viable.

You cannot break the web. You cannot remove features. You cannot repair early design mistakes. You cannot enforce typing. You cannot change semantics. You cannot force safe package practices. You cannot replace npm with something sane without breaking everything built on top of it. You cannot shift the culture because the culture is encouraged by the language and the ecosystem.

This is not a moral failure of the community. It's a structural failure of the platform.

npm's flexibility creates its fragility. JavaScript's expressiveness creates its unpredictability. "No breaking changes ever" creates permanent technical debt. The culture of freedom creates a culture of shortcuts. The scripting model creates the security footprint.

And this part needs to be said explicitly:

**JavaScript is a scripting language.** A _scripting_ language. And we are using it to build and run hyperscale enterprise systems. Critical infrastructure. Banking. Healthcare. Education. Defence.

And we treat that as normal.

I have _no doubt_ that there will be a flood of people lining up to tell me why I'm wrong to point that out. But it's not something I should have to defend; the fact that _anyone_ takes this ecosystem seriously, let alone _everyone_, is a triumph of normalcy bias.

Go grab a drink. I'll be right back, I'm off to write my new SAP competitor in batch scripts.

!["This is fine" meme with a dog sitting in a burning room.](/images/posts/this-is-fine.jpg)

When we talked about this on Beer Driven Devs, I said JavaScript feels like Jeff Goldblum at the end of The Fly: the product of brilliance and accident merged into something that can't be unmerged, something suffering under its own design, something quietly asking to be put down.

JavaScript-as-Brundlefly is a creature born from genius and accident, the output of ambition meeting unintended consequences. An innovation that went further than its design parameters. A hybrid that survived long past the point where the merge made sense. Something that cannot be separated back into safe components. Something begging for mercy, not malice. Something whose tragedy is that it cannot continue.

The more I look at the state of our global software infrastructure, the more I think that wasn't an exaggeration.

## The WASM Escape Hatch (And Why Necromancy Shouldn't Happen)

I mentioned above that believe WASM is what's next for the web. I do, and I'm not going to elaborate here on why because it's been covered a lot already. You can listen to [Liam and I talking about it on the BDD podcast](https://www.beerdriven.dev/episodes/37/), or look up any number of opinion articles and videos on the topic. It's clear that the consensus is not aligned with my view, and I'm fine with that. And to be clear, I don't think JavaScript will _ever_ disappear completely, and to be even more clear, I don't think WASM will displace JavaScript as the dominant framework. Instead, it opens up the option of _no_ dominant framework at all, because you can run literally anything on it (and that's not the risk you think it is - but, again, that's another discussion).

Most of the discussion at the moment tends to focus on the past, or at best, the present. Most opinions believe that JavaScript is here to stay, forever, and that WASM won't ever replace it. But the truth is, these opinions are not based on fact. WASM won't displace JavaScript overnight (JavaScript will die a slow, agonising death, rather than the dignified sendoff it deserves). Not because it _can't_, nor because it _shouldn't_, but because of the cultural inertia described above.

It will never be truly gone, even if something else does take over. And if that thing is WASM, people will say "we'll just compile JavaScript to WASM and make it binary". And yes, someone will. That isn't a hypothetical. It is inevitable. Developers resurrect old tools all the time. You can still write AMOS programs in 2025. Someone will eventually paint a pentagram over WASM and summon JavaScript back from its well-deserved rest.

But this part needs to be framed honestly.

I'm not saying we _can't_ necromance JavaScript into WASM. I'm saying we _shouldn't_; at least, not with serious intention of perpetuating it's use as a ubiquitous piece of all modern infrastructure. Not because the experiment itself is wrong, but because treating it as a way to preserve JavaScript's place in the web stack would drag every structural, systemic, institutional, and cultural problem along for the ride.

The security fatalism. The micro-dependency culture. The 'anything-goes' programming habits. The absence of boundaries. The normalisation of fragility. The idea that convenience outweighs cost. The belief that scripting languages scale because they _have_ scaled, not because they were designed to.

Sure, you can resurrect JavaScript inside a WASM VM. Compile it. Sandboxed. Efficient. But all that does is exhume the corpse and strap it upright. It doesn't fix the rot in the bones. And it definitely doesn't fix the culture.

WASM is Rocky's pristine new physique. JavaScript is Eddie's decaying corpse. Stuffing one into the other doesn't produce a hero. It produces a monster.

And I say this with empathy, not contempt. If someone told me this about .NET, I'd be gutted. I've lived through the death of platforms I loved: the Amiga (and AMOS), Windows Phone. It hurts. But when something reaches the point where its existence endangers what's built on top of it, you have to let it go.

The web doesn't need JavaScript any more. It needs a safe, modern VM. WASM is already that. It's designed for the future rather than patched around the past.

WASM gives us a chance to start fresh. To build the web's future on foundations designed for modern realities. To avoid repeating the same mistakes under a different runtime.

We shouldn't squander that by dragging JavaScript's entire existential crisis into the new world.

## Let It Rest

JavaScript isn't the villain. It carried the web through adolescence. It did more than it was ever designed to do. It held the world together long after its structural cracks became impossible to ignore.

But it is tired. And the risks have outgrown the story we tell ourselves about how software is built.

The responsible thing is to let it rest. Gratefully. Honestly.

And then choose tools designed for the world we actually live in, not the one we left behind.

If JavaScript is Old Yeller, worn out and carrying wounds it can't come back from, then WASM is Young Yeller: capable, modern, and built for the future rather than the past.

It's time to let the old hero rest and raise the one that can carry us forward.

The web is ready to grow up. It's time we were too.
