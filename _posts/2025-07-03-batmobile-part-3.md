
---
layout: post
title: "Holy MauiGraphics Batman! Part 3: Clayface-Level Batmaths"
date: 2025-07-03 00:00:01 +1000
image: /images/batmobile-cover-part-3.png
tags: [mobile, maui, ui]
categories: [.NET, Mobile, UI, Batman]
---

Welcome back to MAUI UI July 2025! If you’ve read [Part 1](/posts/batmobile-part-1) and [Part 2](/posts/batmobile-part-2), you’ve seen the Batmobile throttle and dashboard controls in action.

Yesterday we saw that we can give the pointer in the RPM gauge `endX` and `endY` values to enable it to point to a position on the gauge. In part 3 today we're going to explore the maths behind calculating those values.

**Important:** Before we go any further, let me be clear that this is _not_ a post for mathematicians, or even only those with a keen interest in a deep dive into some hardcore maths. This is an "explain like I'm five" (well maybe not _five_ exactly, this is high school maths level) post. And not because I intended it that way, but because _I'm_ not a mathematician, or even a maths aficionado. I haven't formally studied any maths since school, so the ELI5 approach is the thought process I went through to arrive at this solution, and I thought it would be interesting to share.

If like me you haven't thought about any of this since school, you might find it tweaks some memories, but even if not, you won't need to know anything other than what a triangle is and what an angle is. Trust me, this'll be fun!

## The Problem in Context

Initially I had intended to use rotation to control movement of the dial. This would have been better than the current approach for several reasons — chiefly, it would allow us to use animation and easings, which we'll touch on later. But conceptually, I had a problem. Take a look at the following diagram:

![The dial pointer pivots from a point at the end of the line, rather than in the center](/images/batmobile-dial-pivot-1.png)

Adjusting the rotation of a view in .NET MAUI is as simple as setting the `RotationX` or `RotationY` properties, or using animation which is also straightforward (and even simpler with the [AlohaKit animations library](https://github.com/jsuarezruiz/AlohaKit.Animations)). But I couldn't quite grasp how to rotate a view around a specific pivot point, rather than the center.

As it happens I was trying to solve an unnecessary problem - which unquestionably represents an alarming proportion of the work we spend our time on in this profession - as there is a very simple way to handle this. But by the time I had made that conceptual leap (and found out it's absolutely a solved problem, and the solution I eventually thought of is very much the standard approach) I had already come up with this approach, so I decided to keep it.

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

To determine the `x` and `y` coordinates for the end of the pointer, we can imagine a right-angle triangle, with the point at the origin, and an imaginary vertical line from the bottom of the gauge to the end of the pointer. The pointer itself forms the hypotenuse, as in the following diagram:

![If we project an imaginary vertical line connecting the tip of the pointer to the base of the gauge, the base, line, and pointer form a right-angle triangle, with the pointer as the hypotenuse](/images/batmobile-dial-triangle1.png)

Fortunately, this simplifies things for our use case. Calculating lengths and angles in triangles is an entire field within geometry; namely trigonometry, so making the cognitive leap to picture this as a triangle means that working out the coordinates we need is a solved problem (one that was solved thousands of years ago, in fact).

## Enter SOHCAHTOA

Remember [SOHCAHTOA](https://www.mathsisfun.com/algebra/sohcahtoa.html)? From school? One of those things you were _absolutely_ certain you would never, ever use or even think about ever again? Don't worry if you don't - we'll go through it now. And if you do, feel free to skip over this, or read through it with a fine-toothed comb and let me know how horribly wrong I got everything.

Anyway, it turns out you can use trigonometry for building UI 🤷

For a right-angle triangle, SOHCAHTOA are formulas we can use to calculate the other two angles, without measuring them directly, using the lengths of the sides.

As a quick recap, there are specific names given to the sides in a right-angle triangle, relative to the angle you are trying to calculate, as shown in the following diagram.

![A right-angle triangle, with the opposite, adjacent, and hypotenuse labelled, as well as the the angle being calculated - theta (θ)](/images/batmobile-maths-sohcachtoa-triangle.png)

The side that does not form part of the right-angle is always called the hypotenuse; the side touching the angle you want to calculate is called the adjacent, and the side not touching it is called the opposite. The angle you are trying to calculate is denoted by the Greek letter theta(θ).

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

Sine, cosine, and tangent are logarithmic functions, meaning they are calculated using values in a table. That's outside of scope of this post, but any basic scientific calculator has buttons for them, so you don't need to know how to derive them. More importantly for us, the .NET BCL has them built in too, and we'll see how to use them shortly.

While the SOHCAHTOA formulas are typically used for calculating the angle based on the lengths, in our case we've already got the angle, and we're trying to calculate the _x_ and _y_ position of the intersection between the opposite and hypotenuse. Let's look at how we do that.

## Rearranging the Formulae

So far we've got θ which we derive from the RPM. The hypotenuse is also a fixed length, as the length of the pointer doesn't change, so this can go in a `const` just as we did with `rpmDegrees`:

```csharp
// hypotenuse
private const float pointerLength = 125;
```

Now that we've got the angle and the hypotenuse, we can calculate the lengths of both of the other sides. To do this, we need to rearrange the SOHCAHTOA formulae - currently, they have θ on the left side of the equals sign, and the lengths on the right side. We need θ on the right and the length we're trying to calculate on the left.

One easy way to do this is to use a formula triangle. You may have seen these for _speed_ = _distance_ x _time_, or _V_ = _I_ x _R_. For the SOHCAHTOA formulas they look like this:

![The formula triangle for SOH](/images/triangle-soh.png)

From here, we can easily see that the formula we already have for deriving θ can be rearranged to find the hypotenuse from θ and the opposite:

$$
H = \frac{O}{\sin \theta}
$$

Or more importantly, in our case, to find the opposite from θ and the hypotenuse:

$$
O = \sin \theta \times H
$$

We can do the same thing with cosine to find the adjacent:

![The formula triangle for CAH](/images/triangle-cah.png)

Which easily lets us see:

$$
A = \cos \theta \times H
$$

> We can do the same for TOA as well, but that's particularly useful in our case, given it depends on the two sides we're trying to find.
{: prompt-info :}

Now that we know how to get the lengths of the other two sides, we're finally ready to use these to figure out the _x_ and _y_ coordinates we need for the end of our pointer.

## Getting to the Pointy End

The length of the hypotenuse is fixed, we know the angle, so using SOHCAHTOA (well, SOHCAH to be precise) we can find the length of the opposite and adjacent sides:

![The lengths of the opposite and adjacent sides can be calculated using the hypotenuse, which is fixed, and the angle, which is derived from the RPM](/images/batmobile-length-of-sides.png).

These are relative to the pointer's origin though, which is not the canvas' origin. The canvas starts at _0,0_, in the top left, and the pointer starts at _155,155_. We've got _x_ and _y_ relative to the pointer's origin, so to find the end of the pointer relative to the canvas, we can simply subtract _x_ and _y_ from _155_.

![The _x_ and _y_ values we have are relative to the pointer's origin, which at _155,155_, so we subtract _x_ and _y_ from _155_ to get the position relative to the canvas](/images/batmobile-mathsendxy.png)

With these, we can now draw our pointer, but there's a catch: this will _only_ work if the RPM is less than _7,500_. To form an acute angle (less than 90 degrees), the pointer must remain on the left side of the gauge.

![with an angle greater than 90 degrees, we don't form a right-angle](/images/batmobile-no-rightangle.png)

Fortunately, unit circle mathematics and the rules for sine, cosine, and tangent work in full 360 degrees. SOHCAHTOA works for right-angle triangles, but there are other arrangements that work the whole way around.

But, even more fortunately, we can avoid all that by flipping the triangle (conceptually) and calculating the angles from the other side:

![Just flip the triangle to the other side and we get our right-angle back](/images/batmobile-dial-triangle2.png)

We can subtract the angle calculated with the RPM from 180 to get the angle for this portion of the gauge, which means we're always working with a right-angle triangle. This means the formulas don't change, the _endY_ position doesn't change, and for _endX_ we can just add it to 155 instead of subtracting it. No need to dig out our school textbooks (or, realistically, Google) to remind ourselves how to work with oblique triangles (and totally remember that they are called oblique triangles without having to look it up).

And that's it! We're finally ready to draw the line.

## Putting it All Together

As we saw in Part 2 yesterday, calculating all this is the responsibility of the `Dashboard`. It calculates the _endX_ and _endY_ values any time the RPM changes, and sends those to the pointer to be redrawn.

As we've been through the steps here, I'll just show the code rather than stepping through it, with some comments to help tie it to what we've already seen.

```csharp
// Called from the propertyChanged handler
// of the Rpm bindable property
public void DrawPointer()
{
    // theta
    float degrees;

    // Rpm is 0 to 15,000
    // 0 to 180 degrees
    // 0 to 7500 is 0 to 90 degrees (opposite on the left side of the gauge)
    // 7500 to 15,000 is 90 to 180 degrees (opposite on the right side of the gauge)
    if (Rpm >= 7500)
    {
        degrees = 180 - (Rpm / rpmDegrees);
    }
    else
    {
        degrees = Rpm / rpmDegrees;
    }

    // Annoyingly, even though Sin and Cos are formally defined
    // with degrees, the BCL expects us to provide radians to
    // the functions in the Math namespace.
    var radians = degrees * Math.PI / 180;

    var sin = Math.Sin(radians);
    var cos = Math.Cos(radians);

    // opposite = y
    var y = sin * pointerLength;

    // adjacent = x
    var x = cos * pointerLength;

    // We'll have to determine whether to add or subtract
    // this to the pointer origin based on RPM
    float endX;

    // Y doesn't invert based on RPM so we can just calculate it
    var endY = 155 - (float)y;

    if (Rpm < 7500)
    {
        // if RPM is less than 7500, x will be on the left
        // side of the gauge
        endX = 155 - (float)x;
    }
    else
    {
        // if RPM is greater than 7500, x will be on the
        // right side of the gauge
        endX = 155 + (float)Math.Abs(x);
    }

    Pointer.Drawable = new Pointer(endX, endY);
}
```

While this may not be the cleanest approach, or the most efficient, or even the best looking, I think it's cool to see how we can use pointless arcane maths we learned in school to build a Batman themed UI. I don't remember much of school, but I can confidently say I enjoyed re-learning these concepts this time more than I did the first time around!

## Cleaner Approaches

While there's nothing technically wrong with what I've done here (as far as I know - any mathematicians reading this are welcome to correct me), there are a couple of approaches that would in theory at least be a bit better.

### Unit circle definitions

I won't go into these here, but technically the triangle flip wasn't necessary. The Law of Sines and Law of Cosines work with any triangles, oblique or right-angle. We still need the logic to check whether the RPM is above or below 7,500. This is necessary to determine whether to add or subtract the length of the adjacent from the pointer's origin, to position it relative to the canvas origin. But using these formulae would let us have one `if` condition rather than two.

### A rotating pointer

I've mentioned this a few times across these posts, but if I were building a gauge for an actual product, I wouldn't do this. I would use a rotating graphic instead of redrawing a line. As well as drawing a more interesting pointer, it also allows for animation and easings.

You can only rotate around the center point, which is what tripped me up initially, but that's actually not a problem. Simply render the pointer on only one half of your `IDrawable` - and it turns out this is in fact the actual approach to this, and another common hack I rediscovered.

![By drawing the pointer from the center of the view, we can still rotate the whole view by the required angle, and keep the pointer pivoting around the correct point](/images/batmobile-maths-PIVOT.png)

This is the best approach:

* Better pointer graphic
* Smoother rotation with animation and easings
* No maths (just give it the angle)

## Wrap-up

This brings us to the end of the MAUI UI July Batmobile series. There's one more post to come in which we'll look at the gRPC implementation, the technical debt, and some options to improve the architecture and code.

In the meantime, there's one last UI challenge to take away. One last feature I've always wanted to add to this is audio - I'd love to have a throaty engine noise with a pitch that changes relative to the RPM. I've got a few ideas about how to implement that - none of them particularly easy - but all very doable.

Is that something you think you could take on? What other feature would you like to see (or do you think. Batman needs)? And, perhaps most importantly of all, do you suddenly care about maths again?

Stay tuned for the rest of MAUI UI July 2025, we've got some great content coming!
