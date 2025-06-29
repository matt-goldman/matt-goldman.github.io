
---
layout: post
title: "Holy MauiGraphics Batman! Part 3: Clayface-Level Batmaths"
date: 2025-07-03 00:00:01 +1000
image: /images/maui-ui-july-bg.png
tags: [mobile, maui, ui]
categories: [.NET, Mobile, UI, Batman]
---

Welcome back to MAUI UI July 2025! If you’ve read [Part 1](/posts/batmobile) and [Part 2](/2/posts/batmobile-part-2), you’ve seen the Batmobile throttle and dashboard controls in action.

Yesterday we saw that we can give the pointer in the RPM gauge `endX` and `endY` values to enable it to point to a position on the gauge. In part 3 today we're going to explore the maths behind calculating those values.

**Important:** Before we go any further, let me be clear that this is _not_ a post for mathematicians, or even only those with a keen interest in a deep dive into some hardcore maths. This is an "explain like I'm five" (well maybe not _five_ exactly, this is high school maths level) post. And not because I intended it that way, but because _I'm_ not a mathematician, or even a maths aficionado. I haven't formally studied any maths since school, so the ELI5 approach is the thought process I went through to arrive at this solution, and I thought it would be interesting to share.

If like me you haven't thought about any of this since school, you might find it tweaks some memories, but even if not, you won't need to know anything other than what a triangle is and what an angle is. Trust me, this'll be fun!

## The Problem in Context

Initially I had intended to use rotation to control movement of the dial. This would have been better than the current approach for a few reasons, but chief among them is that we can use animation for that, meaning we get access to some nice extras like easings, which we'll look at later in this post. But conceptually, I had a problem. Take a look at the following diagram:

![The dial pointer pivots from a point at the end of the line, rather than in the center](/images/batmobile-dial-pivot-1.png)

Adjusting the rotation of a view in .NET MAUI is as simple as setting the `RotationX` or `RotationY` properties, or using animation which is also straightforward (and even simpler with the [AlohaKit animations library](https://github.com/jsuarezruiz/AlohaKit.Animations)). But I couldn't quite grasp how to rotate a view around a specific pivot point, rather than the center.

As it happens I was trying to solve an unnecessary problem - which unquestionably represents an alarming proportion of the work we spend our time on in this profession - as there is a very simple way to handle this. But by the time I had made that conceptual leap (and subsequently investigated and found out it's absolutely a solved problem, and the solution I eventually thought of is very much the standard approach) I had already come up with this approach, so I decided to keep it.

So instead of rotating a pointer, I decided to redraw it from its origin to a point on the gauge.

## Figuring Out the Angles

Whether using rotation or redrawing the line, the first thing to determine is the angle. This is the easiest part and is just straight up arithmetic. We know that the RPM is in a range between 0 and 15,000 and it's represented on a gauge that has to be between 0 and 180 degrees. So it's simple to determine that 1 degree represents 15,000 / 180 = 83.333. So I added a const to represent RPM per degree:

```csharp
private const float rpmDegrees = 84;
```

Now any time the control receives a new RPM angle, the angle the gauge needs to be rotated to or pointed at is just the RPM divided by this constant:

```csharp
var degrees = Rpm / rpmDegrees;
```

Now all we need to do is draw a line from the origin (centre of the bottom of the dial) at that angle for the length that we want to draw the line.

Simple right?

Well, not exactly. Because you can't literally just say "Draw a line from this point at this angle with this length". In MauiGraphics we need to specify two points in 2D space to draw the line to and from.

> Quick aside, remember turtles from school? Those little robots that you could program to draw shapes for you? Those were programmed with LOGO, and with LOGO you _could_ give it instructions like that. Instructions were always relative to its own position and orientation. E.g. `right 67`, `forward 100`. And that's it - rotate, move forward, and the turtle draws a line (there are also pen up and pen down instructions). Modern graphics APIs don't use this approach though, and in fairness while it would be cool for this one use case, using absolute coordinate systems makes most other things much more manageable.
{: .prompt-info :}

We already know the "from" - that won't change - so we need a way to figure out the "to".

## Picturing the Dial as Triangles

To determine the `x` and `y` coordinates for the end of the pointer, we can imagine a right-angle triangle, with the point at the origin, and an imaginary vertical line from the bottom of the gauge to the end pf the pointer. The pointer itself forms the hypotenuse, as in the following diagram:

![If we project an imaginary vertical line connecting the tip of the pointer to the base of the gauge, the base, line, and pointer form a right-angle triangle, with the pointer as the hypotenuse](/images/batmobile-dial-triangle1.png)

Fortunately, this simplifies things for our use case. Calculating lengths and angles in triangles is an entire field within geometry; namely trigonometry, so making the cognitive leap to picture this as a triangle means that working out the coordinates we need is a solved problem (one that was solved thousands of years ago, in fact).

## Enter SOHCAHTOA

Remember [SOHCAHTOA](https://www.mathsisfun.com/algebra/sohcahtoa.html)? From school? One of those things you were _absolutely_ certain you would never, ever use or even think about ever again? Don't worry if you don't - we'll go through it now. And if you do, feel free to skip over this, or read through it with a fine-toothed comb and let me know how horribly wrong I got everything.

Anyway, it turns out you can use trigonometry for building UI 🤷

For a right-angle triangle, SOHCAHTOA are formulas we can use to calculate the angles that are not a right-angle (that's always 90 degrees), without measuring them directly, using the lengths of the sides.

As a quick recap, there are specific names given to the sides in a right-angle triangle, relative to the angle you are trying to calculate, as shown in the following diagram.

![A right-angle triangle, with the opposite, adjacent, and hypotenuse labelled, as well as the the angle being calculated - theta (θ)](/images/batmobile-maths-sohcachtoa-triangle.png)

The side that does not form part of the right-angle is always called the hypotenuse; the side touching the angle you want to calculate is called the adjacent, and the side not touching it is called the opposite. The angle you are trying to calculate is always denoted by the Greek letter theta(θ).

The SOHCAHTOA formulas let you calculate θ using only the lengths of two of the other sides. As a recap, the formulas are:

* **S**in(θ) = **O**pposite / **H**ypotenuse
$$
\sin \theta = \frac{O}{H}
$$
* **C**os(θ) = **A**djacent / **H**ypotenuse
$$
\cos \theta = \frac{A}{H}
$$
* **T**an(θ) = **O**pposite / **A**djacent
$$
\tan \theta = \frac{O}{A}
$$

Sine, cosine, and tangent are logarithmic functions, meaning they are calculated using values in a table. That's way out of scope of this post, but any basic scientific calculator has buttons for them, so you don't need to know how to derive them. More importantly for us, the .NET BCL has them build in too.




$$
O = H \times \sin \theta
$$

$$
H = \frac{O}{\sin \theta}
$$

---



$$
A = H \times \cos \theta
$$

$$
H = \frac{A}{\cos \theta}
$$

---



$$
O = A \times \tan \theta
$$

$$
A = \frac{O}{\tan \theta}
$$
