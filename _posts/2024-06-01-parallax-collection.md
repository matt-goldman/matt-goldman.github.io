---
layout: post
title:  "Parallax CollectionView in .NET MAUI"
date:   2024-07-01 00:00:01 +1000
image:  /images/parallax-collection.png
tags:   mobile maui ui
categories: [.NET, Mobile, UI, UX, Parallax]
---

Parallax is one of those effects that is dangerously easy to overuse in your apps, but equally, when done right, add an extra "wow!" factor that can elevate an otherwise flat app and give it some depth.

> **What is parallax?**<br/> Parallax is the term given when things in the foreground appear to move quicker than things in the background. It was a [neat trick used in 16-bit games](https://www.youtube.com/watch?v=FIqpX4L5w2c) to give a sense of depth of a 3D environment, and has recently become a [trend in web design](https://www.wix.com/blog/what-is-parallax-scrolling-explained-with-examples). And perhaps most interestingly, it's one of the [methods used to estimate the distance of stars](https://lco.global/spacebook/distance/parallax-and-distance-measurement/) and other objects in space.
{: .prompt-info :}

## Getting started

Let's start with a basic app with a `CollectionView`, and see how we can add a parallax effect. The app we will build is a simple superheroes information app, that shows a series of cards with a picture and some text. I won't walk through the code here as it should be self-explanatory (and if not is outside the scope of this post, but if you want to learn more about this code you can check out the [official documentation](https://dotnet.microsoft.com/en-us/apps/maui) or my book [_.NET MAUI in Action_](https://www.manning.com/books/dot-net-maui-in-action?utm_source=goforgoldman&utm_medium=affiliate&utm_campaign=book_goldman_dot_5_10_22&a_aid=goforgoldman&a_bid=38933097)).

Note that I've downloaded some images and placed them into the `Resources/Images` folder, and I've installed the [MVVM Community Toolkit](https://learn.microsoft.com/dotnet/communitytoolkit/mvvm/) and [MAUI Bindable Property Generator](https://github.com/rrmanzano/maui-bindableproperty-generator) to reduce boilerplate.

The code is available on GitHub, it's below too but collapsed to save space, but you can expand it to view it here too.

Adding something here to test

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

If you run and build the app now, you should see something like this:

![The app with a standard `CollectionView`](/images/parallax-collection-basic.gif)
_The app with the standard `CollectionView`_

You can see I've added a shadow here which already adds a little depth, but we can add a bit more by adding a parallax effect.

## Challenge

To add an extra dimension to the depth, we could create a shadow of the image and insert it as a layer between the image and the card.