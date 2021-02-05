---
layout: post
title:  "Automagic Tenant Config for Mobile Apps"
date:   2021-02-04 18:05:55 +0300
image:  is-this-your-card.png
tags:   mobile, xamarin, configuration, tenant-config, multitenancy
---


<iframe width="560" height="315" src="https://www.youtube.com/embed/gSEHkPRiWco" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

# Background
With consumer apps (and some Enterprise apps), there's usually only one config and one backend - the public facing instance. If you're building an Enterprise mobile app, it's far more likely you'll need to support multiple client configurations.

For instance, your mobile app may need to connect to a different back end or tennant for each organisation that's using your app. For example, let's take a look at the difference between how a consumer app like WhatsApp works, and how a consumer *or* Enterprise app like Outlook works.

{% include image.html url="/images/whatsapp-vs-outlook.png" description="WhatsApp vs Outlook (Note: Oversimplified for demonstration purposes)" %}

In this example, any user can install WhatsApp, and they're up and running straight away. There's one back end service that everyone connects too, and all other configuration is the same.

Compare this to Outlook, and in this example:

* User A connects to an on-premises Exchange server
* User B connects to a different on-premises Exchange server
* User C connects to Exchange Online in Office 365

Each user needs a different set of configuration to get up and running with their email service. You may need to provide your user with all kinds of tenant-specific information, including:

* The URL of the back end service
* What identity provider (IDP) you are using (you may want to support on-premises Active Directory, Azure AD, Auth0, Okta, etc.)
* The configuration for your IDP
* If you use a mapping service, what maps provider you are using (e.g. Azure, Google, etc.)
* What logging level your organisation wants to use across all devices

These are just some examples, there could be countless others depending on your unique needs.

With a web app, this is a simple problem to solve. Yo configure the instance or tenant using any of a number of established methods (DevOps pipeline variables, app configuration, etc.). Then all you need to do is give them the URL, and they can access the app with everything already configured for them. But the real trick is getting this configuration into your users' hands and onto their mobile device.

You also need to do it in a way that is as easy for them as possible. Users have come to expect a level of automagic configuration in the software we build for them now; and it doesn't matter how sophisticated your app is - if they have to manually enter all that configuration, they're not going to be happy.

Let's take a look at some ways we can get this config to your users.

# Option A - Manual Configuration
One way to get tenant specific config into your users' mobile apps is manually. Provide them with the config, and get them to put it in.

{% include image.html url="/images/tenant-config-manual.png" description="Manual Configuration Entry Form" %}

In this example, the user is presented with a form which tells them to enter the configuration provided to them by their sysadmin (just like the old days with Outlook on desktop). Their sysadmin presumably sends them an email or directs them to an intrante resource where their config is documented.

Let's take a look at the code for how a simple form like this wokrs
// TODO: Add the gists here

We can see here that we've got a very simple entry form, where the user can enter all the configuration required to connect and log into their instance of MedMan (a dummy application used for this demo - link to repo with full code at the bottom). The fields of the form are bound to properties of the ViewModel. When the user taps the **Save** button a command in the ViewModel is called, that performs some simple validation, and then saves all the values to secure storage. The app then navigates to a login page, which consumes some of the values the user has entered here.

There are some pros and cons to this approach. The major advantage is that, for a developer, it's trivial to build, and there are virtually no 'moving parts', so it's also reliable.

The downside, and it's a big one, is that this is a *terrible* user experience.

There's plenty of room for human error here - the user could enter this information incorrectly (especially likely on a small touchscreen keyboard), the information they receive could be wrong or prone to change. And it puts the responsibility onto them to do something that we should take care of for them.

# Option B - Automagic Config with QR Codes
To make this a better experience for the user, the first step is to get rid of that entry form. 

If they've already got access to the web app then, even though they may not realise it, they already have access to all of their tenant or instance config. So one option is to transfer that config from the web app to their mobile device.

One way to do that is by encoding the configuration into a QR code and scanning that on the mobile device.

{% include image.html url="/images/qr-config.png" description="Automagic config with a QR code" %}

In this approach, when the user opens their app, they are directed to find a QR code in the desktop app and scan it to retrieve the config. The desktop app (Angular in this example) grabs the config from the back end as a JSON string, then Base64 encodes that, and then displays the Base64 endoded string as a QR code.

The mobile app then reverses this process - it scans the code, Base64 decods the string to a JSON string, then deserializes the JSON string to a config object.

// TODO: Add the gists here

After that the process is the same as in Option A - the values are saved in Secure Storage and the user is redirected to the login page.

Neat, huh?

This is definitely an improved experience over Option A for the user. The advantage is that it doesn't require manual form entry so reduces the risk of human error. It's also cool and techy.

But it has some downsides too. One of these is that the user needs to be at their desk and logged in to the desktop app before they can use the mobile app. Another is reliance on the camera - some users may not have a device with a camera (unlikely as that is), or their camera may be damaged. Or they may not want to give your app permission to access the camera. Personally, I have also had mixed results with the reliability of QR code scanning on Android (using the [ZXing library](https://devblogs.microsoft.com/xamarin/barcode-scanning-made-easy-with-zxing-net-for-xamarin-forms/)); YMMV, and if this is an apporach you like and want to adopt, then this is is something that you can overcome so shouldn't consider a barrier. But worth noting.

The biggest downside, though, is that it still requires a manual step for the user to configure their device. It may be 'cool' and techy, but I like to ask myself - does it pass the [Gregory Benford test]({{ site.baseurl }}{% link _pages/gregory-benford-test.md %})?

The answer in this case is no. Not only does the user have to take steps specifically for configuring their app, but the inner workings are on display for them to see.

Using this QR code approach is certainly viable (in fact I have this in production use in an app I've worked on), but it can be improved.

# Option C - Automagic Config from a URL
In the above example, the Angular application retrieves the config from the back end, before encoding it into a QR code to display to the user. So, why not cut out the middle-man, and just give the user the URL so their app can pick up the config directly?

{% include image.html url="/images/automagic-url-config.png" description="Automagic config from a URL" %}

In this case, the user enters a URL. This would presumably be provided to them by their sysadmin, or could also be displayed from their desktop app, or could in fact just be the URL of the desktop app. In this case, this replaces the scanning of the QR code - the app downloads the JSON directly from the URL, and then deserializes to a config object, and then saves the values to Secure Storage.

This approach solves two of the problems from the QR code option - no reliance on camera, and the user doesn't have to be at their desk. But it reintroduces the problem of manual entry and risk of human error, and it still doesn't pass the Gregory Benford test.

Still, this is a good option to include in your app as a fallback (more on this later).

# Option D - Automagic Config from Email
