---
description: "Building a custom Batmobile throttle control using .NET MAUI Graphics and IDrawable to create retro-futuristic UI elements with interactive touch controls."
title: "Holy MauiGraphics Batman! Part 1: Batmobile Throttle Control"
date: 2025-07-01 00:00:01 +1000
image: /images/posts//batmobile-cover-part-1.png
tags: [mobile, maui, ui]
categories: [.NET, Mobile, UI, Batman]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

**Here's what we'll build**

![Here's what we're going to build](/images/posts//batmobile-muij2025.gif)

Welcome to [MAUI UI July 2025](https://goforgoldman.com/posts/mauiuijuly-25/)! In this post, we're building a custom throttle control using .NET MAUI and `IDrawable` from MauiGraphics. This is part of a retro-futuristic Batmobile telemetry system that includes both input (throttle) and output (RPM dashboard), connected over gRPC. In part 1 we'll focus the input side: the throttle UI Batman uses to control the beast. Tomorrow we'll dive into the output side: an RPM gauge rendered on the BatComputer.

This project was originally developed as part of my book but didn’t make the final cut, so I've resurrected it here with some upgrades and insights.

Stick around for parts 2 and 3 covering the rest of the UI, and a bonus part 4 covering the gRPC aspects (not part of MAUI UI July). If you can't wait, and just want to see the code, the full solution [is on GitHub](https://github.com/matt-goldman/MauiBatmobile). The code contains detailed comments reflecting the detail provided here.

## MauiGraphics Basics

The main MauiGraphics interface we use is `IDrawable`, which defines the `Draw` method used to render graphics on screen.

```csharp
public class MyDrawable : IDrawable
{
    public void Draw(ICanvas canvas, RectF dirtyRect)
    {

    }
}
```

The `Draw` method accepts two parameters: `ICanvas` and `RectF`. The `ICanvas` represents the surface we're going to render our graphics onto. The `RectF` provides information about the surface that canvas is on (like size and location) which can be used to adjust what we draw. In this series I only use the `canvas` and not the `dirtyRect`.

`ICanvas` exposes properties and methods for drawing on screen — like setting stroke color, defining paths, and rendering shapes. I'm not covering the full API here, just what I used to build the Batmobile. You can refer to the [documentation](https://learn.microsoft.com/en-us/dotnet/maui/user-interface/graphics/?view=net-maui-9.0) for more — or better yet, browse the [sample code](https://github.com/dotnet/maui-samples/tree/main/10.0/UserInterface/Views/GraphicsViewDemos), which shows several use cases as well as how to use them.

## The Throttle UI

The throttle consists of three parts:

1. Two vertical rails
2. A sliding handle
3. Drag logic and RPM binding

Each component is rendered using `IDrawable` objects and combined in a `ContentView`.

The rails are rendered using an `IDrawable` (in the `ThrottleRails` class), the handle is another `IDrawable` (in the `ThrottleHandle` class), and a `ContentView` (the `Throttle` class) combines them and handle the logic for dragging the handle and a bindable property for the RPM value.

Let’s break it down.

### Drawing the Rails

In the `Draw` method, we begin by defining the stroke color and size:

```csharp
// File: Controls/ThrottleRails.cs
canvas.StrokeColor = Colors.Black;
canvas.StrokeSize = 2;
```

Graphically, this control is two vertical rails, each defined as a simple rectangle path. So, we add a `PathF` object and use that to describe a rectangle, then pass it to the `DrawPath` method of the `ICanvas`:

```csharp
// File: Controls/ThrottleRails.cs
path.MoveTo(60, 40);
path.LineTo(60, 410);
path.LineTo(70, 410);
path.LineTo(70, 40);
path.Close();
canvas.DrawPath(path);

path.MoveTo(430, 40);
path.LineTo(430, 410);
path.LineTo(440, 410);
path.LineTo(440, 40);
path.Close();
canvas.DrawPath(path);
```

This draws two rectangles:

![The paths we've defined create two vertically oriented rectangles](/images/posts//batmobile-throttle-rails.png)

If you think of it like a robot holding a pen, `MoveTo` is used to move the pen to a position without drawing anything. This is how we're able to use the same `path` object for two disconnected rails. Note also that `LineTo` (and other methods that create drawn geometry) don't actually render on the canvas; the whole `path` object only _describes_ the geometry while the `ICanvas` renders it itself.

If you've ever peeked under the hood of an SVG file (or you know how the format works), it's very similar; in fact the `MoveTo`, `LineTo`, and `CurveTo` (which we'll see next) are directly analogous to the `M`, `L`, and `C` SVG commands.

:::info
Note: it would have been much simpler to draw rectangles than paths, and all of the above code could be achieved in two lines. But I used this long-hand approach to demonstrate the concepts of moving and drawing.
:::

### Drawing the Handle

The handle is a rounded capsule shape filled with a vertical gradient. Rather than define the gradient in the `Draw` method we can define it as a static property of the class. This saves it being instantiated in every frame and is a little more GC friendly.

```csharp
// File: Controls/ThrottleHandle.cs
private readonly LinearGradientPaint gradient = new LinearGradientPaint
{
    StartColor = Color.FromRgb(103, 103, 103),
    EndColor = Color.FromHsv(226, 18, 100),
    StartPoint = new Point(0.5, 1),
    EndPoint = new Point(0.5, 0)
};
```

In the `Draw` method we start out by defining the stroke and outline:

```csharp
// File: Controls/ThrottleHandle.cs
canvas.StrokeColor = Colors.Black;
canvas.StrokeSize = 5;

var path = new PathF();

path.MoveTo(50, 50);
path.LineTo(450, 50);
path.CurveTo(new PointF(470, 50), new PointF(470, 100), new PointF(450, 100));
path.LineTo(50, 100);
path.CurveTo(new PointF(30, 100), new PointF(30, 50), new PointF(50, 50));
path.Close();
```

This time, instead of just using lines, we've added curves to the mix too. The `CurveTo` method let's us define a [Bézier curve](https://pomax.github.io/bezierinfo/#introduction) with two control points and the end point, with the start at the current location on the path (in these examples, the coordinates defined in the preceding `LineTo` calls).

Next we define a rectangle to hold the gradient background:

```csharp
// File: Controls/ThrottleHandle.cs
var fillRect = new RectF(30, 50, 440, 50);
canvas.SetFillPaint(Gradient, fillRect);
```

Here we're defining a rectangle to hold our gradient. You can see it extends from the leftmost tip of the curve on the left to the same on the other side - this would leave some corners sticking out, but we can use `ClipPath` to trim it down to the geometry we want before using a fill method (in this case `FillRoundedRectangle`) to paint the gradient.

```csharp
// File: Controls/ThrottleHandle.cs
canvas.ClipPath(path);
canvas.FillRoundedRectangle(fillRect, 12);
```

Probably worth pausing here to reflect on the importance of the order of operations. There's a reason we use the canvas concept - every operation paints a layer on top of what's already there. Operations like clipping don't affect what's already on the canvas.

Finally we draw the outline path - again, following the layering concept, this has to be done after the gradient, otherwise the gradient would cover it.

```csharp
// File: Controls/ThrottleHandle.cs
canvas.DrawPath(path);
canvas.SetShadow(new SizeF(10, -10), 4, Colors.Grey);
```

We also set a small shadow which helps the handle appear to be above the rails. This gives us the final result for the handle:

![The throttle handle is an elongated capsule shape with an outline and gradient filling and a thick black outline](/images/posts//batmobile-throttle-handle.png)

### Layout and Gesture

Here’s how we compose the full control in XAML:

```xml
<!-- file: Controls/Throttle.xaml -->
<?xml version="1.0" encoding="utf-8" ?>
<ContentView xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             x:Class="Batmobile.Controls.Throttle"
             xmlns:draw="clr-namespace:Batmobile.Controls">
    <ContentView.Resources>
        <draw:ThrottleHandle x:Key="Handle"/>
        <draw:ThrottleRails x:Key="Rails"/>
    </ContentView.Resources>
    <ContentView.Content>
        <Grid HorizontalOptions="Center">
            <GraphicsView Drawable="{StaticResource Rails}"
                          x:Name="rails"
                          HorizontalOptions="Center"
                          WidthRequest="500"
                          HeightRequest="600"/>

            <GraphicsView Drawable="{StaticResource Handle}"
                          x:Name="handle"
                          VerticalOptions="Start"
                          HorizontalOptions="Center"
                          WidthRequest="500"
                          HeightRequest="200">
                <GraphicsView.GestureRecognizers>
                    <PanGestureRecognizer PanUpdated="ThrottlePanUpdated"/>
                </GraphicsView.GestureRecognizers>
            </GraphicsView>
        </Grid>
    </ContentView.Content>
</ContentView>
```

It's fairly self-explanatory - the handle and rails are imported as resources and placed into a `Grid` so that they share the same 2D space (with no rows or columns defined, they're both in the default of `0,0`). `Grid` has the same conceptual layering as `ICanvas`, so adding the handle last renders it over the rails. A `PanGestureRecognizer` is attached so the user can drag it vertically.

### Calculating RPM

In the event handler for the `PanGestureRecogniser`, we do two things. First, we adjust the position of the `handle`. We've got some guardrails (pun intended) to ensure it doesn't move below the bottom or above the top of the rails, and we ignore the horizontal (x) component altogether.

```csharp
// File: Controls/Throttle.xaml.cs
private void ThrottlePanUpdated(object sender, PanUpdatedEventArgs e)
{
  if (e.TotalY > 0 && e.TotalY < 300 && IsEnabled)
  {
      handle.TranslationY = e.TotalY;
      Rpm = (int)e.TotalY * 50;  // 300px * 50 = 15000 max RPM
  }

  if (e.StatusType == GestureStatus.Completed || e.StatusType == GestureStatus.Canceled)
      Rpm = 0;
}
```

We calculate the RPM by mapping the Y translation directly to a value between 0 and 15,000 (the arbitrarily chosen max RPM of the Batmobile). As this is exposed by a bindable property, the main page gets notified of updates in realtime and streams the values over gRPC to the BatCave (more on this in part 4; note that part 4 is a bonus and not part of MAUI UI July).

## Final layout

The throttle control is added to the main page, along with some other controls for enabling and disabling the gRPC stream (the 'ignition') and displaying information about the app (the title label) and the current RPM. The final result looks like this:

![Batmobile final layout](/images/posts//batmobile-final-layout.png)

The full code is in the repo, but it's fairly vanilla - just standard .NET MAUI layouts and controls, with the `Throttle` control added to a `VerticalStackLayout`.

## What's Next

In Part 2, we’ll flip to the receiving end and build a dashboard-style RPM gauge that uses the same graphics primitives. If you enjoy trigonometry, custom drawing, and real-time telemetry, stay tuned.

If you can't wait, you can find the full code [on GitHub](https://github.com/matt-goldman/MauiBatmobile). Feel free to remix it, reskin it, or strap it into your own Bat-themed side project - and say tuned for a discussion of some of these in parts 3 and 4!
