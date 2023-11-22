---
layout: post
title:  "Understanding .NET MAUI Page and Navigation Lifecycle Event Order"
date:   2023-11-22 00:00:01 +1000
image:  /images/nav-event-cover.png
tags:   dotnet dotnetmaui
categories: [.NET]
---

As I prepare for my [hands-on .NET MAUI workshop for NDC](https://ndcsydney.com/workshops/hands-on-cross-platform-mobile-and-desktop-apps-with-net-maui/9b5cb208bd43) in February, I found myself delving into the specifics of the .NET MAUI page and navigation lifecycle events. Particularly, I was interested in the sequence of these events across different platforms and their execution duration.

To get a clearer picture, I developed a small application to monitor these events. Thankfully, the event order was consistent across all platforms, which is reassuring but not always a given.

Here are the results from my experimentation:

![Event timings on Windows](/images/event-order-windows.png) ![Event timings on macOS](/images/event-order-macos.png)

![Event timings on Android](/images/event-order-android.png) ![Event timings on iOS](/images/event-order-ios.jpeg)

## Deciphering the Event Order

I focused on three key events, and here's the sequence in which they occur:

1. **Receive navigation parameters:**This event triggers when your page or binding context receives navigation data, either as individual query attributes or a navigation dictionary. Refer to the [.NET MAUI docs](https://learn.microsoft.com/dotnet/maui/fundamentals/shell/navigation?view=net-maui-8.0#pass-data) for more details. Logically, this should be the first step, allowing your page or ViewModel to utilise this data immediately.
2. **Appeared:** Following that, the `OnAppearing`` page lifecycle method is executed. This was a bit surprising to me, but it makes sense when you think about it.
3. **Navigated to:** The final event I monitored was the `OnNavigatedTo` lifecycle event. The .NET MAUI team are unofficially recommending the use of `OnNavigatedTo` for page initialisation (unofficially because it comes up all the time in online discussions, but is not in the docs), so it's interesting to see it occur after the page has appeared.

Understanding this sequence is crucial, especially when handling navigation parameters effectively.

## Analysing event timing

While not the primary focus of my test, I also measured the time differences between these events on each platform.

| Event                              | Diff - Windows (ms)  | Diff - macOS (ms)        | Diff - iOS (ms)   | Diff - Android (ms) |
|------------------------------------|----------------------|--------------------------|-------------------|---------------------|
| **Received navigation parameters** | -                    |  -                       | -                 | -                   |
| **Appeared**                       | 15.5708              |  2.942                   | 2.878             | 5.613               |
| **Navigated to**                   | 53.7044              |  568.453                 | 600.174           | 351.6526            |

The timing differences are fascinating. On Windows, the page appears relatively quickly after receiving navigation parameters, but the `OnNavigatedTo` event fires much faster compared to the other platforms. Although, this is almost certainly down to my over-specced Windows PC (i9 with 32GB RAM) compared to the other test devices (iPhone XR, Pixel 5 emulator, M1 MacBook Pro with 8GB RAM); but this wouldn't explain the gap in the `OnAppeared` timing.

## Conclusion

The consistent order of .NET MAUI's lifecycle events across platforms was expected, but is still reassuring, and knowing this order is important in a lot of cases (as in my workshop app that I mentioned above, for example). The timing variations are interesting, and while not immediately relevant to my needs, could highlight the need for optimisation across different platforms.

Hopefully you'll find this information useful as well!