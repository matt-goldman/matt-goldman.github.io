---
layout: post
title:  "Understanding Interfaces and Dependency Inversion"
date:   2021-04-12 00:05:55 +0300
image:  fluent-email-title-image.png
tags:   interfaces oop ioc di SOLID
---

I saw a [discussion on Reddit](https://www.reddit.com/r/dotnet/comments/mdx9ao/question_about_interfaces/) recently that reminded me of the 'penny drop' moment I had when I was first learning about interfaces and [SOLID](https://en.wikipedia.org/wiki/SOLID) principles. I can't remember exactly what spurred this eureka moment, but once I understood that you define interfaces where you consume them, rather than where you implement them, everything made sense. So I thought I'd write this up in case it's useful to anyone else just starting out with this stuff.

/*
To take a step back, it's at least as common now for people learning software development to be self-taught and not have a computer science degree as is the opposite. In my experience a lot of learning resources tend to assume either a robust familiarity with software engineering principles and build from there, or assume an absolute beginner, "Hello World" level. There is often a gap in between, and if my experience, and the above example from Reddit, is anything to go by, this is something that falls into one of those gaps.
*/

# Concretions vs Abstractions
Before I talk about interfaces, I want to explain conceptually what they are. At the conceptual level we talk about abstractions and concretions, and these names are actually meaningful. An abstraction is exactly what it sounds like - a high level description of some functionality. A concretion is a real world instance of sometuong that implements the functionality described by the abstraction.

When we are writing code, we call the abstractions Interfaces and the concretions Implementations. People often use these terms interchangably, but for the sake of clarity I will be using these terms as described here for the rest of this article. In summary:

* **Abstration**: A high level, conceptual description of some functionality (e.g. 'a car')
* **Interface**: A code file defining an abstraction (e.g. ICar.cs)
* **Concretion**: A tangible instance of an abstraction (e.g. a Mazda 3)
* **Implementation**: A code file that implements an interface (e.g. MazdaThree.cs, which implements ICar)

# Interfaces
As mentioned above, an interface is a code file that describes an abstraction. To be more explicit, and parrot an example I've seen often, let's use pets as an analogy. Let's say you're writing an application that simulates pet behaviour, and following the Interface Segregation principle (see the SOLID link above), you have an interface that describes each individual behaviour. For example, you might have an ISleeps interface and an IEats interface (it's a convention to name your interfaces starting with an 'I').

The ISleeps interface might define a sleep method:

TODO: Insert code

The IEats interface might define an eats method:

Then you might have a dog and a cat type, and each of those implements both of these interfaces:

You also have a fish type, and your fish implements an ISwims interface, which defines it's own methods:

Obviously the cat and the dog class do not implement this interface.

This can be useful if you want to write a method for feeding:

TODO: Insert code, something like public void FeedPet(IEats pet){...}

We can see here that the FeedPet method doesn't care whether you pass it a cat, dog or fish, as long as you pass it *something* that implements the IEat interface. So you can pass a an object of type cat, dog or fish to the FeedPet method, but if you had another method that requires an ISwims, you can *only* pass it the fish as its the only type that implements this interface.

# Dependency Inversion
Describing our functionality through abstractions and defining it in interfaces is fundamentally what enables us to write code that adheres to the SOLID principles. The above description might seem quite simple but when you start applying it to DI, you start to see how powerful it is.

When you invert dependencies, what you are doing is describing what you need where you need it, rather than describing what you have where you have it.

Let's look at a real world example. [... possibly BLuetooth?]

Continuing out pet behaviour example, let's say you want to implement some functionality that notifies a pet owner every time their pet has been fed. Without dependency inversion, first you need to write or import a notification system. This might be email, or it might be SMS, or it could be something else. But you pick one, in this case email, and you implement it. Then, in your FeedPet method, you can send an email to the pet owner to let them know their pet has been fed:

TODO: insert code

In this case, the class that implements the FeedPet method is *dependent* on the email system we have implemented, and is now [tightly coupled](https://nordicapis.com/the-difference-between-tight-coupling-and-loose-coupling/) to it. This presents some problems:

* If we change the email system, we could break the feed pet system
* Some users want SMS instead? Too bad.
* It makes it harder to test

The problem here is that the dependency is defined by the implementation. To resolve this issue, we *invert* that dependency, and define it where we need it, rather than where it is implemented.

In our pet simulator we would do this by defining an INotifier interface:

TODO: Insert code

Then in my class that implements the FeedPet method, rather than couple it to the email system, I just declare that I am dependent on *something* that implements the INotifier interface:

This depdendency is then *injected* into this class, and the class is now dependent on the abstraction rather than any concretion.

The benefits of this approach are:

* I have no dependency on any specific notification system, so I can change the whole implementation later if I want to without impacting my FeedPet functionality (they are loosely coupled).
* I can build multiple implementations of this interface - one for SMS, one for email, one for Microsoft Temas, whatever - and select the appropriate implementation at runtime if I wish.
* I don't even need a single implementation to continue working on my FeedPet functionality - this can be done later, or in parallel by someone else. I just need the interface defined; as log as at runtime I have an implementation available, my code will work.
* I can mock implementations to this interface in unit tests which will allow me to focus on testing my core business logic.

