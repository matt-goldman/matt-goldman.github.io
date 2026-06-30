---
description: "."
title:  "Flagstone UI goes GA with FsShell"
date:   2026-07-01 00:00:01 +1000
image:  /images/posts/flagstoneui.png
tags:   [mobile, maui, ui]
categories: [.NET, Mobile]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

## Welcome MAUI UI July and Flagstone UI!

Welcome to MAUI UI July 2026! I'm kicking things off with a celebration: Flagstone UI is now generally available.

It's been around for a while, some of you may even be using it, and it's been stable. I haven't and am not planning to make any breaking changes to the API, but I've been reluctant to remove the "experimental" caveat because it has felt incomplete. But the latest release includes a new control, `FsShell`, which to me elevates Flagstone UI to a full and valuable addition to any .NET MAUI app.

`FsShell` may not sound like a big deal but it's a prime example of the specific reason why Flagstone UI exists. .NET MAUI is great, but it doesn't expose the full gamut of styling capabilities at the cross-platform layer that modern apps require. They're all there, but you have to drop down to platform code to get access to them, which for many developers, especially those coming from .NET rather than iOS or Android, defeats the purpose. Flagstone UI addresses that by lifting a common set of styling properties to the cross-platform layer.

Shell is a powerful tool, providing opinionated routing and navigation foundations, and for the past four years it has been included in the default .NET MAUI app template. But Shell has a few problems:

* Routes are magic strings, which turns navigation from strongly-typed to stringly typed. `FsShell` doesn't help with that (but `[Plugin.Maui.SmartNavigation](https://github.com/matt-goldman/Plugin.Maui.SmartNavigation/)` does).
* It's opinionated about routing and navigation, which is good, but it's also opinionated about UI, which is not. This is exacerbated by:
* It couples navigation and presentation. This is the biggest problem.

The second two points are arguably two sides of the same coin, either way it's a big problem. Common complaints about .NET MAUI apps looking like .NET MAUI apps come from this. You have very limited styling options with Shell, and you can't wholesale lift out the UI and replace it with your own while still using the built-in routing and navigation framework.

Well, you _couldn't_; you can now.

Much like the other controls in Flagstone UI, `FsShell` doesn't try to give you a stylish looking Shell replacement, instead it completely decouples presentation from navigation. You can use everything you get with Shell (routes, navigation state, everything) and use your own UI for the presentation, fully built in cross-platform .NET MAUI (XAML or C#). With that said it does come with a relatively straightforward tab bar out of the box, it's not overly sophisticated but it gives you an `ItemTemplate` for tabs; something stock Shell only gives you for flyout items. It also provides some primitives for building your own Shell navigation UI so you don't have to start completely from scratch.

In a sense, you can think of Flagstone UI as being analogous to Tailwind. It's not a control library, but rather a styling surface that gives you more control, and gives you the tools you need to build your UI using .NET MAUI rather than platform code wrapped in C#.

In this post I'll show you three apps that show what that means in practice. One that uses `FsShell` to improve on the standard tab bar, one that uses it to reach patterns stock Shell can't, and one that uses it to build navigation that nothing off-the-shelf would have given you.

This article includes code snippets, but it's more showcase than documentation. You can find full docs, including tutorials, [in the repo](https://github.com/matt-goldman/flagstone-ui).

## What is FsShell?

It's a sub-classed, drop-in replacement for `Shell` in .NET MAUI apps. You can add the Flagstone UI nuget package to your app, and change the `AppShell` base class to `FsShell` and do nothing else and it will work identically. Except now you'll be able to style your tabs, without creating your own custom tab bar.

Or you can create your own custom tab bar, or in fact not use a tab bar at all - it's just a `ContentView`, so you could use something else entirely for navigation - a floating radial menu, a rotary telephone dial (note to self: that's cool, I'm gonna do that), literally anything you can imagine.

## A better tab bar

If you do nothing else, you should replace Shell in your app with `FsShell`. Even if you don't need a fancy tab bar or bespoke navigation. Why? Well, take a look at this:

:::video Source=SourceType.File FilePath='/images/posts/demoshell.mp4' Width='600px' Caption='The default FsShell tab bar allows you to format your tabs, this example includes an emoji instead of an icon and the title, arranged horizontally instead of vertically, with scaling and background animations'
:::
_The included `FsTabBar` allows you to style tabs with an `ItemTemplate`, just like you can with Flyout items in stock Shell._

This may not be particularly sophisticated, and to be honest the stock `FsTabBar` is intended as a reference, but it should still replace the default Shell in your apps. An `ItemTemplate` defines what the tabs look like, and you can see three things in this example that you can't do with stock Shell but are trivial here:

* The layout of the tab is horizontal instead of vertical
* The icon (emoji) changes based on selected state
* The icon and text scale based on selected state
* A background shape animates to the selected tab

Those last two could be combined to create a refraction/glassmorphic effect, if you're into that sort of thing.

This whole thing was easy enough. As mentioned above subclass `FsShell` instead of `Shell`:

```csharp
using FlagstoneUI.Core.Controls;

namespace FlagstoneUI.SampleApp;

public partial class AppShell : FsShell
{
	public AppShell()
	{
		InitializeComponent();
	}
}
```

Update the XAML too:

```xml
<fs:FsShell
  x:Class="FlagstoneUI.SampleApp.DemoShell"
  xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
  xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
  xmlns:fs="clr-namespace:FlagstoneUI.Core.Controls;assembly=FlagstoneUI.Core"
  Title="FlagstoneUI.SampleApp">
  <!-- ... -->
</fs:FsShell>
```

Define an `ItemTemplate` for the tabs. Note I use `VisualStateManager`l `FsShell` exposes some custom states to assist here.

```xml
<fs:FsShell.TabBarItemTemplate>
<DataTemplate>
    <HorizontalStackLayout Spacing="4"
                           Padding="12,8"
                           HorizontalOptions="Center"
                           x:DataType="fs:FsTabContext">
    <VisualStateManager.VisualStateGroups>
        <VisualStateGroup x:Name="CommonStates">
        <VisualState x:Name="Unselected">
            <VisualState.Setters>
            <Setter Property="Scale" Value="1" />
            <Setter TargetName="IconLabel" Property="Label.Text" Value="🙈"/>
            <Setter TargetName="TabLabel" Property="Label.FontAttributes" Value="None"/>
            </VisualState.Setters>
        </VisualState>
        <VisualState x:Name="Selected">
            <VisualState.Setters>
            <Setter Property="Scale" Value="1.3" />
            <Setter TargetName="IconLabel" Property="Label.Text" Value="🐵"/>
            <Setter TargetName="TabLabel" Property="Label.FontAttributes" Value="Bold"/>
            </VisualState.Setters>
        </VisualState>
        </VisualStateGroup>
    </VisualStateManager.VisualStateGroups>
    <Label Text="🙈"
            FontSize="14"
            x:Name="IconLabel"/>
    <Label Text="{Binding Title}" FontSize="14"
            x:Name="TabLabel"/>
    </HorizontalStackLayout>
</DataTemplate>
</fs:FsShell.TabBarItemTemplate>
```

`FsTabBarContext` is assigned automatically by `FsShell` and includes metadata about the specific tab state, like route, title, and whether it's selected or not.

That's it. The rest of the Shell file remains identical. The background shape animation and colour are handled by the stock `FsTabBar`, and are backed by bindable properties that you can set in the header too.

Simple. Even without creating your own tab bar, you already have styling control over your tabs that you don't get with Shell.

## Action buttons

The tab bar navigation paradigm is ubiquitous on mobile. You'd recognise it anywhere, and one of its most common features is not possible in .NET MAUI out of the box, and that's an _action button_. I'm talking about a button in the middle of the navigation bar, that doesn't navigate but performs an action instead.

Let's take a look at _Instagrim_, a halloween themed social photos app:

:::video Source=SourceType.File FilePath='/images/posts/instagrim.mp4' Width='600px' Caption='The Instagrim app has a large action button in the middle of the tab bar, featuring a camera icon, making it obvious it activates the camera rather than navigating the app. One of the tabs also has a badge with a notification app.'
:::
_A custom `IFsTabBar` implementation that features an action button and a notification badge_

The Instagrim app demonstrates a couple of things you can't do with a stock Shell:

* the aforementioned action button
* A notification count badge on one of the tabs

Implementation is a bit trickier, this requires a fill custom `ContentView` to replace the tab bar. This is a bindable property in `FsShell` which allows you to replace the default `FsTabBar`:


```xml
<fs:FsShell
    x:Class="instagrim.AppShell"
    xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
    xmlns:pages="clr-namespace:instagrim.Pages"
    xmlns:controls="clr-namespace:instagrim.Controls"
    xmlns:fs="clr-namespace:FlagstoneUI.Core.Controls;assembly=FlagstoneUI.Core"
    NavBarIsVisible="False"
    TabBarIsDocked="False"
    Title="instagrim">
    <fs:FsShell.TabBar>  <!-- Add this -->
        <controls:NavBar />
    </fs:FsShell.TabBar>
    <TabBar>
        <ShellContent
            Title="Feed"
            ContentTemplate="{DataTemplate pages:FeedPage}"
            Route="feed" />
        
        <ShellContent
            Title="Discover"
            ContentTemplate="{DataTemplate pages:DiscoverPage}"
            Route="discover" />
        
        <!-- no content, reserves space for the action button -->
        <ShellContent
            Title="Action"
            Route="action" />
        
        <ShellContent
            Title="Hauntings"
            ContentTemplate="{DataTemplate pages:HauntingsPage}"
            Route="hauntings" />
        
        <ShellContent
            Title="Profile"
            ContentTemplate="{DataTemplate pages:ProfilePage}"
            Route="profile" />
    </TabBar>

</fs:FsShell>
```

You can see that everything else is essentially the same. A couple of other things to note here:

* First the elephant in the room: yep I have a do nothing tab in the middle to create space for the action button. That's a hack, but the alternatives were hackier. I'll show you how I handle that later. There are other ways to solve this, i just didn't have the motivation (or time) for those.
* You can see there's a bindable property `TabBarIsDocked` here that is set to `False`. That's not strictly necessary - the default is `True` which anchors the nav bar to the bottom of the screen, and even though this tab bar is at the bottom, when `True` it gets rendered inside the app's OS native tab bar space; when false it's just a `ContentView` rendered over the top of your UI, which as I said above can be anything. But the reason I set it to false here is because doing so allows me to place the `ImageButton` for the camera outside the hit target boundary of the bar. (This is more important in the next example).

The custom tab bar defines the presentation, but Shell is still responsible for the app hierarchy definition, routing, and navigation. We've decoupled presentation and functionality.

The `TabBar` control itself is pretty straightforward. I'll show the code-behind:

```csharp
using FlagstoneUI.Core.Controls;
using instagrim.Pages;

namespace instagrim.Controls;

public partial class NavBar : FsTabBarBase
{
    public NavBar()
    {
        InitializeComponent();
        InitializeTabContainer();
    }

    protected override Layout TabContainer => Tabs;

    protected override void OnTabTapped(FsTabContext context)
    {
        if (context.Title == "Action")
        {
            return;
        }
        
        base.OnTabTapped(context);
    }

    private async void ActionButton_OnClicked(object? sender, EventArgs e)
    {
        var page = Application.Current!.Windows[0].Page!;
        if (DeviceInfo.Current.Platform == DevicePlatform.iOS && DeviceInfo.Current.DeviceType == DeviceType.Virtual)
        {
            await page.DisplayAlertAsync("Camera not available", "Camera is not available on simulator", "OK");
        }
        else
        {
            await page.Navigation.PushModalAsync(new NavigationPage(new CameraPage()));
        }
    }
}
```

A few things to point out here:

* You can see it inherits `FsTabBarBase`; strictly you don't need this, you just need to implement `IFsTabBar`. But `FsTabBarBase` has all the plumbing you would need for pretty much any navigation UI I can think of, but you don't have to use it if you have something exotic.
* The constructor calls `InitializeTabBarContainer()`, this is necessary to register the tabs with `FsShell`. I think I will likely move this in future so you just call `base()`, but for now you need to call it.
* You have to provide a `Layout` called `TabContainer`. This is required by `FsShell` and defined on the `IFsTabBar` interface, and is what `FsShell` looks for to render the tabs.
* You can see I'm overriding the `OnTabTapped` method here, and essentially just doing nothing if the tab's title is "Action". That's the hack

:::note
Fun fact: I tried using the route property as a more definitive reference but turns out Shell injects a prefix. I could have adapted to that but decided instead to match the canonical value from my Shell.
:::

* And of course the event handler for the action button.

The view code is actually also not particularly complex:

```xml
<?xml version="1.0" encoding="utf-8"?>
<fs:FsTabBarBase xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
                 xmlns:fs="clr-namespace:FlagstoneUI.Core.Controls;assembly=FlagstoneUI.Core"
                 xmlns:icons="clr-namespace:Plugin.Maui.Lucide.Controls;assembly=Plugin.Maui.Lucide"
                 xmlns:converters="clr-namespace:instagrim.Converters"
                 xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
                 xmlns:mct="http://schemas.microsoft.com/dotnet/2022/maui/toolkit"
                 x:Class="instagrim.Controls.NavBar">
    <fs:FsTabBarBase.Resources>
        <converters:TitleToGlyphConverter x:Key="TitleToGlyph" />
        <converters:TitleToIsVisibleConverter x:Key="TitleToVisible" />
        <mct:IsEqualConverter x:Key="IsEqual" />
    </fs:FsTabBarBase.Resources>
    <fs:FsTabBarBase.ItemTemplate>
        <DataTemplate x:DataType="fs:FsTabContext">
            <Grid MinimumWidthRequest="50">
                <VisualStateManager.VisualStateGroups>
                    <VisualStateGroup x:Name="CommonStates">
                        <VisualState x:Name="Unselected">
                            <VisualState.Setters>
                                <Setter TargetName="IconImage" Property="icons:Icon.Color" Value="White"/>
                            </VisualState.Setters>
                        </VisualState>
                        <VisualState x:Name="Selected">
                            <VisualState.Setters>
                                <Setter TargetName="IconImage" Property="icons:Icon.Color" Value="{DynamicResource Primary}"/>
                            </VisualState.Setters>
                        </VisualState>
                    </VisualStateGroup>
                </VisualStateManager.VisualStateGroups>
                <Grid HorizontalOptions="Center"
                      VerticalOptions="Center">
                    <icons:Icon HorizontalOptions="Center"
                                IsVisible="{Binding Title, Converter={StaticResource TitleToVisible}}"
                                Name="{Binding Title, Converter={StaticResource TitleToGlyph}}"
                                Color="White"
                                Size="36"
                                x:Name="IconImage"/>
                    <Border HorizontalOptions="End"
                            VerticalOptions="Start"
                            StrokeShape="Ellipse"
                            StrokeThickness="0"
                            HeightRequest="20"
                            WidthRequest="20"
                            TranslationX="5"
                            TranslationY="-5"
                            Background="{DynamicResource Accent}"
                            IsVisible="{Binding Title, Converter={StaticResource IsEqual}, ConverterParameter='Hauntings'}">
                        <Label HorizontalOptions="Center"
                               VerticalOptions="Center"
                               HorizontalTextAlignment="Center"
                               VerticalTextAlignment="Center"
                               FontAttributes="Bold"
                               FontFamily="OpenSansSemibold"
                               FontSize="12"
                               Text="6" />
                    </Border>
                </Grid>
            </Grid>
        </DataTemplate>
    </fs:FsTabBarBase.ItemTemplate>
    <Grid Margin="0"
          Padding="0"
          VerticalOptions="End"
          HorizontalOptions="Fill"
          BackgroundColor="{DynamicResource Background}">
        <BoxView Color="{DynamicResource Border}"
                 HeightRequest="1"
                 HorizontalOptions="Fill"
                 VerticalOptions="Start"/>
        <FlexLayout x:Name="Tabs"
                    Direction="Row"
                    HorizontalOptions="Fill"
                    VerticalOptions="Center"
                    JustifyContent="SpaceAround"
                    AlignContent="Center"
                    AlignItems="Center"
                    HeightRequest="70">
        
        </FlexLayout>
        
        <ImageButton VerticalOptions="Center"
                     HorizontalOptions="Center"
                     WidthRequest="80"
                     HeightRequest="80"
                     CornerRadius="40"
                     TranslationY="-40"
                     BackgroundColor="{DynamicResource Primary}"
                     BorderColor="{DynamicResource PrimaryForeground}"
                     BorderWidth="3"
                     Padding="20"
                     Source="{FontImageSource FontFamily=Lucide,
                                              Glyph={StaticResource Camera},
                                              Color={DynamicResource PrimaryForeground}}"
                     x:Name="ActionButton"
                     Clicked="ActionButton_OnClicked">
            <ImageButton.Shadow>
                <Shadow Brush="{DynamicResource PrimaryBrush}" Offset="0,0" Radius="20" Opacity="0.9" />
            </ImageButton.Shadow>
        </ImageButton>
    </Grid>
</fs:FsTabBarBase>
```

In fact it's dead simple. It's a `FlexLayout` in a `Grid` with an `ImageButton` overlaid in the middle. That's it, that and the `ItemTemplate` with `VisualStateManager`, but that's not particularly exotic. The only thing of note here is the badge, which you can see is mocked but easy enough to wire up to some state; and we'll see a working example of that in the next sample.

With `FsShell`, you can easily implement a common UI/UX paradigm that is impossible out of the box without platform code. And as you can see, it's all just bog-standard, cross-platform .NET MAUI code.


1. Case study three: Beer Driven Devs (500-600 words)
Purpose: Show the upper end of what's possible — fully custom navigation that no off-the-shelf solution could provide.
Beats:

Design intent: a podcast app with a persistent media player. The player needs to live in the navigation chrome (so it stays visible during navigation) and needs to expand into a full-screen now-playing view. Below it, navigation needs to be vertically oriented because the layout suits it better than tabs.
The obstacle: stock Shell doesn't support custom navigation orientations at all. Adding a persistent media player on top of Shell is a fight — Shell wants to own the chrome, and putting anything in the chrome that Shell didn't put there means working against the framework rather than with it.
What FsShell gives you: the navigation chrome as a composable surface, not an opaque control. You can put what you need where you need it, and the navigation logic doesn't fight you.
Visual: clip showing the BDD app — playback continuing across navigation, expanding player view, vertical nav behaviour.
The takeaway sentence: when stock navigation isn't an option, FsShell isn't a workaround. It's the right tool.

5. The throughline (200-300 words)
Purpose: Tie the three case studies together with the bigger point.
Beats:

The three case studies sit on a progression: vanilla-but-better, conventional-but-richer, fully-custom.
Same library, same primitives, three completely different navigation outcomes. That's the point of FsShell — it doesn't push you toward one design. It gets out of the way of whatever design you've already decided on.
The "production-ready" milestone isn't about FsShell becoming feature-complete. It's about FsShell being trustworthy enough that you can build real apps on it without hedging.
(Optional: nod to the broader Flagstone UI ecosystem, since FsShell elevating to production is what unlocks the rest.)

6. Where to go from here (100-150 words)
Purpose: Send the reader somewhere useful without padding.
Beats:

Link to docs for the how-to.
Link to the repo / NuGet.
One or two lines about what's next (without committing to a roadmap you don't want to commit to).
If you're doing a livestream later in July, mention it briefly here as a deeper dive.

