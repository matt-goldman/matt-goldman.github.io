---
layout: post
title:  ".NET MAUI Page and Navigation Lifecycle Event Order"
date:   2023-11-22 00:00:01 +1000
image:  /images/nav-events-cover.png
tags:   dotnet dotnetmaui
categories: [.NET]
---

I've been working on my upcoming [hands-on .NET MAUI workshop for NDC](https://ndcsydney.com/workshops/hands-on-cross-platform-mobile-and-desktop-apps-with-net-maui/9b5cb208bd43) in february, and I needed to know the specific order in which page nad navigation lifecycle events would happen. I was also curious about how long they took and what the time differences are.

I wrote a small app to test this, and first of all was pleased to see that the order is the same across all platforms (you would hope it would be, but you never know). Below are the three events I recorded and th order in which they occur:

1. **Receive navigation parameters:** This is the event that occurs when your page (or binding context) receives either individual query attributes or the navigation dictionary. See [this page in the .NET MAUI docs](https://learn.microsoft.com/dotnet/maui/fundamentals/shell/navigation?view=net-maui-8.0#pass-data). It makes sense for this to happen first, because presumably you would want your page or ViewModel to do something with this data, and it would be problematic if you didn't have it yet.
2. **Appeared:** This actually surprised me, but the `OnAppearing` page lifecycle method next.
3. **Navigated to:** The last method I checked for is the `OnNavigatedTo` lifecycle event.

The docs don't cover this, but you can see in various online discussions that the .NET MAUI team are largely encouraging people to use the `OnNavigatedTo` method for page initialisation. It surprised me that a page would appear before it was navigated to, but I suppose that's also logical (it depends which way you think about it).

In any case, knowing the order in which these events occur is important, especially if you want to do something with navigation parameters. You can see the results of these tests below.

![/images/events-order-windows.png]



The table below shows the difference in time between these events on each platform.

| Event                              | Diff - Windows (ms)  | Diff - macOS (ms)        | Diff - iOS (ms)   | Diff - Android (ms) |
|------------------------------------|----------------------|--------------------------|-------------------|---------------------|
| **Received navigation parameters** | -                    |  -                       | -                 | -                   |
| **Appeared**                       | 15.5708              |  2.942                   | 2.878             | 5.613               |
| **Navigated to**                   | 53.7044              |  568.453                 | 600.174           | 351.6526            |

It seems interesting that on Windows it takes about 5x the average for the page to appear after receiving navigation parameters, but then navigated to fires in about 1/10th of the time of the average of the other three, bringing the total time much lower. However, this is almost certainly due to my Windows PC being massively overpowered (i9 with 32GB) compared to the other three that I tested on (iPhone XR, Pixel 5 emulated, M1 MacBook Pro with 8GB).