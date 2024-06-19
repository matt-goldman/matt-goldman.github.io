---
layout: post
title:  "Parallax CollectionView in .NET MAUI"
date:   2024-07-01 00:00:01 +1000
image:  /images/parallax-collection.png
tags:   mobile maui ui
categories: [.NET, Mobile, UI, UX, Parallax]
---

Parallax is one of those effects that is dangerously easy to overuse in your apps, but equally, when done right, can add an extra "wow!" factor that elevates an otherwise flat app to give it some depth.

> **What is parallax?**<br/> Parallax is the term given when things in the foreground appear to move quicker than things in the background. It was a [neat trick used in 16-bit games](https://www.youtube.com/watch?v=FIqpX4L5w2c) to give a sense of depth of a 3D environment, and has recently become a [trend in web design](https://www.wix.com/blog/what-is-parallax-scrolling-explained-with-examples). And perhaps most interestingly, it's one of the [methods used to estimate the distance of stars](https://lco.global/spacebook/distance/parallax-and-distance-measurement/) and other objects in space.
{: .prompt-info :}

## Getting started

Let's start with a basic app with a `CollectionView`. The app we will build is a simple superheroes information app, that shows a series of cards with a picture and some text. I've downloaded some images and placed them into the `Resources/Images` folder, and I've installed the [MVVM Community Toolkit](https://learn.microsoft.com/dotnet/communitytoolkit/mvvm/) and [MAUI Bindable Property Generator](https://github.com/rrmanzano/maui-bindableproperty-generator) to reduce boilerplate.

The code is available on [GitHub](https://github.com/matt-goldman/parallax-collection), I won't walk through the code here as it should be self-explanatory (and if not is outside the scope of this post, but if you want to learn more about this code you can check out the [official documentation](https://dotnet.microsoft.com/en-us/apps/maui) or my book [_.NET MAUI in Action_](https://www.manning.com/books/dot-net-maui-in-action?utm_source=goforgoldman&utm_medium=affiliate&utm_campaign=book_goldman_dot_5_10_22&a_aid=goforgoldman&a_bid=38933097)). For convenience I've also added it below; it's collapsed so click on `Details` to unhide it.

<details>


```xml
<?xml version="1.0" encoding="utf-8" ?>
<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
            xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
            xmlns:vm="clr-namespace:ParallaxCollection.ViewModels;assembly=ParallaxCollection"
            x:DataType="vm:MainViewModel"
            x:Class="ParallaxCollection.MainPage">
    <Grid>
        <CollectionView ItemsSource="{Binding Heroes}"
                                    VerticalOptions="Center"
                                    x:Name="HeroesCollection">
            <CollectionView.ItemsLayout>
                <LinearItemsLayout ItemSpacing="50"
                            Orientation="Vertical"></LinearItemsLayout>
            </CollectionView.ItemsLayout>
            <CollectionView.ItemTemplate>
                <DataTemplate x:DataType="vm:HeroCardViewModel">
                    <controls:HeroCard Background="{Binding Background}"
                                HeroName="{Binding Name}"
                                SecretIdentity="{Binding SecretIdentity}"
                                HeroImage="{Binding HeroImage}"
                                HeroLogo="{Binding LogoImage}"/>
                </DataTemplate>
            </CollectionView.ItemTemplate>
        </CollectionView>
    </Grid>
</ContentPage>
```
{: file="MainPage.xaml }

It's just got a simple binding in the code behind:

```csharp
using ParallaxCollection.ViewModels;

namespace ParallaxCollection;

public partial class MainPage : ContentPage
{
    private MainViewModel _viewModel;

    public MainPage()
    {
        InitializeComponent();
        _viewModel = new MainViewModel();
        BindingContext = _viewModel;
    }
}
```
{: file="MainPage.xaml }

The ViewModel contains the collection of heroes and a method to seed the collection:

```csharp
using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using ParallaxCollection.Models;

namespace ParallaxCollection.ViewModels;

public partial class MainViewModel : ObservableObject
{
    public MainViewModel()
    {
        SeedHeroes();
    }
    
    public ObservableCollection<HeroCardViewModel> Heroes { get; set; } = new();
    
    private void SeedHeroes()
    {
        foreach (var hero in _heroes)
        {
            Heroes.Add(new HeroCardViewModel(hero));
        }
    }
    
    private List<Hero> _heroes { get; set; } = new()
    {
        new Hero()
        {
            Name = "Superman",
            SecretIdentity = "Clark Kent",
            HeroImage = "superman.png",
            LogoImage = "superman_logo.png",
            Background = Colors.Blue
        },
        new Hero()
        {
            Name = "Batman",
            SecretIdentity = "Bruce Wayne",
            HeroImage = "batman.png",
            LogoImage = "batman_logo.png",
            Background = Colors.DarkGray
        },
        new Hero()
        {
            Name = "Wonder Woman",
            SecretIdentity = "Diana Prince",
            HeroImage = "wonderwoman.png",
            LogoImage = "wonderwoman_logo.png",
            Background = Colors.Gold
        },
        new Hero()
        {
            Name = "The Flash",
            SecretIdentity = "Barry Allen",
            HeroImage = "theflash.png",
            LogoImage = "theflash_logo.png",
            Background = Colors.Red
        },
        new Hero()
        {
            Name = "Green Lantern",
            SecretIdentity = "Hal Jordan",
            HeroImage = "greenlantern.png",
            LogoImage = "greenlantern_logo.png",
            Background = Colors.Green
        },
        new Hero()
        {
            Name = "Shazam",
            SecretIdentity = "Billy Batson",
            HeroImage = "shazam.png",
            LogoImage = "shazam_logo.png",
            Background = Colors.Red
        }
    };
}
```
{: file="ViewModels/MainViewModel.cs }

You can see that it's using a `HeroCardViewModel` and a `Hero` model.

```csharp
using ParallaxCollection.Models;

namespace ParallaxCollection.ViewModels;

public class HeroCardViewModel(Hero hero)
{
    public string Name { get; set; } = hero.Name;
    public string SecretIdentity { get; set; } = hero.SecretIdentity;
    public string HeroImage { get; set; } = hero.HeroImage;
    public string LogoImage { get; set; } = hero.LogoImage;
    public Color Background { get; set; } = hero.Background;
}
```
{: file="ViewModels/HeroCardViewModel.cs }

And the hero model itself.

```csharp
namespace ParallaxCollection.Models;

public class Hero
{
    public string Name { get; set; }
    public string SecretIdentity { get; set; }
    public string HeroImage { get; set; }
    public string LogoImage { get; set; }
    public Color Background { get; set; }
}
```
{: file="Models/Hero.cs }

Finally the `HeroCard` view itself which is used as the data template in the collection:

```xml
<?xml version="1.0" encoding="utf-8" ?>

<ContentView x:Class="ParallaxCollection.Controls.HeroCard"
            xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
            xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml">
    <Grid>
        <Border x:Name="Card"
                Margin="30"
                StrokeShape="RoundRectangle 30">
            <Border.Shadow>
                <Shadow Brush="Black"
                        Offset="20,20"
                        Radius="40"
                        Opacity="0.8" />
            </Border.Shadow>
            <Grid Padding="20"
                    ColumnDefinitions="2*,3*"
                    RowDefinitions="4*,*">

                <Image x:Name="HeroLogoImage"
                        Grid.Row="1"
                        Grid.Column="0"
                        VerticalOptions="Center"
                        WidthRequest="75">
                    <Image.Shadow>
                        <Shadow Brush="Black"
                                Offset="20,20"
                                Radius="40"
                                Opacity="0.8" />
                    </Image.Shadow>
                </Image>

                <VerticalStackLayout Grid.Row="1"
                                        Grid.Column="1"
                                        VerticalOptions="Center">
                    <Label x:Name="HeroNameLabel"
                            Margin="10,0,0,0"
                            FontAttributes="Bold"
                            FontSize="Title"
                            TextColor="White" />

                    <Label x:Name="SecretIdentityLabel"
                            Margin="10,0,0,0"
                            FontSize="Body"
                            TextColor="White" />
                </VerticalStackLayout>
            </Grid>
        </Border>
        
        <Image x:Name="HeroImageImage"
                VerticalOptions="Center"
                HorizontalOptions="Center"
                Aspect="AspectFit"
                HeightRequest="400" />
    </Grid>
</ContentView>
```
{: file="Controls/HeroCard.xaml }

```csharp
using Maui.BindableProperty.Generator.Core;

namespace ParallaxCollection.Controls;

public partial class HeroCard : ContentView
{
    public HeroCard()
    {
        InitializeComponent();
        BindingContext = this;
    }

    [AutoBindable(OnChanged = nameof(heroNameChanged))]
    private string heroName;
    private void heroNameChanged(string value)
    {
        HeroNameLabel.Text = value;
    }

    [AutoBindable(OnChanged = nameof(secretIdentityChanged))]
    private string secretIdentity;
    private void secretIdentityChanged(string value)
    {
        SecretIdentityLabel.Text = value;
    }

    [AutoBindable(OnChanged = nameof(heroLogoChanged))]
    private string heroLogo;
    private void heroLogoChanged(string value)
    {
        HeroLogoImage.Source = value;
    }

    [AutoBindable(OnChanged = nameof(heroImageChanged))]
    private string heroImage;
    private void heroImageChanged(string value)
    {
        HeroImageImage.Source = value;
    }

    [AutoBindable(OnChanged = nameof(backgroundChanged))]
    private Color background;
    private void backgroundChanged(Color value)
    {
        Card.Stroke = new SolidColorBrush(value);
        Card.BackgroundColor = value;
    }
}
```
{: file="Controls/HeroCard.xaml.cs }

</details>

<br/>
If you run and build the app now, you should see something like this:

![The app with a standard `CollectionView`](/images/parallax-collection-basic.gif)
_The app with the standard `CollectionView`_

You can see I've added a shadow here which already adds a little depth, but we can add a bit more by adding a parallax effect.

## The logic

Before we get into the code, let's briefly discuss the logic of how this effect will work. We're going to manipulate the position of the images relative to the card, so that as we scroll, it appears the images are moving faster than the cards. This makes the image appear closer than the backgroun, which creates the illusion of depth. To achieve this, every time the `OnScrolled` event of the `CollectionView` is fired, we'll check the center of the image and adjust the `Y` (vertical) position proportionally to the difference between the image's center and the screen's. The further from the center of the screen it is, the more we'll offset it.

![As the center of the view moves further from the center of the screen, the vertical position of the image is offset from the background proportionally, giving it the sense that it is moving quicker and appears closer](/images/parallax-logic-1.png)
_As the center of the view moves further from the center of the screen, the vertical position of the image is offset from the background proportionally, giving it the sense that it is moving quicker and appears closer_

## Adding the controls

I'm going to create two custom controls - a `ParallaxItemView`, which will expose a method that can be called when the `CollectionView` is scrolled, and a `ParallaxCollectionView`, which will call this event on its children when a scroll occurs.

As the implementation of this effect is going to be different for each platform, I'm going to use partial classes, with the implementations in the relevant `Platforms` folders. For now the `ParallaxItemView` will just outline the required functionality. In a folder called `Controls`, I've added a file called `ParallaxItemView.cs`

```csharp
namespace ParallaxCollection.Controls;

public abstract partial class ParallaxItemView : ContentView
{
    private int _y;
    private int _denominator;
    protected double ParallaxOffsetY;
    private double ThisCenter;
    private double CenterY;

    public int PlatformY
    {
        get => _y;
        private set
        {
            _y = value;
            OnPropertyChanged();
        }
    }

    public ParallaxItemView()
    {
        ConfigurePlatform();
    }

    public virtual void OnScrolled()
    {
        if (Height == -1)
            return;

        CalculateCentre();
        var diff = ThisCenter - CenterY;
        ParallaxOffsetY = diff / _denominator;
    }

    partial void ConfigurePlatform();
    partial void CalculateCentre();
}
```

Let's talk through the variables in this class:

* `PlatformY`: This is the main property (with a backing field) we are going to manipulate to control the vertical position of the parallax item. Based on how far an item has been scrolled, we're going to adjust this to offset the item and create the parallax effect.
* `ParallaxOffsetY`: The is the value by which we are going to offset `PlatformY`.
* `ThisCenter`: This is going to represent the center of the item which we are offsetting.
* `CenterY`: This represents the center of the screen.

Let's also talk about the methods (and method declarations):

* `ConfigurePlatform`: This is called from the constructor and sets up the necessary platform specific pieces to make this work.
* `CalculateCenter`: This will be called to calculate where on the screen the center of the item is, so that we know how far from the center of the screen is and consequently how much it should be offset.
* `OnScrolled`: This will be called when the item is scrolled so that the offset can be calculated. It's `virtual` because it will need to be overridden, so that the child class can apply the `ParallelOffsetY` to whatever view it needs to after the calculations have completed.

Note also the `_denominator` field. This is used as a scaling factor to control the extent of the effect. It will be set in the `ConfigurePlatform` method as it will be different on each platform, but we could make this a configurable value to make the pronouncement of the effect controllable.

With the `ParallaxItemView` done, the next thing is to create the `ParallaxCollectionView`, also in the `Controls` folder:

```csharp
namespace ParallaxCollection.Controls;

public class ParallaxCollectionView : CollectionView
{
    protected override void OnScrolled(ItemsViewScrolledEventArgs e)
    {
        base.OnScrolled(e);

        var vte = (IVisualTreeElement)this;

        var visualItems = vte.GetVisualChildren();

        foreach (var item in visualItems)
        {
            if (item is ParallaxItemView parallaxItem)
            {
                parallaxItem.OnScrolled();
            }
        }
    }
}
```

This is fairly straightforward. It subclasses `CollectionView` and overrides the `OnScrolled` event handler. Every time the `CollectionView` is scrolled, it will cast itself to `IVisualTreeElement` so that it can get the child views. Then, each of these is checked to see if it's an instance of `ParallaxItemView`, and if so, the `OnScrolled` method is called.

That's all the shared functionality complete, so with that out the way, we can take a look at the platform specifics.

## Android

In the `Platforms/Android` folder, create a folder called `Controls`, and in here, add the partial implementation of the `ParallaxItemView`. It's important to ensure it uses the same namespace:

```csharp
using Microsoft.Maui.Handlers;

namespace ParallaxCollection.Controls;

public partial class ParallaxItemView
{
    partial void ConfigurePlatform()
    {
    }

    partial void CalculateCentre()
    {
        ThisCenter = PlatformY + (Height / 2);
    }
}
```

You can see here that we've started with partial implementations of the methods defined in the shared class. The `CalculateCenter` method is easy - it calculates the value for the center of the view as the `PlatformY` position plus half the height of the view. The Y position is the distance from the top of the screen to the top of the view, so adding half the height of the view gives us the center of the view.

![PlatformY is the distance from the top of the screen to the top of the view, and ThisCenter (the center of the view) is calculated by adding half the height of the view](/images/parallax-android1.png){: width="300" }
_PlatformY is the distance from the top of the screen to the top of the view, and ThisCenter (the center of the view) is calculated by adding half the height of the view_

Let's start with two easy things: setting the values for `_denominator` and `CenterY`.

```csharp
partial void ConfigurePlatform()
{
    _denominator = 10;
    CenterY = DeviceDisplay.MainDisplayInfo.Height / DeviceDisplay.MainDisplayInfo.Density / 2;

}
```

These are straightforward to understand. `_denominator` is an arbitrary value (worked out by trial and error), but could be whatever works for you on Android. We'll set a different value for iOS as it behaves differently, and talk about it a little more in the Challenges section at the end.

The next line sets the `CenterY` value, which represents the center of the screen, using the cross-platform `DeviceDisplay.MainDisplayInfo` API from .NET MAUI (see [the docs](https://learn.microsoft.com/dotnet/maui/platform-integration/device/display?view=net-maui-8.0)) to get the height and density of the screen. `Height` gives the total pixels, and dividing it by the `Density` (pixels per unit), gets the height of the display in [device independent units (DIUs)](https://learn.microsoft.com/previous-versions/xamarin/xamarin-forms/creating-mobile-apps-xamarin-forms/summaries/chapter05#pixels-points-dps-dips-and-dius).

The last step is to get the position of the view to set the `PlatformY` value. The view itself is derived from `ContentView`, which maps to the `View` type on Android, which gives us access to some useful platform APIs. First, we can use the [`ViewTreeObserver`](https://developer.android.com/reference/android/view/View#getViewTreeObserver()) to subscribe to the `ScrollChanged` event, and then set `PlatformY` whenever the position changes. And to get the position, we can use the [`GetLocationOnScreen`](https://developer.android.com/reference/android/view/View#getLocationOnScreen(int[])) method.

`GetLocationOnScreen` returns an array of `int` with two values - one for `x` and one for `y`. So all we need to do is grab the `y` value and send it to the method. You can see the full code for the `ConfigurePlatform` method here:

```csharp
partial void ConfigurePlatform()
{
    _denominator = 10;
    CenterY = DeviceDisplay.MainDisplayInfo.Height / DeviceDisplay.MainDisplayInfo.Density / 2;

    ContentViewHandler.Mapper.AppendToMapping("parallax", (handler, view) =>
    {
        if (view is ParallaxItemView pView)
        {
            handler.PlatformView.ViewTreeObserver!.ScrollChanged += (s, e) =>
            {
                int[] location = new int[2];
                handler.PlatformView.GetLocationOnScreen(location);
                int x = location[0];
                int y = location[1];

                pView.PlatformY = y;
            };
        }
    });
}
```

This is all the code we need on Android, so with that done we can move on to iOS.

## iOS

iOS works differently than Android, but we can start the same way but adding the partial implementation to the `Platforms/iOS/Controls` folder:

```csharp
using Microsoft.Maui.Handlers;

namespace ParallaxCollection.Controls;

public partial class ParallaxItemView
{

    partial void ConfigurePlatform()
    {
        _denominator = 3;
        CenterY = 160;
    }

    partial void CalculateCentre()
    {
    }
}
```

Once again, use the same namespace. In the `ConfigurePlatform` method, we've set a value for `_denominator`, but rather than obtaining the center of the screen programatically, we're using a fixed value. For iOS, this is much easier than trying to get the value from the API, and iOS provides a fixed set of device specific resolutions (in points or DIUs). You can read more about these in the documentation, although I found [a nice writeup here](https://www.appmysite.com/blog/the-complete-guide-to-iphone-screen-resolutions-and-sizes/) too.

To improve this, we would want to get the device model and set this accordingly (see Challenges section below), but for now this works for our limited use case.

The next step is to obtain the position of the view. This is not as straightforward as on Android, because the position is only ever relative to the parent view, and not the screen. But we can user the [iOS API](https://learn.microsoft.com/dotnet/api/uikit.uiview.convertpointtoview?view=xamarin-ios-sdk-12) to obtain the position onscreen using the `ConvertPointToView` method. `ConvertPointToView` (on the `UIView` class) returns a `CGPoint` which contains `X` and `Y` values (`CGPoint` can be considered similar to a `Vector2` in .NET, although they serve slightly different purposes).

To use this, we need to cast the view to the native `UIView`, then call the `ConvertPointToView` method, passing the view's location bounds (which is also a `CGPoint`) as a parameter. This will convert the position from the view's coordinate system to the screen's coordinate system. From here we can get the `Y` value, and divide it by the density to get the position in DIUs.

The complete code for the iOS implementation is here:

```csharp
using CoreGraphics;
using UIKit;

namespace ParallaxCollection.Controls;

public partial class ParallaxItemView
{
    private readonly double _density = DeviceDisplay.MainDisplayInfo.Density;
    
    partial void ConfigurePlatform()
    {
        _denominator = 3;
        CenterY = DeviceDisplay.MainDisplayInfo.Height / DeviceDisplay.MainDisplayInfo.Density / 2;
    }

    partial void CalculateCentre()
    {
        CalculatePosition();
        ThisCenter = PlatformY + (Height / 2);
    }

    public void CalculatePosition()
    {
        var location = new CGPoint();
        if (this.Handler?.PlatformView is UIView platformView)
        {
            location = platformView.ConvertPointToView(platformView.Bounds.Location, null);
        }

        PlatformY = (int)(location.Y / _density);
    }
}
```

With the iOS and Android implementations complete, we can update our UI to use the new controls.

## Result

## Challenges

Other OSes
To add an extra dimension to the depth, we could create a shadow of the image and insert it as a layer between the image and the card.
Also  make denominator configurable
Get iPhone model to set CenterY
Also add multiple layers
Implement one of the parallax designs on dribble