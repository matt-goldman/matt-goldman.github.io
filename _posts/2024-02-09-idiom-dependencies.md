---
layout: post
title:  "Differentiating device idiom dependencies in .NET MAUI"
date:   2024-02-09 00:00:01 +1000
image:  /images/idiom-dependencies.png
tags:   dotnet dotnetmaui di dependency-injection
categories: [.NET]
---

While working on my upcoming [hands-on .NET MAUI workshop for NDC](https://ndcsydney.com/workshops/hands-on-cross-platform-mobile-and-desktop-apps-with-net-maui/9b5cb208bd43) (note - link will probably not work after the conference), I was thinking about different layouts for desktop, tablet, and mobile apps. The app we build during the workshop is a simple chat app, in the vein of WhatsApp or Signal (with a little inspiration from Teams), and has a different depending on the device idiom.

On mobile, it shows page content with navigation tabs at the bottom. Most of the pages show a list (e.g. people, chats, etc.) and when you tap the list, it navigates to a details page (e.g. the user's profile, the active chat window for the selected chat).

On desktop the layout is different - it will have navigation tabs on the left, and to the right have the list/detail combination. You can see this approach in Microsoft Teams.

![/images/teams-desktop-mobile.png](On desktop, the navigation tabs are on the left, followed by a list. The detail for the selected list item is displayed on the right. On mobile, the navigation tabs are at the bottom, and only the list (or detail) is shown.)

## The requirements

Achieving this layout isn't straightforward with .NET MAUI, especially if using Shell. The list/detail approach is supported as a navigation paradigm (called 'flyout navigation' in the docs), but it won't work here for two reasons: first, you can nest tabs within a flyout item, but not the other way around, and second, the flyout items need to be dynamic and loaded at runtime (essentially this is a different, albeit similar, paradigm).

This means that on mobile we have these pages, with their dependencies:

`ChatListPage` → [depends on] → `ChatListViewModel`    
↓ Navigates to ↓    
`ChatPage`  → [depends on] → `ChatViewModel`

But on desktop, there's only the one page, and it shows both the list and the detail:

`ChatListPage` → [depends on] → `ChatListViewModel`, `ChatViewModel`

I'm now faced with a challenge - how do I manage these different sets of dependencies? One approach is to use preprocessor directives to define different constructors based on platform:

```csharp
public class ChatListPage
{
#if __ANDROID__ || __IOS__
    public ChatListPage(ChatListViewModel vm)
    {
        // assign to field / binding context
    }
#elif __WINDOWS__ || __MACCATALYST__
    public ChatListPage(ChatListViewModel listVM, ChatViewModel chatVM)
    {
        // assign to fields / binding contexts
    }
#endif
}
```

This would actually work if the differences were based on platform, but the problem here is tablets. For tablets, the UI should match desktop in landscape orientation, and mobile in portrait. So the problem is now managing dependencies based on _idiom_ rather than _platform_.

## Possible solutions

Unfortunately there are no preprocessor directives for idiom, so we can't use that here. This means we can only have one constructor per page.

One approach would be to use different pages - create one set of pages for desktop and tablets that includes the landscape layout (list plus detail) and another set of pages for mobile that only includes the portrait layouts (list and detail separately). Then, we could adapt the approach used in [David Ortinau's](https://twitter.com/davidortinau) [WeatherTwentyOne](https://github.com/davidortinau/WeatherTwentyOne) sample:

```xml
<Shell 
    FlyoutWidth="68"
    FlyoutBehavior="{OnIdiom Phone=Disabled, Default=Locked}">

    <!-- Desktop/Tablet-->
    <FlyoutItem Title="Home" Icon="tab_home.png">
        <ShellContent ContentTemplate="{DataTemplate page:HomePage}"/>
    </FlyoutItem>
    <FlyoutItem Title="Favorites" Icon="tab_favorites.png">
        <ShellContent ContentTemplate="{DataTemplate page:FavoritesPage}"/>
    </FlyoutItem>
    <FlyoutItem Title="Map" Icon="tab_map.png">
        <ShellContent ContentTemplate="{DataTemplate page:MapPage}"/>
    </FlyoutItem>
    <FlyoutItem Route="settings" FlyoutItemIsVisible="False" >
        <ShellContent ContentTemplate="{DataTemplate page:SettingsPage}"/>
    </FlyoutItem>

    <!-- Phone -->
    <TabBar x:Name="PhoneTabs">
        <Tab Title="Home" Icon="tab_home.png">
            <ShellContent ContentTemplate="{DataTemplate page:HomePage}"/>
        </Tab>
        <Tab Title="Favorites" Icon="tab_favorites.png">
            <ShellContent ContentTemplate="{DataTemplate page:FavoritesPage}"/>
        </Tab>
        <Tab Title="Map" Icon="tab_map.png">
            <ShellContent ContentTemplate="{DataTemplate page:MapPage}"/>
        </Tab>
        <Tab Title="Settings" Icon="tab_settings.png">
            <ShellContent ContentTemplate="{DataTemplate page:SettingsPage}"/>
        </Tab>
    </TabBar>
</Shell>
```

```csharp
public partial class App : Application
{
    public App()
    {
        InitializeComponent();

        if (DeviceInfo.Idiom == DeviceIdiom.Phone)
            Shell.Current.CurrentItem = PhoneTabs;
    }
}
```

In this example, in the constructor the device idiom is detected and used to set the current Shell item to something different if it's a phone. To make this suit my needs, I would modify it to use the different pages in the `FlyoutItem`s than in the `Tab`s.

**If this were a real chat app that I was building for a client, this is the approach I would take.** However, for my workshop I wanted to demonstrate the power of using different idioms to display different layouts on the same page, and this got me wondering how I would solve this in a real-world app where this was a requirement.

**Note:** I still used David's approach to showing tabs on mobile and the flyout (left-hand navigation) on desktop and tablet.

## The simple solution

The easiest approach is to simply inject all the dependencies into the page. In the constructor we can use the idiom logic to assign arguments to fields and/or the page's binding context. When we exit the constructor, the unused dependencies will eventually be cleaned up by the garbage collector, and the memory overhead is unlikely to impact anything but the most performance intensive apps.

```csharp
public partial class ChatListPage : ContentPage
{
    private ChatListViewModel _viewModel;
    private ChatViewModel _chatViewModel;

    public ChatListPage(ChatListViewModel vm, ChatViewModel chatVm)
    {
        _viewModel = vm;
        BindingContext = _viewModel;

        if (DeviceInfo.Current.DeviceIdiom == DeviceIdiom.Tablet || DeviceInfo.Current.DeviceIdiom == DeviceIdiom.Desktop)
        {
            _chatViewModel = chatVm;
            Messages.BindingContext = _chatViewModel;
        }
    }
}
```

**This is the example I used in my workshop.** It's not perfect, and I definitely wouldn't use this in a production app (and I mention that in the workshop), but for the purpose of illustrating different idiom layouts, this is fine.

## Alternative approach 1: Use PageResolver

Using my [PageResolver](https://github.com/matt-goldman/Maui.Plugins.PageResolver) plugin, you can [set binding context in XAML](https://github.com/matt-goldman/Maui.Plugins.PageResolver/wiki/1-Using-the-PageResolver#14-use-in-your-code) and have it resolve from the service collection, without them needing to be injected into the page constructor. This works for `ContentView` just as well as it does for `ContentPage`.

In the chat app described in this post, it might look a little something like this.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<ContentPage x:Class="MyChatApp.Pages.ChatListPage"
             xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             xmlns:controls="clr-namespace:MyChatApp.Controls"
             xmlns:layouts="clr-namespace:MyChatApp.Layouts"
             xmlns:vm="clr-namespace:MyChatApp.ViewModels"
             xmlns:resolver="clr-namespace:Maui.Plugins.PageResolver;assembly=Maui.Plugins.PageResolver"
             Title="My chats"
             x:DataType="vm:ChatListViewModel"
             ControlTemplate="{StaticResource PageTemplate}">
    <Grid ColumnDefinitions="{OnIdiom Phone=*, Desktop='400,1,*'}">
        <CollectionView x:Name="ChatCollection"
                        ItemsSource="{Binding Chats}"
                        SelectionChangedCommand="{Binding OpenChatCommand}"
                        SelectionChangedCommandParameter="{Binding Source={x:Reference ChatCollection}, Path=SelectedItem}"
                        SelectionMode="Single">
            <CollectionView.ItemTemplate>
                <DataTemplate>
                    <controls:ChatSummary Chat="{Binding .}" />
                </DataTemplate>
            </CollectionView.ItemTemplate>
        </CollectionView>
        
        <BoxView Grid.Column="1"
                 BackgroundColor="Gray"
                 IsVisible="{OnIdiom Phone=False, Desktop=True}"
                 WidthRequest="1"
                 VerticalOptions="Fill" />
        
        <Grid Grid.Column="2"
              IsVisible="{OnIdiom Phone=False, Desktop=True}">
            <layouts:ChatLayout x:Name="Messages">
                <layouts:ChatLayout.BindingContext>
                    <resolver:ResolveViewModel x:TypeArguments="vm:MyViewModel" />
                </layouts:ChatLayout.BindingContext>
            </layouts:ChatLayout>
        </Grid>
    </Grid>
</ContentPage>
```

**This is probably how I would solve this problem in a real-world app.** You could take it a step further by wrapping the binding context in `OnIdiom` too, but this could present some other challenges (albeit soluble ones).

## Alternative approach 2: Use a dependency wrapper or envelope

The final approach I considered was to use an interface to define the dependencies for the chat page. Then I could provide one implementation for desktop and tablet, and another for phone, and use the idiom logic to register the appropriate implementation.

The interface might look like this:

```csharp
public interface IChatListPageDependencies
{
    ChatListViewModel ChatListVm { get; set; }
    ChatViewModel ChatVm { get; set; }
}
```
    
And the desktop/tablet implementation would look like this:

```csharp
public class DesktopTabletChatListDependencies : IChatListPageDependencies
{
    ChatListViewModel ChatListVm { get; set; }
    ChatViewModel ChatVm { get; set; }

    public DesktopTabletChatListDependencies(ChatListViewModel vm, ChatViewModel chatVm)
    {
        ChatListVm = vm;
        ChatVm = chatVm;
    }
}
```
    
The mobile implementation would look like this:

```csharp
public class PhoneChatListDependencies : IChatListPageDependencies
{
    ChatListViewModel ChatListVm { get; set; }
    ChatViewModel ChatVm => throw new NotImplementedException();

    public DesktopTabletChatListDependencies(ChatListViewModel vm)
    {
        ChatListVm = vm;
    }
}
```
    
These would be registered like so:

```csharp
if (DeviceInfo.Current.DeviceIdiom == DeviceIdiom.Desktop || DeviceInfo.Current.DeviceIdiom == DeviceIdiom.Tablet)
{
    builder.Service.AddTransient<IChatListPageDependencies, DesktopTabletChatListDependencies>();
}
else if
{
    builder.Service.AddTransient<IChatListPageDependencies, PhoneChatListDependencies>();
}
// can either register a default or allow an exception to be thrown on unsupported paradigms
else
{
    // ...
}
```
    
Then the interface can be injected into the page, and the same idiom logic can be used to assign the properties:

```csharp
public partial class ChatListPage : ContentPage
{
    private readonly ChatListViewModel _viewModel;
    private readonly ChatViewModel _chatVm;

    public ChatListPage(IChatListPageDependencies dependencies)
    {
        _viewModel = dependencies.ChatListVm;
        BindingContext = _viewModel;

        if (DeviceInfo.Current.DeviceIdiom == DeviceIdiom.Desktop || DeviceInfo.Current.DeviceIdiom == DeviceIdiom.Tablet)
        {
            _chatVm = dependencies.ChatVm;
            Messages.BindingContext = _chatVm;
        }
    }
}
```

This approach ensures that only the required dependencies are instantiated and injected. The drawback here is that you need to ensure that _all_ your pages follow this approach (even if they only have one dependency on all idioms), as maintaining consistency is more important than anything else, especially with an approach like this which is out of the ordinary and could be confusing to new devs working on the code.

It does however provide a solution to the problem that is consistent with some other design patterns, such as the [strategy pattern](https://en.wikipedia.org/wiki/Strategy_pattern) (obviously adapted to a different use case).

## Alternatives

Some other approaches could work here too. We could use the factory pattern, either to return pages or their dependencies. For pages this would be problematic if using Shell but there are ways around that. Another option is to simply inject the `IServiceCollection` into the page and get the dependencies you need based on idiom directly from there - but this is essentially service location, which is considered by some to be an [anti-pattern](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/) ([it's not](https://www.jimmybogard.com/service-locator-is-not-an-anti-pattern/); it's just too easy to use incorrectly). One of the main reasons people don't like the service locator pattern is that it hides your consumer's dependencies. You could argue that my wrapper/envelope approach has the same problem, but it actually avoids this by defining a specific dependency. Inspecting this specific interface (and the implementations) tells you what the dependencies for the page are.

One other approach I thought briefly about was using [keyed services](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection#keyed-services). I haven't fully thought this through, but there _may_ be a way to make it work.

## Conclusion

While this is a contrived problem, it turns out it's a hard one to solve. I'd be comfortable using the PageResolver approach - after all, I wrote the thing - but it may not be for everyone, and I don't think there's a universal 'clean' way to solve this.
    
What do you think? Do you particularly like or dislike any of the approaches in this post? And what other options would you consider? Let me know in the comments!