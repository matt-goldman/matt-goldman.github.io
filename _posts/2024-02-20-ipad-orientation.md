---
layout: post
title:  "Orientation state changes on iPad in .NET MAUI"
date:   2024-02-20 00:00:01 +1000
image:  /images/ipad-responsove-gotcha.png
tags:   dotnet dotnetmaui responsive ipad
categories: [.NET]
---

Recently I've been looking at building .NET MAUI apps that give first-class experiences on mobile, desktop, and tablets. It's important for desktop users to feel like they're using a desktop app, rather than a mobile app "blown-up" for desktop. There are a few different aspects to this - in my [previous post](/posts/idiom-dependencies/), I looked at ways you can manage dependencies when they differ across platforms; in this post, I will look at responsive design and an unexpected "gotcha" on iPad.

## Responsive layouts

I was working recently on an app that would have different layouts on mobile and desktop. On mobile, the main page would be a list of items, and tapping or selecting one takes you to another page with details about that item. On desktop, you see a two-pane list/detail layout, with the list on the left and details of the selected item on the right. This is a common theme in chat apps (which is what this app was), including Microsoft Teams, Signal, and WhatsApp.

On tablets, I wanted a responsive layout, so that in portrait mode it behaves like a phone, and in landscape it behaves like a desktop.

![On iPad, in landscape orientation, the list and the detail are both show. In portrait, only one is shown and the user navigates between the two.](/images/ipad-landscape-portrait.png)
_On iPad, in landscape orientation, the list and the detail are both show. In portrait, only one is shown and the user navigates between the two._

According to the Microsoft documentation, this is achievable with [`OrientationStateTrigger`](https://learn.microsoft.com/dotnet/maui/fundamentals/triggers?view=net-maui-8.0#orientation-state-trigger). Using this, you can set [custom visual states](https://learn.microsoft.com/dotnet/maui/user-interface/visual-states?view=net-maui-8.0#define-custom-visual-states) for portrait and landscape and control aspects of your layouts accordingly. This works well on phones and Android tablets, but it didn't work at all on iPad.

## What's happening on iPad?

Initially I thought this was a bug and I [filed an issue on the .NET MAUI repo](https://github.com/dotnet/maui/issues/20491). But as I started investigating more, I discovered that, while this isn't documented, this behaviour is actually expected.

iPad supports multitasking, and this includes things like split view and slide-over. The result is that the orientation of the device doesn't necessarily reflect the orientation of your app. On a phone, if the phone is in landscape, your app is in landscape; but on iPad, the device could be in landscape, but your app could still only be using a third of the screen and would therefore still need a portrait layout.

Fortunately, armed with this knowledge, you can still respond to device orientation changes, and changes to the layout allocated to your app.

## Potential workarounds

I've seen a few people discuss this issue online, not just for .NET MAUI, but for anyone writing apps for iPad. One thing I've seen mentioned frequently is setting `UIRequireFullScreen` to `True` in `info.plist`. A few people have reported positive results with this approach; it didn't work for me, so it could be worth trying, but I found some more reliable approaches.

I stumbled across [this article by Flavio Goncalves](https://www.cayas.de/en/blog/responsive-layouts-for-dotnet-maui) where he created an `OnOrientation` [markup extension](https://learn.microsoft.com/dotnet/maui/xaml/fundamentals/markup-extensions?view=net-maui-8.0). This is a neat approach and works exceptionally well on phones, and while it gave better results for me on iPad than the `OrientationStateTrigger`, it still didn't work 100% reliably on iPad.

Flavio shares his code in that post, and you can see that it uses the `DeviceDisplay.MainDisplayInfoChanged` event to trigger layout changes. Note that this is related to the main device display, and _not_ the app, so this approach is more reliable than `OrientationStateTrigger` on iPad. One problem for me though is that this event doesn't fire during lifecycle events (like app start or page load), so it can be problematic if you rely on orientation to set the initial state of your app.

The approach I ended up using was the `SizeChanged` event. This fired when a page is initialised, and any time the page is resized. This would be because the device was rotated, or because the app went into a split view for multitasking. This therefore gave me the most dependable results.

You can then get the page's `height` and `width` properties that you can compare to determine its orientation. From there, you can programmatically trigger a visual state, and update your layout accordingly.

```csharp
public MyResponsivePageConstructor()
{
    if (DeviceInfo.Current.Idiom == DeviceIdiom.Tablet)
    {
        this.SizeChanged += OnSizeChanged;
    }
}

public void OnSizeChanged(object? sender, EventArgs e)
{
    if (this.Width > this.Height)
    {
        VisualStateManager.GoToState(LayoutGrid, "Landscape");
        VisualStateManager.GoToState(DetailGrid, "Landscape");
    }
    else
    {
        VisualStateManager.GoToState(LayoutGrid, "Portrait");
        VisualStateManager.GoToState(DetailGrid, "Portrait");
    }
}
```

Note that the `LayoutChanged` event works just as well.

In this case, `LayoutGrid` and `DetailGrid` represent my full responsive page (including list and detail) and the detail pane respectively. They have styles attached that control the column definitions (one column for the portrait layout, two for landscape) of the layout and visibility of the detail, using visual state manager.

```xml
<Style TargetType="Grid" x:Key="GridOrientationLayout">
    <Setter Property="VisualStateManager.VisualStateGroups">
        <VisualStateGroupList>
            <VisualStateGroup>
                <VisualState x:Name="Portrait">
                    <VisualState.Setters>
                        <Setter Property="ColumnDefinitions" Value="*" />
                    </VisualState.Setters>
                </VisualState>
                <VisualState x:Name="Landscape">
                    <VisualState.Setters>
                        <Setter Property="ColumnDefinitions" Value="400,*" />
                    </VisualState.Setters>
                </VisualState>
            </VisualStateGroup>
        </VisualStateGroupList>
    </Setter>
</Style>
<Style TargetType="Grid" x:Key="GridOrientationVisibility">
    <Setter Property="VisualStateManager.VisualStateGroups">
        <VisualStateGroupList>
            <VisualStateGroup>
                <VisualState x:Name="Portrait">
                    <VisualState.Setters>
                        <Setter Property="IsVisible" Value="False" />
                    </VisualState.Setters>
                </VisualState>
                <VisualState x:Name="Landscape">
                    <VisualState.Setters>
                        <Setter Property="IsVisible" Value="True" />
                    </VisualState.Setters>
                </VisualState>
            </VisualStateGroup>
        </VisualStateGroupList>
    </Setter>
</Style>
```

With this approach, I can set the initial state, as well as respond to orientation changes and, as a bonus, any other layout changes that I might want to respond to.

## Conclusion

Sometimes it really is a feature and not a bug - and in this case, once you understand how things work, everything is behaving as expected. Fortunately, using the approach described above, you can still create responsive layouts in .NET MAUI for iPad that work reliably.

With .NET MAUI we can target phones, desktop, tablets, TVs, even watches, so knowing how to get the most for our users out of each platform is critical. Are you building responsive apps? What issues have you encountered? Let me know in the comments!
