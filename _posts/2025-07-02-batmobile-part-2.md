---
layout: post
title: "Holy MauiGraphics Batman! Part 2: The RPM Gauge"
date: 2025-07-02 00:00:01 +1000
image: /images/batmobile-cover-part-2.png
tags: [mobile, maui, ui]
categories: [.NET, Mobile, UI, Batman]
---

Welcome back to MAUI UI July 2025. In [Part 1](/posts/batmobile-part-1), we built a custom throttle control for the Batmobile. Today, we’re heading into the Batcave to build a live RPM dashboard that visualises the data stream in real time.

## Dashboard Overview

The dashboard is composed of three layers:

1. **A fixed gauge background**
2. **A moving dial (the pointer)**
3. **Telemetry bindings**

Let’s walk through how each part is drawn, building on the same MauiGraphics principles introduced in Part 1 — using `IDrawable.Draw` and `ICanvas` to create custom visual elements.

## Drawing the Gauge

The gauge is rendered with a combination of arcs and a redline segment. We start by drawing a semi-circle and overlaying a red wedge to indicate the danger zone. We can see how these are achieved in the `Draw` method of the `RpmGauge` control in the `Batcave` project. First, the wedge:

```csharp
canvas.StrokeSize = 4;
var path = new PathF();
path.MoveTo(155, 155);
path.LineTo(305, 155);
path.LineTo(305, 155);
path.CurveTo(new PointF(305, 155), new PointF(305, 140), new PointF(290, 90));
path.LineTo(155, 155);
path.Close();
canvas.FillColor = Colors.Red;
canvas.FillPath(path);
```
{: File="Controls/RpmGauge.cs" :}

> Note: The duplicate line (`path.MoveTo(305,155`) is not a mistake. This is a workaround for an [open issue](https://github.com/dotnet/maui/issues/5691).
{: .prompt-info :}

Most of this code is similar to what we've already seen.

Note that on the curve the first control point is the same as the start point. This creates a smooth, rounded arc that curves toward the second control point and finishes at the end point. Technically this is a misuse of Bezier curves, where each control point is used to steer the curve. _Technically_ `DrawArc`  is the correct way to construct this geometry. But `DrawArc` creates a distinct primitive from our `path`, meaning we can't fill the whole shape. We will use it shortly for something else, but using Bezier curves with one control point at the start or end is a handy (and common) technique.

```csharp
canvas.StrokeColor = Colors.Black;
canvas.DrawArc(5, 5, 300, 300, 0, 180, false, false);
```
{: File="Controls/RpmGauge.cs" :}

We set the stroke to black and then use `DrawArc`. An arc is different to a curve - a curve uses control points to create arbitrary shapes and angles, whereas an arc is a portion of an ellipse.

We specify the start x and y points (`5,5` in this case), the width and height of the ellipse (`300` and `300` in this case - and as they are equal that makes this ellipse a circle), the start and end angle, and whether the arc is drawn clockwise, and whether it is closed.

With 0 degrees pointing right (3 o’clock) and 180 to the left (9 o’clock), setting `IsClockwise` to false draws the arc over the top. Setting it to `true` would draw the arc under the bottom - but you could still draw it clockwise correctly over the top by reversing the start and end angles.

Finally, we define the `Closed` property as false; if we made it `true`, it would draw a line between the start and end points to create a closed semi-circle.

This gives us the top arc and red-zone wedge for the gauge:

![The completed gauge arc and red-zone](/images/batcave-gauge.png)

## Drawing the Pointer

The pointer is about as simple as it gets - it's just a line. It's another `IDrawable` defined in the `Pointer.cs` file. It's got public `endX` and `endY` properties, and the `Draw` method simply draws a line from the center of the arc (`155,155`) to the end points:

```csharp
canvas.StrokeLineCap = LineCap.Round;
canvas.StrokeColor = Colors.Black;
canvas.StrokeSize = 8;
canvas.DrawLine(155, 155, endX, endY);
```
{: File="Controls/Pointer.cs" :}

This does couple it to the gauge/dial, but that's the intent here so that's ok. We will look at some alternative approaches later, but this is suitable for our needs. We've also defined the line cap as round rather than square, which works a bit better for the pointer.

![The simple pointer from the Batcave's RPM gauge is just a line with a round cap](/images/batcave-pointer.png)

The challenging part is calculating what the `endX` and `endY` values should be - but that's not a concern of this control. That's handled in the `Dashboard` `ContentView`, which assembles the two `IDrawables` as well.

The start and end points are calculated with some very straightforward trigonometry - but _don't run away_! It's actually _very_ easy (believe me, I'm no mathematician!), and we're not going to cover it here anyway, I've saved that for tomorrow.

### Assembling the Control

We layer the gauge and pointer in a shared `Grid` inside a `ContentView`:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<ContentView xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:controls="clr-namespace:Batcave.Controls"
             x:Class="Batcave.Controls.Dashboard">
    <ContentView.Resources>
        <controls:RpmGauge x:Key="Gauge"/>
        <controls:Pointer x:Key="Pointer"/>
    </ContentView.Resources>
    <ContentView.Content>
        <Grid>
            <GraphicsView Drawable="{StaticResource Gauge}"
                          HorizontalOptions="Center"
                          WidthRequest="305"
                          HeightRequest="300"/>

            <GraphicsView HorizontalOptions="Center"
                          Drawable="{StaticResource Pointer}"
                          WidthRequest="305"
                          HeightRequest="300"
                          x:Name="Pointer"/>

            <Label x:Name="MathCheck"
                   VerticalOptions="End"
                   HorizontalOptions="Start"
                   TextColor="Green"
                   MaximumWidthRequest="600"/>
        </Grid>
    </ContentView.Content>
</ContentView>
```
{: File="Controls/Dashboard.xaml" :}

The label was added as a dev tool to surface the calculated angle, but I liked the way it looked, like streaming telemetry, so kept it in.

### Bindings

In addition to layout, `Dashboard` exposes a bindable property called `Rpm`. In the `MainPage` we subscribe to RPM updates over gRPC and assign them to a binding source for this control.

The `propertyChanged` delegate calculates the start and end points (using [SOHCAHTOA](https://www.mathsisfun.com/algebra/sohcahtoa.html), which we will dive into tomorrow) and assigns a new instance of the `Pointer` passing the `x` and `y` values via constructor.

Every time the RPM updates (via GRPC), this results in the line being redrawn, always from the centre to the defined end points we calculate.

## Assembling in the page

The `MainPage` does a little more than just plonk the `Dashboard` on the screen. It also renders a 'screen', using a `Border` and a `RadialGradientBrush`. It also has some labels (for context as well as the RPM) and a switch that toggles subscription to the gRPC screen.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:controls="clr-namespace:Batcave.Controls"
             BackgroundColor="Gray"
             x:Class="Batcave.MainPage">
    <Grid RowDefinitions="7*, 1*">
        <Border Grid.Row="0"
                Stroke="White"
                StrokeThickness="5"
                Margin="0,20,0,0"
                WidthRequest="1000"
                HorizontalOptions="Center">
            <Border.StrokeShape>
                <RoundRectangle CornerRadius="40"/>
            </Border.StrokeShape>
            <Border.Background>
                <RadialGradientBrush Center="0.75,0.25">
                    <GradientStop Color="{StaticResource ScreenGradientStart}"
                                  Offset="0.1"/>
                    <GradientStop Color="{StaticResource ScreenGradientStop}"
                                  Offset="1.0"/>
                </RadialGradientBrush>
            </Border.Background>
        </Border>

        <VerticalStackLayout Grid.Row="0"
                             Margin="100"
                             VerticalOptions="Center"
                             HorizontalOptions="Center">
            <Label HorizontalOptions="Center"
                   FontSize="24"
                   Text="RPM:"
                   Margin="20"/>

            <Label HorizontalOptions="Center"
                   FontSize="48"
                   Text="{Binding Rpm}"
                   Margin="20"/>

            <controls:Dashboard Rpm="{Binding Rpm, Mode=TwoWay}"/>

        </VerticalStackLayout>

        <HorizontalStackLayout Grid.Row="1"
                               HorizontalOptions="CenterAndExpand">
            <Label
               Margin="350,30,200,30"
               FontSize="24"
               HorizontalOptions="CenterAndExpand"
               VerticalOptions="Center"
               FontFamily="Batman"
               TextColor="White"
               Text="BatComputer"/>

            <Switch
                Margin="0,30"
                HorizontalOptions="EndAndExpand"
                ThumbColor="White"
                VerticalOptions="Center"
                IsToggled="{Binding IsComputerOn}"/>
        </HorizontalStackLayout>
    </Grid>
</ContentPage>
```
{: File="MainPage.xaml" :}

It also handles the gRPC RPM client, which it sets as the binding context, allowing the `RPM` property to be bound to the dashboard.

And this gives us the completed BatComputer!

## Wrap-up

And there you have it — a retro-futuristic RPM gauge using nothing but .NET MAUI and a little bit of maths. It’s performant, responsive, and really satisfying to see it animate live.

![The finished RPM dashboard in the Batcave](/images/batcave-finished-screen.jpeg)

If you haven’t yet, check out Part 1 for the throttle. The full source is also on [GitHub](https://github.com/matt-goldman/MauiBatmobile). Feel free to run it yourself, or make some changes (I cover some potential improvements in the last part of this series).

Check back in tomorrow for a dive into the trigonometry behind calculating the start and end points, and at the end we'll explore some improvements and additional features we could include.

Will the BatNeedle hold up under the pressure of real-time rendering?
Will our trigonometric tricks stand firm when RPMs rise?
Or will the quadrant-quibbling and fill-path-fudging finally catch up with our caped coder?

Can the dashboard survive without easing? Will gradients cause graphical gridlock?

Stay tuned, Batfans — tomorrow we descend even deeper into the swirling vortex of circular logic, animated arcs, and the unspeakable evil that is… **Clayface-level trigonometry!**

Same Bat-time!
Same Bat-channel!

I'll be waiting in the Batcave.
