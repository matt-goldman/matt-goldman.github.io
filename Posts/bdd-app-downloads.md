---
description: "Exploring creative download progress microinteractions in .NET MAUI, from basic modals to engaging beer-fill animations that enhance user experience."
title: "Beer-Driven Downloads & Microinteractions in .NET MAUI"
date: 2025-07-12 00:00:01 +1000
image: /images/posts/bdd-downloads-cover.png
tags: [mobile, maui, ui, ux, microinteractions]
categories: [.NET, Mobile, UI, UX, Microinteractions]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

## Intro

:::note
This post is part of the [MAUI UI July](/posts/mauiuijuly-25) event, where community members share their passion for .NET MAUI UI. Check out the link for more great content!
:::

:::note title="Note 2"
I wouldn't normally suggest this, but just scroll to the end and watch the video (the last one). Then come back and read the post. It's a lot more fun that way, trust me!
:::




Microinteractions have become a huge UI trend in 2025, and for good reason. They're not just fancy visual flourishes; they enhance usability, communicate state, and make experiences more human. I recently encountered a scenario in a client project that needed exactly this: a way to show download progress for content in an expressive and meaningful way.

The app is a content library (podcasts and journals) that users can access online, but can also download content for offline use. Downloads happen silently in the background, which is problematic for a few reasons, so I've been thinking about better ways to handle this.

It's on the backlog for this particular app (we've got a prioritised roadmap), but this is actually something I've wanted to explore for a while. And, as it happens, I've got another app that also handles podcast episode downloads I've been wanting to build for a while: the [Beer Driven Devs](https://www.beerdriven.dev) mobile app. So, despite [Liam](https://www.beerdriven.dev/hosts#Liam%20Elliott)'s misgivings (he doesn't really approve of the app idea), I decided to take the idea beyond the drawing board. The Beer Driven Devs app offers the perfect playground for this exploration, as it has a fun, lighthearted theme that allows for some creative freedom in how we present download progress.

Let's take a look at how we can implement some fun and engaging download progress microinteractions in .NET MAUI, using the Beer Driven Devs app as our example.

## How does the app work?

The full source code is available on GitHub - see the link at the bottom of this post. The app is built using .NET MAUI, and uses my go-to tools for any new .NET MAUI app:

- The [.NET MAUI Community Toolkit](https://learn.microsoft.com/dotnet/communitytoolkit/maui/) for common UI controls and helpers
- The [MVVM Community Toolkit](https://learn.microsoft.com/dotnet/communitytoolkit/mvvm/) for MVVM support and source generators
- My [PageResolver library](https://github.com/matt-goldman/Maui.Plugins.PageResolver) for easy navigation and automatic dependency registration

The Beer Driven Devs website has an RSS feed that's consumed by Apple and Spotify to host the episodes, so the app simply pulls that feed to get all the episode data. So no dedicated backend required - yet! (I'll need to add that later, as well as auth, for the community features, but that's another story.)

The app will allow streaming episodes (using the `MediaElement` control in the MAUI Community Toolkit), but I also want to allow users to download episodes for offline listening. This is where the download progress microinteractions come in. Let's explore how we can implement these in a fun and engaging way.

Throughout all levels, the core download state visuals remain: dimmed thumbnails and gray icons before download; full-color thumbnails, green icons, and a trash icon once downloaded. These small touches ensure users always know what’s ready offline.

## Level 0: The Classic Modal

As a minimum, we need to include some visual cues that indicate the state of episodes to the user: thumbnails are dimmed and the download icon uses the app's secondary colour before download. Once downloaded, the thumbnail switches to full color, the download icon turns green, and a delete icon appears to let you remove the episode. The following screenshot shows what this looks like in the app:

![Episode Download State](/images/posts/bdd-level-0.png)
_This is the most basic implementation, but it does the job of indicating the download state of each episode. The dimmed thumbnail and download icon provide a clear visual cue that the episode is not yet downloaded, while the full-color thumbnail and green icon, and the presence of the trashcan icon, indicate that the episode is ready for offline listening._

This establishes a decent UX language, so we can keep these indicators of downloaded state. But we also need a way to avoid the frustration of not knowing that a download is in progress, so, we need to add some kind of download progress indicator.

The most simple approach is something I'm sure we've all done in many apps: a blocking modal overlay with an activity indicator and a label that says "Downloading...". This is achieved with a simple `BoxView` that covers the entire screen (with `Opacity` at `0.25`), with a `Border` in the middle (I didn't want to implement a popup just for this) surrounding an activity indicator in the center and a label below it. Here's what it looks like:

:::video Source=SourceType.File FilePath='/images/posts/bdd-level-0.mp4' Width='400px' Caption='Modal overlay blcoks the UI during download'
:::
_Showing a modal overlay with an activity indicator lets the user know that a download is in progress. The label below the activity indicator provides additional context, but it doesn't give any information about the download progress itself._

This is the most basic implementation, but it does the job of letting the user know that something is happening. However, it also blocks the UI and prevents any interaction until the download is complete, which can be frustrating if the download takes a while.

## Level 1: Individual Activity Indicators

The first improvement we can make is to not block the whole UI just because one episode is downloading. Instead of a modal, we can change the download button to an `ActivityIndicator` that shows the download progress as a percentage. This way, the user can still interact with the app while the download is in progress.


:::video Source=SourceType.File FilePath='/images/posts/bdd-level-1.mp4' Width='400px' Caption='Individual activity indicators show download progress'
:::
_An `ActivityIndicator` replaces the download button while it's in progress, allowing the user to continue interacting with the app._

This is a bit better, as it doesn't block the whole app, but there are still a few problems. First, you may have noticed that _all_ download buttons are disabled while a download is in progress. The `IsEnabled` property of the button is bound to the `IsDownloaded` property of the episode (using the `InvertedBoolConverter` from the MAUI Community Toolkit), so you may not expect this to happen. However, the `Command` is bound to a `DownloadEpisodeCommand` in the ViewModel. This is generated using the `[RelayCommand]` attribute from the MVVM Community Toolkit, which handily generates the command fro the method; but by default it doesn't allow concurrent execution of async methods, so the `CanExecute` method returns `false` while the command is executing, and this supersedes the `IsEnabled` property. This means that while one episode is downloading, all other download buttons are disabled, which is not ideal.

Additionally, the user still has no idea how long the download will take, or how much progress has been made. And no way to cancel the download if they change their mind. So, let's improve this further.

## Level 2: Concurrent Downloads plus Cancel

The next step is to allow concurrent downloads, so that the user can start downloading multiple episodes at once. We can achieve this by adding the `AllowConcurrentExecutions` attribute to the `DownloadEpisodeCommand`, which allows the command to be executed multiple times concurrently. This means that each download button can be clicked independently, and the user can start downloading multiple episodes at once.

```csharp
 [RelayCommand(AllowConcurrentExecutions = true)]
 private async Task DownloadEpisode(EpisodeViewModel episode)
 {
     // Download logic here
 }
```

Using `AllowConcurrentExecution` also gives us a `CancellationToken` parameter in the command method, which we can use to cancel the download if the user changes their mind. We can add a cancel button to the download overlay that allows the user to cancel the download if they choose to do so. The episode ViewModel has an `IsDownloading` property that indicates whether the episode is currently being downloaded, and we can simply show and hide the download and cancel buttons based on this property.

:::video Source=SourceType.File FilePath='/images/posts/bdd-level-2.mp4' Width='400px' Caption='Download button shows an ActivityIndicator and a cancel button while downloading'
:::
_The download button now shows an `ActivityIndicator` while the episode is downloading, and a cancel button that allows the user to stop the download if they change their mind. The user can now start downloading multiple episodes at once, and cancel any download in progress._

This is already a big step-up in UX, as it allows the user to see that a download is in progress, and gives them the option to cancel it if they choose to do so. But to take it to the next level, we need to show the user the current download progress. This is where the fun begins.

## Level 3: Growing Progress Bar Overlay

On the web, we refer to progress indicators as "deterministic" or "indeterminate". A deterministic progress indicator shows the user how much of the task is complete, while an indeterminate progress indicator simply shows that a task is in progress without indicating how much has been completed. So far, we've been using an indeterminate progress indicator (the `ActivityIndicator`); .NET MAUI provides a `ProgressBar` control that we can use to show deterministic progress, but it doesn't really fit the theme of the Beer Driven Devs app. So, let's get creative!

:::info
I actually could absolutely have used a `ProgressBar` here, but I wanted to explore some more creative options that fit the theme of the app.
:::

In order to show the progress, though, we need to know how much of the download has been completed. The `HttpClient` class in .NET allows us to download files asynchronously, and we can use the `HttpCompletionOption.ResponseHeadersRead` option to read the response headers and get the total size of the file before the download starts. It also lets you stream progressively, rather than buffering the whole response before you can write to disk (or access the stream). We can then continually check the `response.Content.Headers.ContentLength` to get the total size of the file, and use the `HttpContent.ReadAsStreamAsync()` method to read the content as a stream. This allows us to track the progress of the download and update the UI accordingly.

To handle this, I created a `FileDownloadService` class that takes care of downloading files and reporting progress. Here's a simplified version of the code:

```csharp
public class FileDownloadService(HttpClient httpClient)
{
    public async Task DownloadFileAsync(string url, string destinationPath, IProgress<double> progress, CancellationToken cancellationToken)
    {
        using var response = await httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();

        var totalBytes = response.Content.Headers.ContentLength ?? -1L;
        var totalRead = 0L;
        var buffer = new byte[128 * 1024]; // 128 KB buffer
        var isMoreToRead = true;

        using var contentStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var fileStream = File.OpenWrite(destinationPath);

        do
        {
            var read = await contentStream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);
            if (read == 0)
            {
                isMoreToRead = false;
                progress.Report(1.0);
                continue;
            }

            await fileStream.WriteAsync(buffer.AsMemory(0, read), cancellationToken);

            totalRead += read;

            if (totalBytes != -1)
            {
                var percent = (double)totalRead / totalBytes;
                progress.Report(percent);
            }

        } while (isMoreToRead);
    }

}
```

I'm still using `HttpClientFactory` for connection pooling and management, but this service handles the download logic and reports progress back to the UI. I define a buffer, and each time we read from the stream, we write to the file and report the progress as a percentage. The `IProgress<double>` parameter allows us to report the progress back to the UI, which we can then use to update the overlay.

Showing progress with only a visual representation isn't particularly a11y friendly, so I also added a label that shows the current download progress as a percentage. The label is positioned in the middle of the thumbnail, and the overlay fills the thumbnail based on the progress. Here's how I implemented this in XAML:

```xml
<Label HorizontalOptions="Center"
       VerticalOptions="Center"
       HorizontalTextAlignment="Center"
       VerticalTextAlignment="Center"
       FontFamily="Lucide"
       TextColor="{StaticResource Amber900}"
       FontSize="36"
       IsVisible="{Binding IsDownloading}"
       Text="{Binding DownloadProgress, StringFormat='{0:P0}'}"/>

<BoxView HorizontalOptions="Start"
         VerticalOptions="End"
         IsVisible="{Binding IsDownloading}"
         WidthRequest="{Binding DownloadProgress, Converter={StaticResource ProgressToWidth}}"
         HeightRequest="4"
         BackgroundColor="{StaticResource Amber900}" />
```

The `BoxView` uses a custom `ProgressToWidth` converter to calculate the width based on the download progress. The converter simply takes the width of the view (assigned in the `OnSizeAllocated` method override) and multiplies it by the progress percentage to get the width of the overlay.

Here it is in action:

:::video Source=SourceType.File FilePath='/images/posts/bdd-level-3.mp4' Width='400px' Caption='Progress percentage and a progress bar overlay show download progress'
:::
_The download progress overlay grows across the thumbnail based on the download progress, and the percentage label shows the current progress. This provides a clear visual indication of how much of the episode has been downloaded._

This is a huge improvement in UX: it allows the user to see how much of the episode has been downloaded (and estimate how long it will take to complete). The overlay fills the thumbnail, providing a spatially meaningful representation of the download progress, and the percentage label gives the user a clear indication of how much has been downloaded.

At this stage, we have met all of our UX goals: the user can see that a download is in progress, they can cancel it if they choose to do so, and they can see how much of the episode has been downloaded. This is easily good enough for nearly any app.

...but why stop at 'good enough'? Especially when we can have some fun with it!

## Level 4: Beer Fill & Foam Finale

_What if_, instead of a simple overlay mimicking your garden variety `ProgressBar`, we had a beer glass that fills up as the download progresses? That would be a fun and engaging way to show download progress, and it fits the theme of the app perfectly.

I'm going to be honest: this is frankly ridiculous. It's over-the-top, it's completely unnecessary, and it has no real functional benefit. But I don't care. It's cool. And it looks awesome! Better than that, it fits the theme of the Beer Driven Devs app perfectly. So, let's go all out and have some fun with it.

There are probably a handful of ways to implement this, but I think the simplest cross-platform approach is to use `SkiaSharp`. In levels `0` through `3`, we used the `BoxView` and `Label` controls to create the overlay, but for this level, we need something more dynamic and visually appealing. So, we'll use `SKCanvasView` from the SkiaSharp library to draw the beer glass, fill it with beer, and create the foam effect.

The `SKCanvasView` replaces the `BoxView` that was used to dim the thumbnail. But, as the progress increases, instead of drawing the translucent gray overlay across the whole thumbnail, we draw it from the top of the thumbnail (`y = 0`) to `y - progress`, where `progress` is the current download progress as a percentage, and from `y = progress` to the bottom of the thumbnail (`y = 1`), we draw the beer glass.

:::info
The coordinates for the `SKCanvasView` work similar to a `Brush` in .NET MAUI, where `0,0` is the top-left and `1,1` is the bottom-right.
:::

The beer glass is a gradient from `amber400` to `yellow300` (taken from the [Tailwind CSS palette](https://tailwindcss.com/docs/customizing-colors#default-color-palette)), and as the progress increases, the beer 'fills the glass'.

```csharp
private void OnPaintSurface(object? sender, SKPaintSurfaceEventArgs e)
{
    var canvas = e.Surface.Canvas;
    var info = e.Info;
    canvas.Clear();

    // As the canvas starts at the top, but we want to represent progress from
    // the bottom, we need to invert the Y coordinate. The height part is easy
    // - the info gives us the height of the canvas, so we just multiply it by
    // the progress (which is a fraction) to get the Y coordinate of the top
    // of the beer fill.
    var progressY = (float)(info.Height * (1 - Progress));

    // Gray muted overlay is drawn from the top to the progress point
    using var grayPaint = new SKPaint { Color = new SKColor(128, 128, 128, 38) }; // ~15% opacity
    var grayRect = new SKRect(0, 0, info.Width, progressY);
    canvas.DrawRect(grayRect, grayPaint);


    // Beer gradient overlay is drawn from the progress point to the bottom
    // of the canvas. The gradient is drawn from amber400 to yellow300,
    // defined earlier in the class as the _gradientStart and _gradientEnd fields.
    var beerRect = new SKRect(0, progressY, info.Width, info.Height);
    using var beerPaint = new SKPaint
    {
        Shader = SKShader.CreateLinearGradient(
            new SKPoint(0, beerRect.Top),
            new SKPoint(0, beerRect.Bottom),
            [_gradientStart, _gradientEnd],
            null,
            SKShaderTileMode.Clamp)
    };
    canvas.DrawRect(beerRect, beerPaint);
}
```

Note that I faffed around trying to get the alpha right on those two colors, and in the end decided that life's too short so just defined them in the resource dictionary as `Amber400pc15` and `Yellow300pc15`. The `SKCanvasView` is set to fill the thumbnail, and the `OnPaintSurface` method is called whenever the canvas needs to be redrawn.

:::sidenote
I've found myself adapting Tailwind to .NET MAUI quite a bit lately, so I build a couple of tools to help with this. One I've released as a dotnet tool called [tailwind2xaml](https://github.com/matt-goldman/TailwindXamlThemeConverter), also available on [NuGet](https://www.nuget.org/packages/tw2x). It converts a Tailwind theme to a XAML resource dictionary (not just for .NET MAUI; you can specify which XAML UI framework you're using), which is super handy for keeping a consistent color palette across your stack. Or, y'know, getting v0 to generate a UI for you and converting it to .NET MAUI...but _that's_ another story too! (watch this space for more on that soon!)
:::

### Adding the Bubbles

This is already a _very_ cool effect, and definitely a step above the progress bar. But it still needs one small touch to make it feel like beer: bubbles! As I've already reinvented one wheel today, I'm going to use an existing tool for this. The [SKConfettiView](https://mono.github.io/SkiaSharp.Extended/api/ui-maui/skconfettiview.html) in the `SkiaSharp.Extended.UI.Maui` library is a particle system that can be used to create confetti effects, which I've actually used in more than one app, but it can also be used to create bubbles. In fact a particle system is exactly what we need to create the bubbles (if you've dabbled with game dev at all you know all about particle systems).

Unfortunately the `SKconfettiView` can't be used directly in a `SKCanvasView`, so I added a `ContentView` that's used to layer the overlay canvas and the bubbles.

```xml
<ContentView xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:controls="clr-namespace:BeerDrivenDevsApp.Controls"
             xmlns:vm="clr-namespace:BeerDrivenDevsApp.ViewModels"
             xmlns:skia="clr-namespace:SkiaSharp.Extended.UI.Controls;assembly=SkiaSharp.Extended.UI"
             x:Class="BeerDrivenDevsApp.Controls.DownloadProgress">
    <Grid x:DataType="vm:EpisodeViewModel">
        <controls:BeerProgressOverlayView Progress="{Binding DownloadProgress}"
                                          HorizontalOptions="Fill"
                                          VerticalOptions="Fill"
                                          x:Name="BeerOverlay" />

        <skia:SKConfettiView HorizontalOptions="Fill"
                             VerticalOptions="End"
                             IsAnimationEnabled="{Binding IsDownloading}"
                             x:Name="Confetti" />
    </Grid>
</ContentView>
```

The 'confetti' effect will only play when the episode is downloading - thanks to binding the `IsAnimationEnabled` property of the `SKConfettiView` to the `IsDownloading` property of the episode ViewModel. The height of the view is set to a field in the `OnSizeAllocated` method:

```csharp
protected override void OnSizeAllocated(double width, double height)
{
    base.OnSizeAllocated(width, height);

    if (height > 0)
    {
        _viewHeight = height;
    }
}
```

And a method called `SetBubblesHeight` is used to set the height of the `SKConfettiView`, and is called whenever the `DownloadProgress` property changes:

```csharp
public void SetBubblesHeight()
{
    Confetti.MaximumHeightRequest = Progress * _viewHeight;
}

private static void OnProgressChanged(BindableObject bindable, object oldValue, object newValue)
{
    if (bindable is DownloadProgress downloadProgress)
    {
        downloadProgress.SetBubblesHeight();
    }
}
```

(Note that it is not just set directly in the `OnProgressChanged` method, because we want it to respond to `OnSizeAllocated` as well, so we can set the height of the bubbles when the view is first created.)

The `SKConfettiView` is configured to emit bubbles that rise from the bottom of the screen, and we can adjust the emitter settings to create a bubble effect instead of confetti. Here's how I set it up:

```csharp
var _regularBubbleConfettiSystem = new SKConfettiSystem
{
    EmitterBounds   = SKConfettiEmitterBounds.Bottom,
    Emitter         = SKConfettiEmitter.Infinite(100, -1),
    Shapes          = [new SKConfettiCircleShape()],
    Colors          = [new Color(255, 255, 255, 60)],
    Lifetime        = 2,
    Physics         = [new SKConfettiPhysics(10, 50), new SKConfettiPhysics(5, 10), new SKConfettiPhysics(2, 20)]
};

Confetti.Systems = [_regularBubbleConfettiSystem];
```

This sets up a bubble emitter that emits bubbles from the bottom of the screen, with a lifetime of 2 seconds. The `SKConfettiCircleShape` is used to create circular bubbles, and the `SKConfettiPhysics` settings control the speed and direction of the bubbles as they rise. The colors are set to a semi-transparent white, which helps with the illusion of bubbles rising through the beer.

Want to see what this looks like? Here's a video of the final result in action:

:::video Source=SourceType.File FilePath='/images/posts/bdd-level-4_1.mp4' Width='400px' Caption='Beer glass fills up as the download progresses, and bubbles rise to the top'
:::
_The beer glass fills up as the download progresses, and bubbles rise to the top, creating a fun and engaging download progress microinteraction. The bubbles rise from the bottom of the glass, creating a realistic beer effect._

Note that the download is quite slow, so I skipped ahead a couple of times in the video so you can see the progress at different stages.

So, overkill? Absolutely. But it's fun, it fits the theme of the app perfectly, and it's definitely better than a boring old progress bar. Who says you can't combine functional UX with fun UI? If we're all going to be obsessing over our microinteractions this year, we might as well have some fun with them!

### But wait, there's more!

This already _awesome_, but what if it were _even more awesomer!?_ What if, when it reaches 100%, it overflows with foam? And the foam bubbles burst away to reveal the full episode thumbnail?

For this, I added a second `SKConfettiView`. The first one fires an event when the download reaches 100%, and this second one is used to create the foam effect. The foam bubbles are larger than the regular bubbles, and they burst away when they reach the top of the screen, revealing the full episode thumbnail underneath.

```xml
<ContentView xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:controls="clr-namespace:BeerDrivenDevsApp.Controls"
             xmlns:vm="clr-namespace:BeerDrivenDevsApp.ViewModels"
             xmlns:skia="clr-namespace:SkiaSharp.Extended.UI.Controls;assembly=SkiaSharp.Extended.UI"
             x:Class="BeerDrivenDevsApp.Controls.DownloadProgress">
    <Grid x:DataType="vm:EpisodeViewModel">
        <controls:BeerProgressOverlayView Progress="{Binding DownloadProgress}"
                                          HorizontalOptions="Fill"
                                          VerticalOptions="Fill"
                                          x:Name="BeerOverlay"
                                          AnimationCompleted="BeerProgressOverlayView_AnimationCompleted" />  <!-- This event is fired when the download reaches 100% -->

        <skia:SKConfettiView HorizontalOptions="Fill"
                             VerticalOptions="End"
                             IsAnimationEnabled="{Binding IsDownloading}"
                             x:Name="Confetti" />

        <!-- This is the second SKConfettiView that creates the foam effect -->
        <skia:SKConfettiView HorizontalOptions="Fill"
                             VerticalOptions="Fill"
                             IsAnimationEnabled="False"
                             IsVisible="False"
                             x:Name="Foam" />
    </Grid>
</ContentView>
```

The foam confetti is configured slightly differently to the regular bubbles, with larger bubbles that rise more slowly and burst when they reach the top of the screen. Here's how I set it up:

```csharp
 _foamConfettiSystem = new SKConfettiSystem
{
    EmitterBounds   = SKConfettiEmitterBounds.Bottom,
    Emitter         = SKConfettiEmitter.Infinite(800, -1),
    Shapes          = [new SKConfettiCircleShape()],
    Colors          = [new Color(255, 255, 255, 200)],
    Lifetime        = 4,
    Physics         = [
        new SKConfettiPhysics(10, 10),
        new SKConfettiPhysics(5, 10),
        new SKConfettiPhysics(2, 10),
        new SKConfettiPhysics(30, 10),
        new SKConfettiPhysics(50, 10),
        new SKConfettiPhysics(20, 10),
        new SKConfettiPhysics(100, 20)]
};

Foam.Systems = [_foamConfettiSystem];
```

The event handler enables the foam confetti when the download reaches 100%, and after it has run for a second, it fades everything out and reveals the full episode thumbnail:

```csharp
private async void BeerProgressOverlayView_AnimationCompleted(object sender, EventArgs e)
{
    if (Progress >= 1.0)
    {
        Foam.IsVisible = true;
        Foam.IsAnimationEnabled = true;
        await Task.Delay(1000); // allow some foam to be visible
        await BeerOverlay.FadeTo(0, 500, Easing.CubicInOut);
        Confetti.IsVisible = false;
        Foam.FadeTo(0, 500, Easing.CubicInOut);
    }
}
```

And without further ado, here's the final result in action:

:::video Source=SourceType.File FilePath='/images/posts/bdd-level-4_2.mp4' Width='400px' Caption='Foam bubbles burst away to reveal the full episode thumbnail'
:::
_The beer glass fills up as the download progresses, and bubbles rise to the top. When the download reaches 100%, the glass overflows with foam, and the foam bubbles burst away to reveal the full episode thumbnail underneath._

This is the final level of the download progress microinteraction, and it's definitely the most fun. It takes the concept of a progress bar to a whole new level, and it's a great example of how you can use microinteractions to create a fun and engaging user experience. The foam is...a work in progress, but it's already pretty cool, and will be even better with a few refinements.

## Explore the Repo

Each branch (level-0 through main) represents one stage of the progression. Check it out, and keep an eye out for the BDD app on your platform of choice soon!

[Beer Driven Devs App on GitHub](https://github.com/matt-goldman/BeerDrivenDevsApp)

## Last Orders

I've always considered myself a poor designer, so I keep my finger on the pulse of UI trends as much as I can. It's an area where I'm always looking to improve. This means that I often hear about the latest or predicted UI trends, and to be honest, half the time I groan and roll my eyes. Granted, the problem here is inevitably me, but sometimes I can immediately see the value, either aesthetically or functionally, and on very rare occasions, I can see both. This is one of those times.

Microinteractions are a powerful way to make your app more fun, more human, and more memorable, and they can still be deeply functional. The Beer Driven Devs app is proof that you can embrace ridiculous ideas and still deliver a great UX. When it comes to design, I’m probably perched somewhere around the Peak of Mount Stupid on the Dunning-Kruger curve. But I'm gaining confidence, and when it comes to using beer to represent download progress, I've realised with absolute certainty that it is objectively awesome, and I love it. I hope you do too!

What microinteractions will you implement to makes your users' lives easier and more fun? Let me know! In the meantime, I'm off to crack open a cold one.

🍻 Cheers!
