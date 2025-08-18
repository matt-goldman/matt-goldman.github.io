---
description: "Latest improvements to PageResolver for .NET MAUI, making MVVM setup easier with automatic view and ViewModel resolution through dependency injection."
title:  "PageResolver Updates – The Missing Piece of .NET MAUI, Now Ready for .NET 9!"
date:   2024-11-11 00:00:01 +1000
image:  /images/posts//page-resolver-updates.png
tags:   [mobile, maui, ui, di]
categories: [.NET, Mobile, UI, UX, DI]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

## Introduction

With the launch of .NET 9, now is the perfect time to introduce the latest improvements to PageResolver! While it's aligned with .NET LTS releases, PageResolver remains fully compatible with .NET 9, ready to support developers exploring the latest features. Designed to be the easiest way to set up MVVM in .NET MAUI, PageResolver pairs perfectly with the MVVM CommunityToolkit and MAUI CommunityToolkit to provide a solid baseline for any app, without the need for a heavyweight MVVM framework.

## What is PageResolver?

PageResolver simplifies hierarchical navigation in .NET MAUI apps, providing automatic view and ViewModel resolution with dependency injection, enabling you to leverage the MVVM pattern without abandoning the default navigation patterns. It's a productivity booster for developers who want to avoid boilerplate and focus on building great features.

As an example, let's say you have a view called `ProfilePage` and a corresponding ViewModel called `ProfileViewModel`. With PageResolver, you can navigate to `ProfilePage` and have `ProfileViewModel` automatically resolved and injected into the page, including the ViewModel's dependencies as well (e.g. an `IProfileService` abstraction). This eliminates the need for manual wiring and makes your code cleaner and more maintainable.

These might be setup like this:

```csharp
public class ProfilePage : ContentPage
{
    public ProfilePage(ProfileViewModel viewModel)
    {
        BindingContext = viewModel;
    }
}

public class ProfileViewModel
{
    public ProfileViewModel(IProfileService profileService)
    {
        profileService = profileService;
    }

    public IProfileService profileService { get; }
}

public class ProfileService : IProfileService
{
    // Implementation
}
```

If you're using Shell, this will work out of the box. But for apps using hierarchical navigation, or even if you're using modals or popups (more on this later), you would have to instantiate your views and pass your dependencies to them in the caller, or use a service locator to resolve your view models. This is obviously riddled with code smells and anti-patterns, but with PageResolver, you can simply navigate by type instead of by instance, and let PageResolver handle the rest.

```csharp
await Navigation.PushAsync<ProfilePage>();
```

## New Features in PageResolver

PageResolver has added several powerful features to further streamline the MVVM setup in .NET MAUI, even for more complex setups like popups, modals, or custom navigation patterns.

### Parameterized Constructors

Sometimes you need to pass data to your pages (or to their binding context). In Shell, you can use a combination of query parameters or the navigation state dictionary. With PageResolver, you can use parameterised constructors in your pages and view models, making it straightforward to pass values alongside injected dependencies directly as part of the navigation call.

```csharp
public class ProfilePage : ContentPage
{
    // In this example userId is a Page parameter
    // But it works the same way for ViewModels
    public ProfilePage(ProfileViewModel viewModel, string userId)
    {
        BindingContext = viewModel;
    }
}

/// Navigate with parameters:

await Navigation.PushAsync<ProfilePage>("123");
```

PageResolver automatically injects registered dependencies into your Pages and ViewModels, so you don't need to pass these as navigation arguments. Other values are passed to either the Page or ViewModel, matched based on constructor parameters.

### XAML Markup Extensions for Dependency Resolution

With XAML markup extensions, you can now resolve dependencies directly within your XAML, allowing you to declare view models with dependencies in a more expressive way. This might align better with your coding style, but is especially useful for complex views or custom controls.

```xml
<ContentPage xmlns:local="clr-namespace:MyApp"
             xmlns:resolver="clr-namespace:Maui.Plugins.PageResolver;assembly=Maui.Plugins.PageResolver"
             xmlns:vm="clr-namespace:MyApp.ViewModels"
             BindingContext="{resolver:ResolveViewModel x:TypeArguments=vm:ProfileViewModel}">
    <!-- Page Content -->
</ContentPage>
```

This page (or any other view) will have its ViewModel resolved and injected automatically, without the need for manual wiring, and set as the binding context.

### Automatic Dependency Registration

Dependency Injection is a core part of any modern app, but it requires a lot of boilerplate to set up. PageResolver uses a source generator to automatically register your pages, ViewModels, and services and remove the need for this boilerplate. Using a conventions-based approach, PageResolver scans your assemblies for classes that match specific criteria and registers them with the dependency injection container. Unlike with reflection-based approaches, this is done at compile time, so there's no performance overhead. This eliminates the need for manual registration, making your code cleaner and more maintainable.

**Before:**

```csharp
namespace MyApp
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            })
            .UsePageResolver();

            builder.Services.AddSingleton<IMyService, MyService>();
            builder.Services.AddTransient<MyViewModel>();
            builder.Services.AddTransient<MyPage>();
            builder.Services.UsePageResolver();

            // etc.

            return builder.Build();
        }
    }
}
```

**After:**

```csharp
namespace MyApp
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            })
            .UseAutodependencies();

            return builder.Build();
        }
    }
}
```

### Explicit Registration with Attributes

Customise how your components are registered with attributes. Dependency registration commonly follows a familiar pattern, so the PageResolver conventions are intended as "sensible defaults," but they may not be appropriate for every scenario. You can override these by using attributes to specify the lifetime of your dependencies, or even prevent them from being registered at all.

```csharp
// Services are registered as singletons by default
// This service will be registered as a transient service
[Transient]
public class ProfileService : IProfileService
{
    // Implementation
}

// ViewModels are registered as transient by default
// This ViewModel will be registered as a singleton
[Singleton]
public class ProfileViewModel
{
    public ProfileViewModel(IProfileService profileService)
    {
        profileService = profileService;
    }

    public IProfileService profileService { get; }
}

// Pages are registered as transient by default
// This page will not be registered
// Note this would break if combined with the above example
[Ignore]
public class ProfilePage : ContentPage
{
    public ProfilePage(ProfileViewModel viewModel)
    {
        BindingContext = viewModel;
    }
}
```

There is no need to use these attributes in most cases, but they are available if you need them. The default conventions should work for most scenarios.

:::info
**Note:** `Scoped` is not supported by either the conventions or the attributes, as it doesn't make sense in the context of a mobile app. There's no request pipeline to scope to, so it's not a useful concept in this context.
:::

### Mopups Integration

PageResolver now has extensions available for use with the popular Mopups library, making it simple to integrate popups. While you could previously use the XAML markup extensions to support your popups, the new Mopups integration provides a more streamlined approach and allows you to call your popups directly from your ViewModels.

```csharp
return MopupService.Instance.PushAsync<MyPopup>();

// or with a parameter
return MopupService.Instance.PushAsync<MyPopup>("It's alive!");
```

### Community Contributions

While PageResolver started as an experiment to see whether navigation could work in .NET MAUI the way I personally believed it should, it seems to have resonated with the community. Many people are using it to simplify their MVVM setup, and many have contributed to its growth, through feedback, bug reports, discussions, and even code contributions. This has been instrumental in keeping the momentum going and ensuring that PageResolver remains a valuable tool for the community, especially during the past year when I've been unable to dedicate as much time to it as I would have liked.

A huge thank you to everyone who has contributed to PageResolver, whether through code, discussions, feedback, or even simply using it in your projects!

## Looking Ahead

With .NET 10 on the horizon, there are some changes coming to look out for. These will be breaking changes, but by aligning these with LTS releases, and announcing these now, I hope to give you plenty of time to prepare for them.

* **.NET 10 Support:** PageResolver will continue to support the latest .NET LTS releases, including .NET 10. With the LTS release the minimum version will be changed.
* **Manually triggered source generation:** The source generator is designed to be seamless and automatic, but there are scenarios where you might want to trigger it manually. As an immediate workaround, you can use a `[NoAutoDependencies]` attribute on your `MauiProgram` class to prevent it from generating the dependency registrations. I think this should work the other way around, but didn't want to introduce a breaking change at this stage. So, for .NET 10, ths will be reversed. You'll still need to chain `UseAutoDependencies()` to your `MauiAppBuilder` as this passes the service registrations to the DI container, but you'll also need to add a `[AutoDependencies]` attribute to your `MauiProgram` class. This allows a more explicit intentionality, which is more of a 'sensible default' approach.
* **Potential name and namespace change:** The namespace will be updated to align with .NET MAUI plugin conventions. PageResolver was created before the first version of .NET MAUI was released, and name reservations on NuGet were still unclear (and in fairness I was overeager to publish it). The in-code namespace will change from `Maui.Plugins.PageResolver` to `Plugin.Maui.PageResolver` which is the standard. Additionally, I'm also considering renaming the package. "PageResolver" clearly reflects what it does at its core, but I feel like it's too narrow in scope. Even putting aside the extra functionality, without at the very least including something about navigation, the name has low discoverability. I don't know what the new name will be yet, but I'm open to suggestions. If you have any ideas, please let me know!
* **Package name update:** Hopefully come .NET 10 I'll have gotten over my naming woes! The package name will be updated to reflect the new name (and possibly namespace).

:::tip
I'll be opening a discussion on the GitHub repository to gather feedback on the name change. If you have any thoughts on this, please share them there. I'm open to any suggestions, and I want to make sure the new name is something that resonates with the community.
:::

## Why Choose PageResolver for MVVM in .NET MAUI?

.NET MAUI uses the familiar host builder pattern, including built-in dependency injection. While .NET MAUI provides a way to use this with Shell, not all apps are a good fit for Shell, and many developers prefer to use hierarchical navigation. PageResolver provides a way to use the built-in dependency injection with hierarchical navigation.

This offers a simple, lightweight way to consumer dependencies in your views, without the need for an opinionated MVVM framework. PageResolver is certainly opinionated, but only about the things it's designed to do. It doesn't dictate how you structure your app, or how you write your ViewModels, or even whether you use the MVVM pattern, MVU, or just raw dog your code-behind. It simply provides a way to resolve your dependencies in your views, and that's it.

## Getting Started

1. Install PageResolver via NuGet
1. Configure PageResolver in your app's startup to handle view model resolutions automatically
1. Start building your app simplified navigation and minimal boilerplate

1. ...profit?

To find out more, visit the [PageResolver GitHub repository](https://github.com/matt-goldman/Maui.Plugins.PageResolver). Check out the wiki for more detailed information on how to use PageResolver in your projects, and explore the demo project. Use the issues and discussions to ask questions, provide feedback, or report bugs. And if you like what you see, please consider starring the repository to show your support.

## Conclusion

.NET 9 opens exciting new possibilities, and PageResolver is ready to support your projects. If you're looking for a simplified, effective way to manage consume dependencies in views in .NET MAUI apps, now's the time to give PageResolver a try. With the latest updates, including parameterised constructors, XAML markup extensions, automatic dependency registration, and Mopups integration, the killer trifecta of the MVVM and MAUI toolkits plus PageResolver gives you everything you need to set your apps up for success.
