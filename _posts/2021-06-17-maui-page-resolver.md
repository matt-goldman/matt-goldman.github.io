---
layout: post
title:  "Page Resolver and Navigation Extension for MAUI"
date:   2021-06-17 00:05:55 +0300
image:  /images/maui.png
tags:   dotnet maui mobile di
---

[.NET MAUI](https://github.com/dotnet/maui) is nearly here! It should go GA with .NET 6 this November.

The previews have been available for a while now and I've been having a play with them. They're definitely very preview-y (perfectly chromulent word) and while I've had some frustrations with them, overall I've been having fun and am looking forward to the new architecture.

One of the cool benefits is the built in DI container - same as what ships with ASP.NET. Previously in Xamarin you've had to use a third party DI container like [Autofac](https://autofac.org/) or [TinyIoC](https://github.com/grumpydev/TinyIoC) (just to show two different ends of the scale). Both of these have worked well for me in the past, but while they're useful, you still need to manually call the container to resolve dependencies (which is effectively the [Service Locator](https://en.wikipedia.org/wiki/Service_locator_pattern) pattern, [considered by some](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/) to be an anti-pattern). Unless of course you're using an MVVM framework like [Prism](https://prismlibrary.com/docs/) or [FreshMvvM](https://github.com/rid00z/FreshMvvm).

These frameworks are excellent, but they're not ready for MAUI yet (although [Dan Siegel](https://twitter.com/DanJSiegel) is making awesome progress with Prism). Even so, you might not want the full power of an MVVM framework, or you might want to use the MVU pattern which will be a first class citizen in MAUI.

In ASP, there's a clear request pipeline, whether for web pages or API calls. This pipeline responds to the route in the URL, finds the appropriate Controller and injects the dependencies as required (and continuing down the chain). In a UI app you don't have this request pipeline, so need another way of injecting your dependencies.

In Blazor, this is achieved by using `@inject MyDependency` at the top of your page. I wanted a way to do this in MAUI so put together the [MAUI Page Resolver](https://github.com/matt-goldman/Maui.Plugins.PageResolver). PageResolver is a DI and Navigation extensions package that lets you navigate to a page in a MAUI app with fully resolved dependencies.

This means that if your page has a view model, and that view model needs services injected, rather than manually newing up all those dependencies, or using a service locator, you can just call:

```cs
await Navigation.PushAsync<MyPage>();
```

There's a bit of boilerplate needed to set this up (for example, you need to register your services, view models, and pages with the service collection, and register the Page Resolver), but once that's done you can navigate to a fully resolved page, using DI, with the call above.

I'm hoping that Microsoft just bake this functionality into the framework (or give us something functionally equivalent), but in the meantime I'm looking at a few ways of improving this; for example, automatic registration of all pages, which would reduce the need for registration to just services and view models, and then possibly further elimination of those as well.

Feel free to take PageResolver for a spin, you can install it via a nuget package. For more information and a full getting started guide, see the Readme at the GitHub repo linked above. If you have any comments, suggestions, or feedback, please let me know. 