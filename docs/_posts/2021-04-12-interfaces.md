---
layout: post
title:  "Understanding Interfaces and Dependency Inversion"
date:   2021-04-12 00:05:55 +0300
image:  pexels-brett-sayles-4373998.jpg
tags:   interfaces oop ioc di SOLID
---

I saw a [discussion on Reddit](https://www.reddit.com/r/dotnet/comments/mdx9ao/question_about_interfaces/) recently that reminded me of the 'penny drop' moment I had when I started learning about interfaces and [SOLID](https://en.wikipedia.org/wiki/SOLID) principles. I can't remember exactly what spurred this eureka moment, but once I understood that you define interfaces where you consume them, rather than where you implement them, everything made sense. I've jotted down here my way of looking at it which may be useful to someone else coming to grips with these concepts.

# Concretions vs Abstractions
Before I talk about interfaces, I want to explain conceptually what they are. At the conceptual level we talk about abstractions and concretions, and these names are actually meaningful. An abstraction is exactly what it sounds like - a high level description of some functionality. A concretion is a real world instance of something that implements the functionality described by the abstraction.

When we are writing code, we call the abstractions Interfaces and the concretions Implementations. People often use these terms interchangably, but for the sake of clarity I will be using these terms as described here for the rest of this article. In summary:

* **Abstration**: A high level, conceptual description of some functionality (e.g. 'a car')
* **Interface**: Code defining an abstraction (e.g. `ICar.cs`)
* **Concretion**: A tangible instance of an abstraction (e.g. a Mazda 3)
* **Implementation**: Code that implements an interface (e.g. `MazdaThree.cs`, which implements `ICar`)

# Interfaces
As mentioned above, an interface is code that describes an abstraction. Specifically, it lists the properties and methods that any class that implements this interface must also implement. In this sense it's almost like a contract.

Following an example I've seen used often, let's use pets as an analogy. Let's say you're writing an application that simulates pet behaviour, and following the Interface Segregation principle (see the SOLID link above), you have an interface that describes each individual behaviour. For example, you might have an ISleeps interface and an IEats interface (it's a convention to name your interfaces starting with an 'I').

The `ISleeps` interface might define a sleep method:

{% gist bb904f5894456531fae7201a2e2bf03f ISleeps.cs %}

The `IEats` interface might define an eat method:

{% gist bb904f5894456531fae7201a2e2bf03f IEats.cs %}

Then you might have a dog and a cat type, and each of those implements both of these interfaces:

{% gist bb904f5894456531fae7201a2e2bf03f pets.cs %}

This now lets you write one method for feeding any type of pet, without having to write separate feeding methods for each type of animal, as long as they implement the interface:

{% gist bb904f5894456531fae7201a2e2bf03f Feeding.cs %}

We can see here that the FeedPet method doesn't care whether you pass it a cat, dog or even a fish, as long as you pass it *something* that implements the `IEats` interface. (Obviously we may need to instantiate the right kind of food, but this has been simplified for the example).

Speaking of the fish type, your fish will probably also implement an `ISwims` interface, which defines it's own methods:

{% gist bb904f5894456531fae7201a2e2bf03f Fish.cs %}

While you can pass an object of type cat, dog or fish to the FeedPet method, if you had another method that requires an `ISwims`, you can *only* pass it the fish as its the only type that implements this interface.

To summarise, interfaces define functionality, and offer a contract that promises that this functionality is implemented. Methods can declare an interface as a parameter, and then the method can consume anything that implements the interface. This lets you write cleaner code - you don't have to have one class that does everything that every type of pet can do, and you don't have to re-implement the feed functionality for different kinds of pet.


# Dependency Inversion
Describing our functionality through abstractions and defining it in interfaces is fundamentally what enables us to write code that adheres to the SOLID principles. The above description is simple and is quite powerful in its own right (for example when you start thinking about keeping your code [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)). But DI takes it to a whole new level.

When you invert dependencies, what you are doing is describing what you need where you need it, rather than describing what you have where you have it.

Continuing our pet behaviour example, let's say you want to implement some functionality that notifies a pet owner every time their pet has been fed. Without dependency inversion, first you need to write or import a notification system. This might be email, or it might be SMS, or it could be something else. But you pick one, in this case email, and you implement it. Then, in your FeedPet method, you can send an email to the pet owner to let them know their pet has been fed:

{% gist bb904f5894456531fae7201a2e2bf03f FeedingTimeWithEmail.cs %}

In this case, the class that implements the FeedPet method is *dependent* on the email system we have implemented, and is now [tightly coupled](https://nordicapis.com/the-difference-between-tight-coupling-and-loose-coupling/) to it. This presents some problems:

* If we change the email system, we could break the feed pet system
* Some users want SMS instead? Too bad.
* It makes it harder to test

The problem here is that the dependency is defined by the implementation. To resolve this issue, we *invert* that dependency, and define it where we need it, rather than where it is implemented.

In our pet simulator we would do this by defining an `INotifier` interface:

{% gist bb904f5894456531fae7201a2e2bf03f INotifier.cs %}

Then in my class that implements the FeedPet method, rather than couple it to the email system, I just declare that I am dependent on *something* that implements the `INotifier` interface:

This depdendency is then *injected* into this class, and the class is now dependent on the abstraction rather than any concretion. [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection) is how you implement the dependency inversion principle in practical terms - it's a huge topic on its own so I won't go into detail here, but .NET Core caters for it out of the box.


{% gist bb904f5894456531fae7201a2e2bf03f Startup.cs %}

{% gist bb904f5894456531fae7201a2e2bf03f FeedingTimeWithINotifier.cs %}

The benefits of this approach are:

* We have no dependency on any specific notification system, so can change the whole implementation later if we want to without impacting my FeedPet functionality (they are loosely coupled).
* We can build multiple implementations of this interface - one for SMS, one for email, one for Microsoft Teams, whatever - and select the appropriate implementation at runtime if we wish.
* We don't even need a single implementation to continue working on my FeedPet functionality - this can be done later, or in parallel by someone else. We just need the interface defined; as log as at runtime we have an implementation available, my code will work.
* We can mock implementations to this interface in unit tests which will allow me to focus on testing my core business logic.

There's a lot to take in here, but the core concept is this - you define the functionality you need where you need it. Then you take your depdendency on this *abstraction* rather than on any concrete implementation.

# Hiding Implementation Details
Continuing our pet example, we might find a nice email library that implements the functionality we need. We install the nuget package and look at the readme on the project's GitHub page, and we see that they provide an interface:

{% gist bb904f5894456531fae7201a2e2bf03f IGoldieEmail.cs %}

This interface is handily provided along with an extension method so we can register the email provider with our service registration at startup:

{% gist bb904f5894456531fae7201a2e2bf03f GoldieStartup.cs %}

It's tempting at this point to think that we can just use this in place of our `INotifier` interface that we defined above, but there are some problems if we do this. Firstly, we have now introduced a depdency onto a concretion rather than an abstraction. And second, this means that we have to change our code in the class that feeds the pets. The `IGoldieEmail` interface has a `SendEmail` rather than a `Send` method, and the parameters it expects are different.

Yes, we have an interface, but it's just a handy reference for the functionality provided by the library, rather than an abstraction of the functionality that *we need* in our code. We are no longer following the dependency inversion principle.

Instead, what we should do is write our `EmailNotifier` class that implements our `INotifier` interface, which means that our class with the `FeedPet` method doesn't need to change to match the methods provided by the library. Then, in our `EmailNotifier`, we implement the methods on the `INotifier` interface by consuming the functionality from our library:

{% gist bb904f5894456531fae7201a2e2bf03f GoldieMailNotifier.cs %}

What we've done here is domething called the [adapter pattern](https://en.wikipedia.org/wiki/Adapter_pattern) - although technically we've applied it in reverse, but that's outside the scope of this discussion. 

This approach gives us a huge amount of flexibility. Look at the following benefits:

* We can change the implementation details inside `EmailNotifier` as much as we like, without ever having to go back to our FeedPet code and change it to match these changes. We could switch to another library without impacting any other code.
* Rather than change the `EmailNotifier`, we can write other implementations of the `INotifier` interface and just tell the container to use this new implementation instead of the old one.
* We can use a factory method to select an appropriate implementation of `INotifier` at runtime. For example, we could have one for email and one for SMS and pick based on owner preferences.

The main benefit though is that the implementation (concretion) details are hidden. Any code that wants to use `INotifier` *only* depends on `INotifier`; not `GoldieEmail`, not some SMS provider, not anything that actually implements the functionality definded by the interface.

This allows us to write loosely coupled code, which is easier to maintain. And that's not just because we can change implementation details of a notification service. It's because *all* of the logic in our application is presented as an interface, and this lets us make *any* changes to *any* part of our code without impacting anything else. It also allows us to mock implementations which enables us to run efficient unit tests, giving us the confidence that our changes truly aren't impacting any other parts of the system.