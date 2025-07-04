---
layout: post
title: "Replicating the Outlook Mobile 'Focused/Other' Switch in .NET MAUI"
date: 2025-07-04 00:00:01 +1000
image: /images/outlook-toggle-cover.png
tags: [mobile, maui, ui, outlook]
categories: [.NET, Mobile, UI, Outlook]
---

Over the past three days, I've demonstrated building some pretty cool UI effects in Maui.Graphics, the 2D graphics library that shipped with .NET MAUI back in 2022. Today I'm going to look at its closely related progenitor; SkiaSharp.

A few years ago, I shared a sample [replicating the Outlook mobile UI in .NET MAUI](posts/outlook-clone/). Outlook features a very cool custom toggle for switching between "Focused" and "Other" in your mailbox, but in the sample, an extract from my book, and specifically the chapter on layout, I glossed over this and opted to use the default `Switch` control instead.

The following screenshot shows what the original looks like in the Outlook app, compared to what we ended up with.

![The original Outlook mobile app compared with the simplified version we created in my previous post](/images/outlookv2-ogvsfinal.png)

For this year's [MAUI UI July](/posts/mauiuijuly-25), I decided to finally do it properly.

## The Problem

The Outlook switch isn’t just a simple toggle. It has two words ("Focused" and "Other") side by side, with a pill-shaped highlight that slides between them. Text colors shift dynamically as the pill moves:

* The selected text is blue when inside the pill.
* The unselected text remains white outside.
* The pill itself blends cleanly over the background pill.

But there's another subtle detail -  as the pill animates, the text color changes exactly where it overlaps. You can actually see this if you slow it down in the Outlook app.

![The Focused switch in Outlook has a cool effect with masking against the text underneath](/images/outlook-toggle.gif)

## Why Not Use a Default Switch?

As mentioned above, this originally came from a chapter in the book on layouts - specifically the purpose was to demonstrate how easy it is to achieve nearly any UI using the layout primitives in .NET MAUI. I had intended to add this later, but diving into it at this stage would have been a distraction.

My original intention was to implement this using Maui.Graphics; however, due to space constraints I wasn't able to include it. Additionally, the effect we use here depends on blend modes, which as yet are not implemented in Maui.Graphics. The interface is there, but they don't currently do anything.

## SkiaSharp to the Rescue

SkiaSharp has been around for a long time and is well supported, mature, and sophisticated. Maui.Graphics depends on Skia under the hood for much of its functionality.

It's been around since Xamarin (and if you've been following this space you will have seen [Kym Phillpotts do mind-blowing things with it](https://www.youtube.com/kphillpotts)) and has all the functionality we need for this. So, I fell back to SkiaSharp, which gives us [Porter-Duff blend modes](https://ssp.impulsetrain.com/porterduff.html), precise control, and real-time drawing.

## Bindable Properties

Rather than implementing a single-use control, I exposed the following for flexibility:

* OnText, OffText
* IsToggled
* SelectedTextColor, UnselectedTextColor
* PillColor, PillBackgroundColor
* Padding

This will allow me to use this toggle (if I want to) in any app, not just my Outlook clone.

I also added a `ToggleChanged` event, for scenarios not using MVVM (like this Outlook demo, for example).

## How It Works

In a nutshell, the control performs the following steps. I won't go through all the code here (you can see it in the repo, linked at the bottom), but I'll call out the main steps and highlight relevant snippets for each.

### 1. Get the properties of the canvas and define `SkiaPaint` instances for all the components

```csharp
//  The control subclasses SKCanvasView, which provides this
//  method for defining what to paint.
protected override void OnPaintSurface(SKPaintSurfaceEventArgs e)
{
    base.OnPaintSurface(e);

    // clear the canvas from the previous frame
    var canvas = e.Surface.Canvas;
    canvas.Clear();

    // get the height and width - these are used for scaling
    // the text and pills
    var info = e.Info;
    var width = info.Width;
    var height = info.Height;

    // Set the background and foreground pill colours from the
    // bindable properties (or their default values)
    using var pillBgPaint = new SKPaint { Color = PillBackgroundColor.ToSKColor(), IsAntialias = true };
    using var pillPaint = new SKPaint { Color = PillColor.ToSKColor(), IsAntialias = true };
    using var textPaint = new SKPaint { IsAntialias = true };

    // currently just uses the default typeface, but this could
    // also be a bindable property
    using var textFont = new SKFont { Size = height * 0.4f, Typeface = SKTypeface.Default };

    // ...
```
### 2. Measure text widths for each label (with padding).

```csharp
    // Get the widths of the two labels/states, add some padding,
    // and add a small gap between them relative to the height
    // of the control
    var onWidth = textFont.MeasureText(OnText) + Padding * 4;
    var offWidth = textFont.MeasureText(OffText) + Padding * 3;
    var gap = height * 0.025f;

    // ...
```

`onWidth` gets slightly more padding than `offWidth` because `onWidth` has a gap added after it when calculating positions, while `offWidth` does not. This balances the total spacing when the pills are drawn side by side.

### 3. Draw a full background pill, wide enough to contain both words.

```csharp
// Draw static background pill
canvas.DrawRoundRect(bgRect, pillBgPaint);
```

### 4. Draw the animated pill, sliding between "Focused" and "Other".

```csharp
// Draw animated active pill
canvas.DrawRoundRect(activeRect, pillPaint);
```

### 5. Draw unselected text in the base color on top.

```csharp
// Draw unselected text on top
textPaint.Color = UnselectedTextColor.ToSKColor();
canvas.DrawText(OnText, onStart + Padding, midY + pillRadius / 2f, textFont, textPaint);
canvas.DrawText(OffText, offStart + Padding, midY + pillRadius / 2f, textFont, textPaint);
```

### 6. Save a local layer, draw the active pill as a mask, then draw selected text using SrcIn blend mode so it only shows inside the pill.

```csharp
// Masked selected text only inside active pill
canvas.SaveLayer();
textPaint.Color = SelectedTextColor.ToSKColor();
textPaint.BlendMode = SKBlendMode.SrcIn;
canvas.DrawText(OnText, onStart + Padding, midY + pillRadius / 2f, textFont, textPaint);
canvas.DrawText(OffText, offStart + Padding, midY + pillRadius / 2f, textFont, textPaint);
textPaint.BlendMode = SKBlendMode.SrcOver;
canvas.Restore();
```

Most of the code here is fairly self-explanatory. If you followed the previous 3 days' posts, you'll recognise much of the logic here. We define shapes, then draw them onto a canvas.

You may have noticed that the first part of that is missing. We're passing shapes to the `DrawRoundRect` method - specifically `bgRect` and `activeRect` - but I haven't shown how to define them. These represent, as you might imagine, the large background pill and the sliding active pill. We'll look at how these are created shortly, but first there's one part here that might not be quite as obvious at first glance.

I mentioned above that we need _blend modes_ to achieve the visual effect we want for the toggle. In [part 1 of my Batmobile series](/posts/batmobile-part-1) I mentioned the importance of the order of operations - last-in wins, so if you paint something onto the canvas, anything that was there before gets painted over (although only where you are actually painting).

Blend modes let us control this behavior. We can define approaches to paint only where something exists underneath, only where something doesn't, or several other combinations. The Maui.Graphics docs [actually explain them pretty well](https://learn.microsoft.com/dotnet/maui/user-interface/graphics/blendmodes), even though the functionality is not yet implemented. Otherwise you can read about them in the [Skia docs](https://skia.org/docs/user/api/skblendmode_overview/).

### The Tricky Bit

The big "aha" moment: the `SaveLayer` call. You may have spotted this in the code above and wondered what it's doing. As mentioned, by default, when we paint onto the canvas, we create a new layer, and anything that gets painted onto that layer obscures anything behind it.

When we use blend modes, we flatten the layers (we blend them). So it's essential to save the background layer first and create a new layer set for the blended text and pill effect.

If you don’t scope it properly, your background pill vanishes. Ask me how I know.

## Drawing and Animating the Pill

Having defined how to draw the background, and how to blend the selected item pill with the text, the final piece needed to complete the control is to define _where_ exactly to draw the pill.

We'll break this down into three steps:

1. **Drawing the background pill:** This is static. We'll need to re-render it per frame because of the above-mentioned blending, but we only need to calculate the size once.
2. **Triggering and managing the animation:** As this is a toggle, we need to animate in response to the state being switched, and we need something to control the state of the foreground pill frame by frame as it moves between the two.
3. **Rendering the foreground pill:** Not only does this have two distinct states (on and off), each requiring its own size (depending on the text representing that state), but it has to grow and shrink dynamically between those states.

Let's walk through each of these.

### The background pill

The background pill is drawn first, and is defined statically based on the coordinates we extracted at the start:

```csharp
// define the total width as the width of the 'on' state
// text, plus the width of the 'off' state text, plus the
// gap.
var totalWidth = onWidth + offWidth + gap;

// define the horizontal start positions of the 'on' state
// text and the 'off' state text.
var startX = (width - totalWidth) / 2f;
var onStart = startX;
var offStart = onStart + onWidth + gap;

// define the height and vertical start positions of the pill
var midY = height / 2f;
var pillHeight = height * 0.6f;
var pillRadius = pillHeight / 2f;
var pillY = midY - pillRadius;

// define the horizontal end position of the pill
var rightEdge = offStart + offWidth;

// Define the background as a rounded rectangle, using the
// horizontal and vertical start positions, horizontal and
// vertical end positions, and a radius defined earlier as
// half the height (to make it perfectly rounded)
var bgRect = new SKRoundRect(new SKRect(onStart, pillY, rightEdge, pillY + pillHeight), pillRadius);
```

### Triggering and Managing the Animation

.NET MAUI includes some incredible [built-in animations](https://learn.microsoft.com/dotnet/maui/user-interface/animation/basic) for animating properties of views, like rotation, scale and position. If this control didn't include any text, and we were just animating the foreground pill to change size and move, we may have been able to use the `ScaleXTo` and `TranslateTo` animations to control a `Shape`. But we can't use those directly with the `SKRoundRect` _within_ a `SKCanvas` (we would only be able to apply them to the canvas as a whole).

.NET MAUI gives us flexibility though through [custom animations](https://learn.microsoft.com/dotnet/maui/user-interface/animation/custom). Custom animations are built using the `Animation` class (which is also under the hood of the built-in animations) which, while primarily intended for animation, essentially lets you control and change a value over time. There are several use-cases we might imagine for this, even outside UI, but in our case, it means that, unlike the built-in animations, which can _only_ be used with classes that inherit `VisualElement`, we _can_ use it to control our foreground pill.

The `Animate` class is instantiated with three parameters: a callback for the value to be animated, the start value, and the end value. The animation can then be run by calling the `Commit` method, which is given an owner. (typically the view being animated, but it doesn't have to be), a name, the number of milliseconds between calls to the value callback, a total duration, and an easing function.

Let's take a look at how it works in the Outlook toggle:

```csharp
// define a float to represent the current state
// of the animation; a value between 0 and 1
float animationProgress = 0f;

// Define a method to animate the toggle to its new
// state (0 = off, 1 = on)
private void AnimateToggle(bool newState)
{
    // the animation starts at the current state...
    var start = animationProgress;

    // ...and ends at the new state
    var end = newState ? 1f : 0f;

    // define an instance of the Animation class
    // The callback casts the value to a float and
    // assigns it to animationProgress, then calls
    // InvalidateSurface, which triggers a redraw
    // of the canvas
    // start is the current state
    // end is the new state
    var animation = new Animation(v => {
        animationProgress = (float)v;
        InvalidateSurface();
    }, start, end);

    // call Commit, assigning the control itself as
    // the owner, with a name of ToggleAnimation,
    // calling back to set the value and redraw every
    // 16 milliseconds, for a total duration of 200
    // milliseconds (62.5 frames per second), using
    // the CubicInOut easing function
    animation.Commit(this, "ToggleAnimation", 16, 200, Easing.CubicInOut);
}
```

In a nutshell, this code defines an `animationProgress` variable (which also persistently tracks the current state of the foreground pill, even between states of the toggle which is either `true` or `false`). We then define an `Animation`, which will change a value between a given start (current state, and `animationProgress`, which will be either `0` or `1`) and a given end (new state, which will be either `1` or `0` respectively). Each time it incrementally sets a value between the start and end state, it calls `InvalidateSurface`, triggering a redraw of the canvas.

We then `Commit` (run) that animation, telling it to update the value every 16 milliseconds, over a total duration of 200 milliseconds. The easing makes it speed up at the start and slow down at the finish which gives it a smoother, more natural, feel than something that instantly moves at a single speed.

> Note: we could make the duration a bindable property too if we wanted to slow things down a bit. I would derive the rate value from this, with a fixed target FPS, rather than making it a bindable property as well.
{: .prompt-info :}

The `AnimateToggle` method defines and commits the animation. In the control's constructor, we add it as a delegate to the touch event on the canvas, with a quick check to ensure the event is of the correct type:

```csharp
public OutlookToggle()
{
    EnableTouchEvents = true;
    Touch += (s, e) => {
        if (e.ActionType == SKTouchAction.Pressed)
        {
            IsToggled = !IsToggled;
            AnimateToggle(IsToggled);
        }
    };
}
```

And finally, we call it from the `propertyChanged` event of the `IsToggled` bindable property. This results in the pill animating if the user taps it (which correspondingly changes the the value), or when the value is changed via a bound property.

What this gives us, then, is a value that changes between `0` and `1` (or `1` and `0`) every 16 milliseconds, over the course of 200 milliseconds. The final step is to use this to derive the current position and dimensions of the foreground pill.

### The Foreground Pill

The foreground pill, highlighting the selected state, is a little more complicated as there are two aspects of its state that change over time: it's starting position, and it's width.

This is the thing that really makes this stand out - if all it had were two fixed-width states, that would be cool! But the fact that it slides across, dynamically masks the text, _as well as_ dynamically adjusting width, gives it that next level of 😘👌.

This means we're not just getting the size of the foreground pill for the on state, or the off state, but changing it incrementally as it switches between the two.

As we saw above, we've already got an `Animation` that controls the current progress between the two states, but we need a way to translate that into a current size and position. Let's take a look at how we do that.

Remember that this code is called every frame (every 16 milliseconds in this case). Just as we defined the background with a `SKRoundRect`, we use that to define the foreground pill too, but rather than using fixed start and width values that we derive from the properties of the canvas, combined with the size of the state text, we `Lerp` them using the current value of `animationProgress`.

Lerp stands for [_linear interpolation_](https://en.wikipedia.org/wiki/Linear_interpolation). The idea is simple: given a start value (from), an end value (to), and a progress factor between 0 and 1, it returns a value somewhere in between.

If you’ve done any game dev (Unity, Unreal, Godot, or any other), you’ve definitely seen this. Lerp is used everywhere to move things smoothly: camera pans, progress bars, even wobbly slime animations.

Game engines typically include built-in Lerp functions (which often also handle smoothing, clamping, and easing under the hood). These are often quite sophisticated, and unfortunately the BCL doesn't include a Lerp function. But rather than import a game engine just for this one function, we can create a barebones version which is more than enough for this pill animation:

```csharp
float Lerp(float from, float to, float progress) => from + (to - from) * progress;
```

Linear interpolation is dead simple. Think of it like this: you have a graph with an `x=y` line (this is what makes it _linear_). On one axis is `animationProgress`, on the other axis is the value you want to find (e.g. the desired `x` position or width). You simply look up the value on one axis that corresponds to the current value on the other axis. This is why we don’t simply set the pill’s `x` to `animationProgress`: without mapping, you'd end up with values like 0.37 instead of "X = 187".

With that, all we have to do is pass `animationProgress` to our `Lerp` function, along with the range to Lerp between, and we can get the start and width of the pill every frame.

```csharp
// Animate active pill
var animStart = Lerp(offStart, onStart, animationProgress);
var animWidth = Lerp(offWidth, onWidth, animationProgress);
var activeRect = new SKRoundRect(new SKRect(animStart, pillY, animStart + animWidth, pillY + pillHeight), pillRadius);
canvas.DrawRoundRect(activeRect, pillPaint);
```

## Result

You can see how the whole thing hangs together by checking out the `OutlookToggle.cs` file, in the `Controls` folder of the updated Outlook Clone (link to the repo is below). This gives us a final result that's pretty close to the original:

![Out Outlook clone, now incorporating the animated toggle, is almost indistinguishable from the original](/images/outlook-clone-with-toggle.gif)

It's almost pixel perfect, and to take it the rest of the way, we would just need to add the right typeface and tweak the padding.

## What’s Next

You can tweak the padding, hook up commands, or integrate haptic feedback for a native feel.

If you're feeling brave, you could also add adaptive colors for dark mode, or expose animation duration as a property.

One thing missing from our Outlook clone (rather than from this control specifically) is that in Outlook, the focused and other inboxes don't simply change like ours is doing here, but slide across from one side to the other, just as the toggle does. This would be very easy to achieve:

* Set up two `CollectionViews` instead of one
* Use `TranslationX` to control which one is onscreen
* Use the built-in animations to slide between the two `CollectionView`s.

There are lots of ways to spice up the default `Switch` with something more interesting, and there are ways to enhance this as well, with more bindable properties and more customisation. Liquid glass is the hot topic at the moment - we could add some shader effects to get very close, but at an even simpler level, we could add a small shine effect using a white or blue line at the bottom off the pill (depending on its state; we'd have to blend this as well).

The possibilities are endless!

## Closing

I put this on the back-burner after I finished the book, and I was intending to revisit this when the blend modes got implemented in Maui.Graphics. But I'm glad I finally got around to going back and finishing this off.

Fancy taking up the challenge of animating the collection of messages as well as the toggle?

Will you use this in any projects? Would you want this in a Nuget package? Let me know!

## Grab the code
[Link to repo on GitHub](https://github.com/matt-goldman/outlook)
