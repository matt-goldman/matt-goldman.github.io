---
description: "Implementing a passthrough behavior pattern in .NET MAUI to attach validation functionality to custom controls that wrap Entry and Editor elements."
title:  "Passthrough Behavior: Attaching things where they don't belong"
date:   2024-07-01 00:00:01 +1000
image:  /images/posts//passthrough-behavior.jpeg
tags:   [mobile, maui, ui]
categories: [.NET, Mobile, UI, UX]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

## Introduction

I spent some time over the last year helping [TrashMob](https://trashmob.eco) build their mobile app. TrashMob is an initiative designed to allow people to self-organise community cleanup events - it's a wonderful initiative and you should definitely check it out if you haven't already. Like most mobile apps, they have their own [design language system](https://uxplanet.org/design-language-system-d438f4aa30e0) and wanted to implement their consistent, branded look-and-feel across the mobile app. This involved customising the appearance of the out of the box controls, including the `Entry` and `Editor` controls.

Often you can use [styles](https://learn.microsoft.com/dotnet/maui/user-interface/styles/xaml) to customise controls in .NET MAUI apps, but these don't always give you full control over all the aspects you need to modify. In this case you need to use [handlers](https://learn.microsoft.com/dotnet/maui/user-interface/handlers) to change the way .NET MAUI renders controls on the target platforms.

There are a couple of approaches you can take here. One is to fully customise the platform view - this was a common approach with the renderer architecture in Xamarin.Forms. Another, and my preferred approach, is instead to [strip away the platform styling and then wrap the control in a `ContentView`](https://github.com/matt-goldman/MauiMaterialEntry). Using the rich styling capabilities in .NET MAUI makes it much easier create a consistent cross-platform custom experience than manipulating platform APIs directly. But this approach comes with some trade-offs.

In the case of the `Entry` and `Editor` controls, bindable properties like `Text` and `Placeholder` need to be reproduced, and sometimes events (although this approach also makes it trivial to create your own bindable commands). If you're using this approach for a control library, you probably need to expose pretty much all of the properties and events of a control when you "wrap" it like this, although for an internal control as in my scenario this is usually not necessary. In any case, using a source generator like those in the [MVVM Community Toolkit](https://learn.microsoft.com/dotnet/communitytoolkit/mvvm/) and the [bindable property generator](https://github.com/rrmanzano/maui-bindableproperty-generator) make it a cinch.

## The challenge

Speaking of community toolkits, the TrashMob mobile app uses the [MAUI Community Toolkit](https://learn.microsoft.com/dotnet/communitytoolkit/maui/) extensively including, among other things, for [validation on user input](https://learn.microsoft.com/dotnet/communitytoolkit/maui/behaviors/text-validation-behavior). As these are [.NET MAUI behaviors rather than attached behaviors](https://learn.microsoft.com/dotnet/maui/fundamentals/behaviors), adding them to a custom control isn't a problem, but consuming the functionality in a meaningful way is.

I considered a few options:

* Customise `Entry` and `Editor` entirely through handlers. This would have been a lot more work and would require maintaining different sets of styling per platform.
* Manually replicate all the validation functionality myself. Also a lot of work and re-inventing the wheel.
* Add every conceivable validator to the `Editor` and `Entry` and then expose properties on the wrapper control to enable them. Would also require bindable properties for certain things like valid patterns or number ranges. Also a lot of work and hard to maintain, and likely would include lot's of things that wouldn't be necessary.

None of these seemed like particularly good ideas, so I decided on a different approach,

## My solution

I opted instead to create a simple, reusable "passthrough behavior" attachment. Rather than add the behavior directly to a control, I wanted to pass it through - give it to the wrapper control which would in turn add it to the wrapped control.

What this means is that I can provide the behavior I want to the wrapper control and it will pass it through to the wrapped `Entry` (`Editor` too but in this demo I'm only showing `Entry` - although if you want to see the full solution you can check out the [TrashMob repo on GitHub](https://github.com/TrashMob-eco/TrashMob) - and feel free to contribute to them too!).

Before we look at the passthrough behavior, let's take a quick look at the custom entry control:

```xml
<?xml version="1.0" encoding="utf-8" ?>
<ContentView xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:controls="clr-namespace:PassthroughBehaviorDemo.Controls"
             x:Class="PassthroughBehaviorDemo.Controls.CustomEntry">
    <Border Stroke="Gold"
            StrokeShape="RoundRectangle 10">
        <controls:BorderlessEntry x:Name="WrappedEntry"
                                  TextChanged="WrappedEntry_TextChanged"/>
    </Border>
</ContentView>
```

We can see that this control itself is called `CustomEntry`, and it's simply a `Border` around a `BorderlessEntry`. `BorderlessEntry` is just a subclass of `Entry`, and I'm using the `TextChanged` event here to bubble up the `Text` property to the wrapper control.

```csharp
public partial class CustomEntry : ContentView
{
	public CustomEntry()
	{
		InitializeComponent();
	}

    private void WrappedEntry_TextChanged(object sender, TextChangedEventArgs e)
    {
        if (Text != e.NewTextValue)
        {
            Text = e.NewTextValue;
        }
    }

    [AutoBindable(DefaultBindingMode = "TwoWay", OnChanged = nameof(TextPropertyChanged))]
    private string _text;
    private void TextPropertyChanged(string newValue)
    {
        if (WrappedEntry.Text != newValue)
        {
            WrappedEntry.Text = newValue;
        }
    }
}
```

I'm using the bindable property generator linked above here to automatically generate the `Text` property.

:::note
Don't use names like `CustomEntry`. I just used it here for this demo but it's a terrible name. Use something meaningful like `BorderlessEntry` or `RoundedEntry`. Or if it's branded something like `TMEntry` (TM for TrashMob, which is what I actually used in this case), although while this works for a control library, a name that is descriptive of the customisation is probably better.
:::

The `BorderlessEntry` as mentioned is just a subclass of `Entry`, but with a handler mapping to remove the default borders:

```csharp
public class BorderlessEntry : Entry
{
    public BorderlessEntry()
    {
        Microsoft.Maui.Handlers.EntryHandler.Mapper.AppendToMapping("Borderless", (handler, view) =>
        {
            if (view is BorderlessEntry)
            {
#if ANDROID
                handler.PlatformView.Background = null;
                handler.PlatformView.SetBackgroundColor(Android.Graphics.Color.Transparent);
                handler.PlatformView.BackgroundTintList =
                    Android.Content.Res.ColorStateList.ValueOf(Android.Graphics.Color.Transparent);
#elif IOS
                handler.PlatformView.BackgroundColor = UIKit.UIColor.Clear;
                handler.PlatformView.Layer.BorderWidth = 0;
                handler.PlatformView.BorderStyle = UIKit.UITextBorderStyle.None;
#endif
            }
        });

        var transparentBackgroundSetter = new Setter
        {
            Property = BackgroundColorProperty,
            Value = Colors.Transparent
        };

        var focusedTrigger = new Trigger(typeof(Entry));
        focusedTrigger.Property = IsFocusedProperty;
        focusedTrigger.Value = true;
        focusedTrigger.Setters.Add(transparentBackgroundSetter);

        Triggers.Add(focusedTrigger);
    }
}
```

With the custom controls now set up, let's take a look at the code to pass through validation behaviors from the MAUI Community Toolkit:

```csharp
public static class BehaviorAttachment
{
    public static readonly BindableProperty PassthroughBehaviorProperty =
        BindableProperty.CreateAttached(
            "PassthroughBehavior",
            typeof(Behavior),
            typeof(BehaviorAttachment),
            null,
            propertyChanged: OnBehaviorChanged);

    public static void SetPassthroughBehavior(BindableObject view, Behavior value)
    {
        view.SetValue(PassthroughBehaviorProperty, value);
    }

    public static Behavior GetPassthroughBehavior(BindableObject view)
    {
        return (Behavior)view.GetValue(PassthroughBehaviorProperty);
    }

    static void OnBehaviorChanged(BindableObject bindable, object oldValue, object newValue)
    {
        if (newValue is Behavior newBehavior)
        {
            if (bindable is CustomEntry customEntry)
            {
                var entry = customEntry.FindByName<Entry>("WrappedEntry");
                if (entry != null)
                {
                    entry.Behaviors.Add(newBehavior);
                }
            }
        }
    }
}
```

This is an [attached behavior](https://learn.microsoft.com/dotnet/maui/fundamentals/behaviors#attached-behaviors) that essentially takes any other behavior and adds it to the wrapped `Entry` control.

It implements the get and set methods required for an attached behavior (named by convention), and for the property changed event of the bindable property, first checks to see if the value being bound is a behavior, then checks to see if the bindable object is an instance of the wrapper control (`CustomEntry` in this case). If both these things are true, the behavior that is being attached gets added to the wrapped `Entry` control, or "passed through".

This is an incredibly simple yet powerful addition that enables me to keep my simplified approach and still benefit from the awesome validators in the community toolkit. Let's take a look at it in action:

```xml
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:controls="clr-namespace:PassthroughBehaviorDemo.Controls"
             xmlns:mct="http://schemas.microsoft.com/dotnet/2022/maui/toolkit"
             x:Class="PassthroughBehaviorDemo.MainPage">
    <ContentPage.Resources>
        <Style x:Key="InvalidEntryStyle" TargetType="Entry">
            <Setter Property="TextColor" Value="Red" />
        </Style>
        <Style x:Key="ValidEntryStyle" TargetType="Entry">
            <Setter Property="TextColor" Value="Green" />
        </Style>
    </ContentPage.Resources>

    <ScrollView>
        <VerticalStackLayout
            Padding="30,0"
            Spacing="25">
            <!-- ... -->

            <controls:CustomEntry>
                <controls:BehaviorAttachment.PassthroughBehavior>
                    <mct:EmailValidationBehavior
                         InvalidStyle="{StaticResource InvalidEntryStyle}"
                         ValidStyle="{StaticResource ValidEntryStyle}"
                         Flags="ValidateOnValueChanged" />
                </controls:BehaviorAttachment.PassthroughBehavior>
            </controls:CustomEntry>
        </VerticalStackLayout>
    </ScrollView>

</ContentPage>
```

You can see here I have brought in namespaces for my control and for the community toolkit, and then simply dropped in an instance of `CustomEntry`, just as I would a regular entry. Using my `PassthroughBehavior` I've added an email validator from the CommunityToolkit, using a couple of styles I've defined in the page to highlight valid and invalid inputs.

Easy right? Let's take a look at the result:

![The passthrough behavior in action on Windows](/images/posts//passthrough-behavior.gif)
_The passthrough behavior in action on Windows_

You can see here that this is using a custom `Entry` control - it has a rounded gold border, and email validation is working, relying on the functionality from the community toolkit with barely any extra effort. And of course this is reusable and can be used with any instance of the custom entry control and any behavior.

## Conclusion

Using this passthrough behavior you can have your cake and eat it! You get all the flexibility of building custom controls using cross-platform .NET MAUI APIs while retaining the ability to use extensions intended for built-in controls.

Will you use this in your projects? Do you have a better approach? Let me know your feedback in the comments!

Check out the [full code sample here](https://github.com/matt-goldman/PassthroughBehaviorDemo).
