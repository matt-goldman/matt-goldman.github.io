---
layout: post
title:  "Automagic Tenant Config for Mobile Apps"
date:   2021-02-04 18:05:55 +0300
image:  is-this-your-card.png
tags:   mobile xamarin configuration tenant-config multitenancy
---


<iframe width="840" height="473" src="https://www.youtube.com/embed/gSEHkPRiWco" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
*Watch: Video presentation of this topic*

## Contents
- [Background](#background)
- [Option A - Manual Configuration](#option-a---manual-configuration)
- [Option B - Automagic Config with QR Codes](#option-b---automagic-config-with-qr-codes)
- [Option C - Automagic Config from a URL](#option-c---automagic-config-from-a-url)
- [Option D - Automagic Config from Email](#option-d---automagic-config-from-email)
  - [Using a Config Broker](#using-a-config-broker)
  - [Using DNS](#using-dns)
  - [One last trick...](#one-last-trick)
- [Final thoughts](#final-thoughts)
- [Resources](#resources)

# Background
With consumer apps (and some Enterprise apps), there's usually only one config and one backend - the public facing instance. If you're building an Enterprise mobile app, it's far more likely you'll need to support multiple client configurations.

For instance, your mobile app may need to connect to a different back end or tennant for each organisation that's using your app. For example, let's take a look at the difference between how a consumer app like WhatsApp works, and how a consumer *or* Enterprise app like Outlook works.

![](/images/whatsapp-vs-outlook.png)
*WhatsApp vs Outlook (Note: Oversimplified for demonstration purposes)*

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

These are just some examples. There could be countless others depending on your unique needs.

With a web app, this is a simple problem to solve. You configure the instance or tenant using any of a number of established methods (DevOps pipeline variables, app configuration, etc.). Then all you need to do is give them the URL, and they can access the app with everything already configured for them. But the real trick is getting this configuration into your users' hands and onto their mobile device.

You also need to do it in a way that is as easy for them as possible. Users have come to expect a level of automagic configuration in the software we build for them now; and it doesn't matter how sophisticated your app is - if they have to manually enter all that configuration, they're not going to be happy.

Let's take a look at some ways we can get this config to your users.

# Option A - Manual Configuration
One way to get tenant-specific config into your users' mobile apps is manually. Provide them with the config, and get them to put it in.

![Manual configuration entry form](/images/tenant-config-manual.png)
*Manual Configuration Entry Form*

In this example, the user is presented with a form which tells them to enter the configuration provided to them by their sysadmin (just like the old days with Outlook on desktop). Their sysadmin presumably sends them an email or directs them to an intranet resource where their config is documented.

Let's take a look at the code for how a simple form like this works
{% gist 0123133d47dbc29ad2eaa7b540bee478 ConfigForm.xaml %}
*The form with fields for the user to enter config items*

We can see here that we've got a very simple entry form, where the user can enter all the configuration required to connect and log into their instance of MedMan (a dummy application used for this demo - link to repo with full code at the bottom). The fields of the form are bound to properties of the ViewModel. When the user taps the **Save** button a command in the ViewModel is called, which performs some simple validation then saves all the values to secure storage. The app then navigates to a login page, which consumes some of the values the user has entered here.
{% gist 0123133d47dbc29ad2eaa7b540bee478 ConfigFormViewModel.cs %}
*ViewModel for the config form*

There are some pros and cons to this approach. The major advantage is that, for a developer, it's trivial to build, and there are virtually no 'moving parts', so it's also reliable.

The downside, and it's a big one, is that this is a *terrible* user experience.

There's plenty of room for human error here - the user could enter this information incorrectly (especially likely on a small touchscreen keyboard), the information they receive could be wrong or prone to change. And it puts the responsibility onto them to do something that we should take care of for them.

# Option B - Automagic Config with QR Codes
To make this a better experience for the user, the first step is to get rid of that entry form. 

If they’ve already got access to the web app then they already have access to all of their tenant or instance config - even though they may not realise it. So one option is to transfer that config from the web app to their mobile device.

One way to do that is by encoding the configuration into a QR code and scanning that on the mobile device.

![Automagic config with a QR code](/images/qr-config.png)
*Automagic config with a QR code*

In this approach, when the user opens their app, they are directed to find a QR code in the desktop app and scan it to retrieve the config. The desktop app (Angular in this example) grabs the config from the back end as a JSON string, then Base64 encodes that, and then displays the Base64 endoded string as a QR code.

The mobile app then reverses this process - it scans the code, Base64 decodes the string to a JSON string, then deserializes the JSON string to a config object.

{% gist 0123133d47dbc29ad2eaa7b540bee478 QRForm.xaml %}
*A QR scanner instead of a form*

{% gist 0123133d47dbc29ad2eaa7b540bee478 QRForm.xaml.cs %}
*On a successful scan result, the data is passed to a method in the ViewModel*

{% gist 0123133d47dbc29ad2eaa7b540bee478 QRFormViewModel.cs %}
*The data is decoded, and then saved exactly the same way as with a form*

After that the process is the same as in Option A - the values are saved in Secure Storage and the user is redirected to the login page.

Neat, huh?

This is definitely an improved experience over Option A for the user. The advantage is that it doesn't require manual form entry so reduces the risk of human error. It's also cool and techy.

But it has some downsides too. One of these is that the user needs to be at their desk and logged in to the desktop app before they can use the mobile app. Another is reliance on the camera - some users may not have a device with a camera (unlikely as that is), or their camera may be damaged. Or they may not want to give your app permission to access the camera. Personally, I have had mixed results with the reliability of QR code scanning on Android (using the [ZXing library](https://devblogs.microsoft.com/xamarin/barcode-scanning-made-easy-with-zxing-net-for-xamarin-forms/)); YMMV, but if this is an approach you like and want to adopt, it's something that you can overcome so you shouldn't consider it a barrier. But it's worth noting.

The biggest downside, though, is that it still requires a manual step for the user to configure their device. It may be 'cool' and techy, but I like to ask myself - does it pass the [Gregory Benford test]({{ site_base_url}}/gregory-benford-test)?

The answer in this case is no. Not only does the user have to take steps specifically for configuring their app, but the inner workings are on display for them to see.

Using this QR code approach is certainly viable (in fact I have this in production use in an app I've worked on), but it can be improved.

# Option C - Automagic Config from a URL
In the above example, the Angular application retrieves the config from the back end, before encoding it into a QR code to display to the user. So, why not cut out the middle-man, and just give the user the URL so their app can pick up the config directly?

![](/images/automagic-url-config.png)
*Automagic config from a URL*

In this case, the user enters a URL. This would presumably be provided to them by their sysadmin, or it could be displayed from their desktop app or could even simply be the URL of the desktop app. In this case, this replaces scanning the QR code - the app downloads the JSON directly from the URL, deserializes it to a config object, then saves the values to Secure Storage.

This approach solves two of the problems from the QR code option - no reliance on camera, and the user doesn't have to be at their desk. But it reintroduces the problem of manual entry and risk of human error, and it still doesn't pass the Gregory Benford test.

Still, this is a good option to include in your app as a fallback (more on this at the end).

# Option D - Automagic Config from Email
If your app requires your users to log in, it's almost certain that they will be using their email address as the username. Seeing as they will be entering their email address anyway, why not use it to get their config for them automagically?

This option definitely passes the Gregory Benford test. Yes, it requires a manual step (entering an email address), but the user expects to do this anyway as part of the login process. The user doesn't see this as a config step, just part of their normal login, and they have no idea that there is any 'magic' going on behind the scenes to configure their app for them. Also, while this is still a manual option (like filling in a form or entering a URL), the email address is something the user knows and uses all the time. So the risk of human error is lower, and even if the user makes a mistake, they can spot and correct that themselves easily.

## Using a Config Broker
To pull off this config sleight-of-hand, let's assume that any user with the same SMTP domain (the bit after the '@' in your email address) will be part of the same tenant, and will therefore need the same config; just like with Microsoft Exchange or Exchange Online/Office365. One way you can do this is with a config broker service, that might look something like this.

![](/images/email-config-broker.png)
*Automagic config with a config broker*

Let's break down what's happening here:

1. The user enters their email address
2. The app extracts the SMTP domain from their email address and sends it off to a config broker
3. The config broker (in this case an Azure function) looks up their SMTP domain in a database (CosmosDB in this example) and returns the config associated with that domain
4. The config is sent back to the app
5. The app now knows what IDP it should use, the config for that IDP, where to find it's back-end API, etc.

This is a viable approach and can work well. But there *are* some problems. Firstly, it's a whole bunch of other services and resources that you have to maintain. This can be especially problematic if your clients host and manage their tenants themselves (rather than consuming a SaaS offering from you). As the app vendor, you still need to maintain this database, and are dependent on your clients giving you accurate and up to date information, which is the second problem.

## Using DNS
Rather than reinventing the wheel, a far better approach is to replicate what Microsoft have done with Outlook.

![](/images/outlook-mobile.jpg)
*The Outlook mobile app just asks users for their email address*

How does Microsoft pull off this trick? The answer is surprisingly simple - with DNS records.

The administrator of any domain that an Outlook client is expected to connect to, whether on desktop or mobile, creates an *autodiscover* record for that domain. So, if I want to set up Outlook to use my email address (matt@goforgoldman.com), I just enter this into Outlook. Outlook then extracts the SMTP domain (goforgoldman.com) and looks up an *autodiscover* record for that domain - autodiscover.goforgoldman.com.

![](/images/autodiscover.png)
*Outlook can now automatically configure itself just from your email address*

This is a tried and tested approach that has been working for a long time. If we want to replicate this, we can do so easily. We can't use autodiscover - that's already taken by Outlook - but we can create a unique discovery record for our app that any domain administrator can easily create. In the case of our sample app - MedMan - we create a record called *discovermedman*.

![](/images/medman-email.png)
*The final version of our app just asks for the user's email address*

{% gist 0123133d47dbc29ad2eaa7b540bee478 EmailForm.xaml %}
*The email form now just has the one entry field*

Once we have the user's email address, we can extract the SMTP domain, and look for our config at discovermedman.{smtpdomain}.

{% gist 0123133d47dbc29ad2eaa7b540bee478 EmailFormViewModel.cs %}
*We get the user's domain from their email address, then use it to fetch the config. Then save as normal.*


![](/images/discover-medman.png)
*All required config can now be retrieved using an autodiscover record*

This is a much better approach than using a config broker, because the responsibility for maintaining this is with the administrator of the SMTP domain for the tenant. It's true that some may not do it or do it wrong, but in this case it affects one subset of your users, rather than your whole user base.

## One last trick...
This is great so far. The user has given us their email address so we can get the config, but we also need their email address for the login. To maintain the illusion, they shouldn't have to enter it again. Instead, it should automagically flow through to the login screen.

![Animation showing email address captured and passed through to OAuth login page](/images/medman-auto-email.gif)

This is achieved through use of the 'Login Hint' parameter. This parameter is not strictly defined as part of the OAuth standard, but nearly all OAuth compliant identity providers - and certainly all the major ones - support it. In this example we're using [Azure AD B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/overview) as the IDP and the [Microsoft Authentication Library (MSAL)](https://github.com/AzureAD/microsoft-authentication-library-for-dotnet) in the client to authenticate against it.

MSAL defines Login Hint as an extension for B2C clients, allowing you to pass a value to a named parameter. But you can just pass it as part of the URL query string too (for any provider that supports it).

In our demo app, when the user enters their email, we don't just use it to look up the config, we also store it in a global state parameter (in this case in a static Constants class). Then when we instantiate our authentication client, we pass in the username (the user's email) as a Login Hint paramter.

{% gist 0123133d47dbc29ad2eaa7b540bee478 LoginViewModel.cs %}
*When we saved the config, we stored the user's email address in a Constant, and re-use it here*

This lets us use the email address we've already acquired from the user without them having to enter it again.

Magic! 🪄

# Final thoughts

TL;DR: the best way to automatically configure your enterprise mobile app for your users is with their email address. They're already expecting to use it to log in, so once you have it, using it to get their configuration as well is an invisible, magical experience for them.

In these examples I showed different methods for configuring a mobile app individually. In the real world, you want to offer fallback options. For example, if the SMTP domain administrator hasn't created your discover record, the user will need another approach. In this case you could offer them the option of scanning a QR code (you might note in the Outlook screenshot that is offered as an alternative option.)

If their camera doesn't work, or they don't want to use it or don't have access to the QR code, you should offer them the option of entering a config URL. And finally, as a last resort in case everything else has failed, you should offer them a manual config form.

When building software, ask yourself whether it passes the Gregory Benford test. If it does - great! But if not, spare a thought for how you can make it seem more magical.

# Resources

A GitHub repository featuring all the code for this sample can be found here: [https://github.com/MattGoldmanSSW/automagic](https://github.com/MattGoldmanSSW/automagic)

The different options shown here for the mobile app (Xamarin.Forms) are on different branches, and you will also find the back-end (.NET Core) and the web app (Angular) here too.