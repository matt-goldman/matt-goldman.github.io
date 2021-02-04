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
To make this a better experience for the user, the first step is to get rid of that entry form. One way to do this is to somehow transfer that config from the web app to their mobile device. If they've already got access to the web app then, even though they may not realise it, they already have access to all of their tenant or instance config.

One way to do that is by encoding the configuration into a QR code and scanning that on the mobile device.

{% include image.html url="/images/qr-config.png" description="Automagic config with a QR code" %}

