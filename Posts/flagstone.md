---
description: "With `FsShell`, Flagstone UI comes out of the experimental phase. This article gives you a taste of what you can do with it; but the only limit is your imagination."
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

## Why `FsShell` is important

`FsShell` may not sound like a big deal but it's a prime example of the specific reason why Flagstone UI exists.

.NET MAUI is great, but it doesn't expose the full gamut of styling capabilities at the cross-platform layer that modern apps require. They're all there, but you have to drop down to platform code to get access to them, which is a barrier for many developers, especially those coming from .NET rather than iOS or Android. Flagstone UI addresses that by lifting a common set of styling properties to the cross-platform layer.

Shell is a powerful tool. It provides opinionated routing and navigation foundations, and it's been the default for new MAUI apps for the past four years. Most apps benefit from leaning into Shell's conventions rather than fighting them.

But Shell makes an architectural choice that limits what you can build on top of it: it couples navigation and presentation. Routing, navigation state, lifecycle, and the visual chrome are the same code, as far as your app is concerned. You can't take Shell's routing without also taking Shell's UI. You can't customise the chrome without working against the framework rather than with it.

This is the reason people often say all .NET MAUI apps look like .NET MAUI apps. It's a structural problem rather than a styling one. Shell's UI is bound to its navigation, and the customisation flexibility is limited in a way you don't see in other UI frameworks. Unfortunately, you simply can't take the functional side of Shell without the UI.

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

:::video Source=SourceType.File FilePath='/images/posts/demoshell.mp4' Width='300px' Caption='The default FsShell tab bar allows you to format your tabs, this example includes an emoji instead of an icon and the title, arranged horizontally instead of vertically, with scaling and background animations'
:::
_The included `FsTabBar` allows you to style tabs with an `ItemTemplate`, just like you can with Flyout items in stock Shell._

This may not be particularly sophisticated, and to be honest the stock `FsTabBar` is intended as a reference, but it should still replace the default Shell in your apps. An `ItemTemplate` defines what the tabs look like, and that unlocks some specific things which, while trivial, are now trivial to _implement_:

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

You can see the full code in the sample app in the [Flagstone UI repo](https://github.com/matt-goldman/flagstone-ui).

## Action buttons

The tab bar navigation paradigm is ubiquitous on mobile. One of its most common features, an action button in the middle of the bar that performs an action rather than navigating, is a trivial layout to achieve in a `ContentView`, so with `FsShell` that's exactly what you do.

Let's take a look at _Instagrim_, a halloween themed social photos app:

:::video Source=SourceType.File FilePath='/images/posts/instagrim.mp4' Width='300px' Caption='The Instagrim app has a large action button in the middle of the tab bar, featuring a camera icon, making it obvious it activates the camera rather than navigating the app. One of the tabs also has a badge with a notification app.'
:::
_A custom `IFsTabBar` implementation that features an action button and a notification badge_

The Instagrim app actually showcases two common UX paradigms:

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

* First, you'll notice a placeholder tab for the action button. I'll show you how I handle that later. There are other ways to solve this, but this was a quick pragmatic choice.
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

With `FsShell`, you can easily implement common UI/UX paradigms, and as you can see, it's all just bog-standard, cross-platform .NET MAUI code.

The full code is available [here](https://github.com/matt-goldman/instagrim).

## Toward more...interesting...navigation

I started out with grand ambitions of wacky and interesting navigation examples, like the rotary dial and radial menu I mentioned, but time makes fools of us all. Still, I wanted to do something at least a little out of the ordinary, and as it happens I also wanted to revive the Beer Driven Devs app I used to [demo some cool micro interactions for last year's MAUI UI July](/posts/bdd-app-downloads).

For the BDD app, I wanted a media player to occupy the space at the bottom of the screen typically taken up by the tab bar. This is also a common UX paradigm for audio apps (music, podcasts, audio books, etc). So I needed somewhere else to put the navigation UI. Here's how I did it:

:::video Source=SourceType.File FilePath='/images/posts/bdd.mp4' Width='300px' Caption='The bottom bar in the BDD app is a media player, and the navigation is handled by an expander (from the Community Toolkit)'
:::
_A fully custom navigation UI that utilises the Shell functionality_

If you look at the video, you can see the play/pause state is fully syncrhonised between the button on the bottom bar and the buttons on individual episode cards. The button in the bottom right shows a vertically stacked nav menu that automatically hides as you navigate. And the player is persistent.

This one is obviously a bit bigger, so I won't go through the whole implementation here, but the actual Shell specific part is still very simple:

```xml
<?xml version="1.0" encoding="utf-8"?>
<fs:FsTabBarBase xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:fs="clr-namespace:FlagstoneUI.Core.Controls;assembly=FlagstoneUI.Core"
             xmlns:controls="clr-namespace:BeerDrivenDevsApp.Controls"
             BackgroundColor="Transparent"
             xmlns:toolkit="http://schemas.microsoft.com/dotnet/2022/maui/toolkit"
             x:Class="BeerDrivenDevsApp.Controls.BddTabBar">
    <fs:FsTabBarBase.ItemTemplate>
        <DataTemplate x:DataType="fs:FsTabContext">
            <Grid>
            <VisualStateManager.VisualStateGroups>
                <VisualStateGroup x:Name="CommonStates">
                    <VisualState x:Name="Unselected">
                        <VisualState.Setters>
                            <Setter TargetName="TabBorder" Property="Border.StrokeThickness" Value="0"/>
                        </VisualState.Setters>
                    </VisualState>
                    <VisualState x:Name="Selected">
                        <VisualState.Setters>
                            <Setter TargetName="TabBorder" Property="Border.StrokeThickness" Value="1"/>
                        </VisualState.Setters>
                    </VisualState>
                </VisualStateGroup>
            </VisualStateManager.VisualStateGroups>
            <Border StrokeThickness="0"
                    StrokeShape="RoundRectangle 20"
                    Padding="5"
                    x:Name="TabBorder"
                    Stroke="{DynamicResource Amber300}">
                <HorizontalStackLayout HorizontalOptions="Fill"
                                       Spacing="5">
                    <Image VerticalOptions="Center"
                           HorizontalOptions="Center"
                           Source="{Binding Icon}"/>
                    <Label Text="{Binding Title}"
                           FontSize="32"
                           TextColor="{DynamicResource Amber950}"
                           VerticalOptions="Center"
                           VerticalTextAlignment="Center"/>
                </HorizontalStackLayout>
            </Border>
            </Grid>
        </DataTemplate>
    </fs:FsTabBarBase.ItemTemplate>
    <Grid>
        <Border ...>
            <!-- The media player controls go here -->
        </Border>
            
        <toolkit:Expander VerticalOptions="End"
                          HorizontalOptions="End"
                          Direction="Up"
                          Margin="10,0,15,15"
                          ExpandedChanged="Expander_OnExpandedChanged"
                          x:Name="NavExpander">
            <toolkit:Expander.Header>
                <Border HeightRequest="50"
                        WidthRequest="50"
                        StrokeShape="Ellipse"
                        Background="{StaticResource BackgroundGradient}"
                        HorizontalOptions="End">
                             <Label Text="{x:Static controls:Icons.ChevronsUp}"
                                    FontFamily="Lucide"
                                    HorizontalOptions="Center"
                                    VerticalOptions="Center"
                                    FontSize="24"
                                    x:Name="ChevronLabel"/>
                </Border>
            </toolkit:Expander.Header>
            <Border Stroke="{DynamicResource Amber300}"
                    StrokeShape="RoundRectangle 20"
                    BackgroundColor="{DynamicResource Amber100}"
                    Margin="0,0,0,15"
                    Padding="10">
                <VerticalStackLayout x:Name="TabBar"
                                     Spacing="15"
                                     TranslationY="300"
                                     BackgroundColor="{DynamicResource Amber100}" />
            </Border>
        </toolkit:Expander>
    </Grid>
</fs:FsTabBarBase>
```

You can see that logically this is identical to the others - you have a data template that defines your tabs' appearance (in this case, horizontally arranged, with an icon and text), and a layout to host them. In this case it's the `VerticalStackLayout` inside the `Expander`: it's named `TabBar`, and in the code behind we can see it's returned by the `TabLayout` property:

```csharp
using CommunityToolkit.Maui.Core;
using FlagstoneUI.Core.Controls;

namespace BeerDrivenDevsApp.Controls;

public partial class BddTabBar : FsTabBarBase
{
    public BddTabBar()
    {
        InitializeComponent();
        InitializeTabContainer();
    }

    protected override Layout TabContainer => TabBar;

    private void Expander_OnExpandedChanged(object? sender, ExpandedChangedEventArgs e)
    {
        _ = e.IsExpanded ? OpenNav() : CloseNav();
    }

    public void HandleNavigated()
    {
        _ = CloseNav();
    }

    private async Task OpenNav()
    {
        var rotateTask = ChevronLabel.RotateToAsync(180);
        var tabTask = TabBar.TranslateToAsync(0, 0);
        await Task.WhenAll(rotateTask, tabTask);
    }

    private async Task CloseNav()
    {
        var rotateTask = ChevronLabel.RotateToAsync(0);
        var tabTask = TabBar.TranslateToAsync(0, 300);
        await Task.WhenAll(rotateTask, tabTask);
        NavExpander.IsExpanded = false;
    }
}
```

This follows the same pattern of returning the appropriate layout via the `TabContainer` property, and calling the `InitializeTabContainer()` base method in the constructor.

There are a few other things going on here but as you can see none of these are exotic, just standard view manipulation you'd expect to be able to do anywhere in a .NET MAUI app. And that's the point.

There's obviously a lot more I haven't shown here, covering the media playing specifically. But that's not specific to the custom Shell implementation (it's in place of it), so I won't go through it here. But you can see it, along with everything else in full, in the [Beer Driven Devs app repo](https://github.com/matt-goldman/BeerDrivenDevsApp).

## What next?

I know you're itching to try this yourself, so if you've maintained enough discipline to get to here without dropping everything and building your own `FsShell` app, congratulations! But you can go and do that now :)

As mentioned you can see all the code, docs, and the sample app in the [Flagstone UI repo](https://github.com/matt-goldman/flagstone-ui).

Or you can just install it into your app and start playing with it:

```bash
dotnet add package FlagstoneUI.Core --version 2.0.4
```

There's more to see than just `FsShell` - Flagstone UI let's you do anything. The examples here mostly show `FsShell`, but the sample app in the rpeo has a complete controls showcase. You can also see a more complete, real-world inspired app called [MyContoso](https://github.com/matt-goldman/MyContoso). It was created as a demo for a talk at [MAUI Dau](https://mauiday.net/), but it's based on requirements (and problems) from actual client projects. It's not especially exciting but is a comprehensive showcase of Flagstone UI in action.

So what will you build?

## A challenge

Today is the first of July. Why not pick up Flagstone UI and `FsShell` and see if you can use it to replicate a popular app? If you write it up or record a video before the end of the month, let me know, and I'll include it on the official MAUI UI July calendar.
