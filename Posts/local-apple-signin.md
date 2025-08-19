---
description: "How to test Sign-in with Apple in your local development environment by working around Apple's localhost restrictions with DNS and host file configurations."
title:  "Testing Sign-in with Apple in your local development environment"
date:   2023-08-01 00:00:01 +1000
image:  /images/posts/pexels-elvis-2528118.jpg
tags:   [mobile, maui, ui]
categories: [.NET, Auth, Apple, Authentication, iOS, iPadOS, macOS, Mobile, DNS, openssl, OIDC, OAuth]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

Sign-in with Apple is a great way to authenticate users in your web and mobile apps. Apple get a lot right about single sign-on (SSO), and while some people remain apprehensive about tying their identity to a third party, Apple offer a lot of privacy and security features that make it a compelling option. And, of course, many people already have an Apple ID and prefer to use that for authentication than tying their identity to a social media platform.

Setting up Sign-In with Apple can be tricky. On the surface, it uses a few approaches that are similar to [OIDC](https://openid.net/), but it has a few quirks that can make getting it up and running a little frustrating. One of these is that they don't allow `localhost` as a callback URL, and this presents a challenge for testing in your local development environment. In this post, I'll show you how to work around this limitation, and test Sign-in with Apple in your local development environment.

## Apple Setup

You configure Sign-In with Apple via the [Apple Developer portal](https://developer.apple.com). You'll need to create an Apple Developer account, which costs $99 USD per year. Once you've done that, you can create an App ID for your app, and configure Sign-In with Apple for that app. You'll need to provide a few details, including a callback URL. This is the URL that Apple will redirect to once the user has authenticated. Other than `localhost`, you can use any URL you like. When you go to publish your app, Apple will verify that the URL is valid, which is a good protection mechanism; but during development and testing, being able to use your local developer environment is essential for most people or teams.

I won't cover the steps required in the Apple Developer portal here (I will cover this in a future post if there is any interest), but you can read [the documentation](https://developer.apple.com/documentation/sign_in_with_apple), although it's not particularly clear, so for a more thorough explanation, search for one of the many blog posts or videos that cover it online.

## Local development challenges

Being able to test against your local development environment is essential for most people and teams. While it's not explicitly stated in Apple's documentation, presumably their suggested approach is to deploy to a live (although not production) environment and test there. This is counterproductive, and especially when considering [some of the other quirks around Sign-in with Apple](#other-apple-sign-in-gotchas), in most cases being able to test, and debug, locally, will be critical.


Apple banning `localhost` in callback URLs makes this difficult, but not impossible. You can still use your local machine, just not the `localhost` address. The following steps show how you can work around this in your local environment.

### Add a hosts entry for your testing address

The [hosts file](https://en.wikipedia.org/wiki/Hosts_(file)) is common across most operating systems (certainly Windows, macOS and *nix systems), and is used for address resolution. But rather than query a DNS server, it maintains its own list of mappings of DNS entries to IP addresses.

Using this information, you can add an entry to your hosts file for a testing URL and map it to your local machine:

```txt
local.apple-signin.mydomain.com     127.0.0.1
```

Then you can register the call back URL in the Apple portal for this address (e.g. `https://local.apple-signin.mydomain.com`). Then, when you have authenticated successfully with Apple, you will be redirected back to your local address.

This works because the redirection is done by your browser, not by Apple's servers (or anywhere outside your machine). When your computer resolves the address `local.apple-signin.mydomain.com`, it resolves to `127.0.0.1` which is the local computer. This allows you to register an address with Apple that you can use for testing locally.

### Generate a self-signed certificate

Setting up the URL is the first part, but if you try to authenticate now, you'll get an error when you get redirected back from Apple. This is because your development environment will (most likely) be using an SSL certificate with the common name (`CN`) `localhost`. When your browser receives this certificate from the address `local.apple-signin.mydomain.com`, it will show a warning and potentially block you from accessing it.

Certificates are usually issued and signed by a [trusted root certification authority](https://www.securew2.com/blog/certificate-authority/), but certificates can also be self-signed.

There are a few ways to generate a self-signed certificate, but one of the easiest ways, and a way that will work across most platforms, is to use [OpenSSL](https://www.openssl.org/). OpenSSL is an open-source SSL toolkit, and while they don't maintain installable binaries, you can install it from your favourite package manager.

:::tip
If you're using Windows and have Git installed, Git ships with an OpenSSL binary, so the easiest way to use it is to add the containing folder (`C:\Program Files\Git\usr\bin`) to your `PATH` variable.
:::

Before generating the certificate, one important point to note is that most browsers will use the [subject alternative name (`SAN`)](https://support.dnsimple.com/articles/what-is-ssl-san/) for SSL validation now, not just the `CN`. If you just add the URL you added to your `hosts` file to the `CN`, validation will likely fail, so you need to add it as a `SAN` too. With OpenSSL creating this certificate is simple with a single line:

```bash
openssl req -newkey rsa:4096 -nodes -keyout mycert.key -x509 -days 365 -out mycert.pem -subj "/CN=local.apple-signin.mydomain.com" -addext "subjectAltName = DNS:local.apple-signin.mydomain.com"
```

This generates a new self-signed certificate and private key, with the desired `CN` and `SAN`. Now that we have a certificate, we can start using it in our application.

### Configure your application to use the local URL and SSL certificate

To use this certificate in your application, you'll need to convert it to a format that your web server can use. I've been using this in [IdentityServer](https://duendesoftware.com/products/identityserver) in [ASP.NET Core](https://learn.microsoft.com/aspnet/core/introduction-to-aspnet-core), so in my case I need a `.pxf` file, which contains both the certificate and private key in one file. I can use OpenSSL to generate this file:

```bash
openssl pkcs12 -export -out mycert.pfx -inkey mycert.key -in mycert.pem -password pass:PasswordUsedToProtectThePfxFile
```

Once I have the `.pfx` file and a corresponding password that I have generated for it, I can use it in my IdentityServer instance (or any ASP.NET Core application). I add the password to my [`secrets.json` file](https://learn.microsoft.com/aspnet/core/security/app-secrets) and place the `.pfx` file in a location accessible to my app (my usual location is a folder called `.applesignin` in my user profile), and use it in my host builder:

```csharp
if (Environment.IsDevelopment())
{
    // Load certificate password from secrets
    var certificatePassword = Configuration["appleCertPassword"];

    // Define the path to the certificate
    var homeDirectory = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
    var certificatePath = Path.Combine(homeDirectory, ".applesignin", "mycert.pfx");

    // Load the certificate
    var certificate = new X509Certificate2(certificatePath, certificatePassword);

    // Configure Kestrel to use the certificate
    services.Configure<KestrelServerOptions>(options =>
    {
        options.ConfigureHttpsDefaults(httpsOptions =>
        {
            httpsOptions.ServerCertificate = certificate;
        });
    });
}
```

One other change you need in ASP.NET Core is to tell it to use the right URL. You can do this in `launchSettings.json`, either by editing the launch profile or creating a new one:

```json
{
  "profiles": {
    "AppleTesting": {
      "commandName": "Project",
      "launchBrowser": true,
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
      "applicationUrl": "https://local.apple-signin.mydomain.com:5001"
    }
  }
}
```

For other web server, the steps will be different. On [nginx](https://www.nginx.com/), for example, you will need to convert the `.pfx` file to a `.crt` file and store it in the `/etc/nginx` folder, along with the private key. You can name these `localhost.key` and `localhost.crt` for nginx to use them by default, or you can create a custom launch configuration.

To create the `.crt` file you can use OpenSSL again:

```bash
openssl pkcs12 -in mycert.pfx -out localhost.crt -clcerts -nokeys -password pass:TheSamePasswordYouUsedWhenCreatingThePfxFile
```

### Bonus - trust the certificate

You can trust the certificate when you first browse to your application and see the error, but if you have created the `.crt` file, you can do it manually now too. Simply double-click the file and choose to install it. Note that you need to install it both as a certificate and a trusted root certification authority. This is because it is self-signed, so even if you trust the certificate, if you don't add it as a root CA too, then the certification path is not valid.

## My solution

With all this done, you can now run your application and use Sign-in with Apple, and should have no problem testing locally (which you'll definitely need to do, for reasons I show below).

All of the steps listed above can be done manually, but I've [created a script](https://github.com/matt-goldman/local-signin-with-apple) to simplify the process. It automates the steps of:
* Generating the certificate (`.pfx`, `.crt`, `.pem`, and `.key`)
* Importing and trusting
* Adding the hosts file entry

It places the certificate in a folder called `.applesignin` in your user profile, so all you need to do after running the script is [configure your application to use it](#configure-your-application-to-use-the-local-url-and-ssl-certificate).

The script has the following prerequisites:
* [PowerShell Core](https://github.com/PowerShell/PowerShell)
* OpenSSL

The script also needs to be run with root or administrator privileges (this is required for writing to the hosts file and importing the certificate into the trusted root CA store).

It turns all the steps above into a one-liner:

```powershell
Generate-LocalCert.ps1
```

This will use a default URL and will generate a certificate password for you, but these can be supplied as arguments too:

```powershell
Generate-LocalCert.ps1 -url local.apple-signin.mydomain.com -certPassword myC00lp@@55w%rd
```

With this simple script, you can solve all the pain of developing locally for Sign-In with Apple into a trivial one-liner.

## Other Apple Sign-In gotchas

There are a couple of interesting quirks related to Sign-In with Apple which, while not directly related to working locally, certainly necessitate having a local, debuggable instance of your application running while you get it working.

### Client secret generated on the fly

When you use [Sign-In with Apple with the REST API](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api) (this is the equivalent of using Apple as an OIDC provider) you need to include a client secret with your request. Note though that this isn't a static secret (the good news is that this means it doesn't expire); instead, it's generated on the fly and signed with the private key you generate in the Apple developer portal when [setting up Sign-in with Apple](#apple-setup) (the private key does however expire so this still needs to be managed).

You don't necessarily need to work out the mechanics of this yourself as there are packages available that do it for you (in my IdentityServer app, for example, I'm using the [AspNet.Security.OAuth.Providers
](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers) package, but there are others, for .NET and most other languages/frameworks). Nevertheless, getting it right can be tricky, and if you can't debug and troubleshoot this locally, you're in for a world of pain.

### User details only once

A quirk of Apple's policies is that they only ever return user profile claims the first time a user logs in to your application (note that this is the app registration in Apple, so if it's shared in an app group, it applies to the group too). This means that you need to capture whatever profile information you need about the user (e.g. first and last name) on that very first sign-in, as Apple will never send it again. There is also no equivalent of the [userinfo endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo), so if you miss it this first time, you can never get it from Apple again.

The only way around this is for the user to de-register the application (i.e. [stop using Sign-in with Apple with the app](https://support.apple.com/en-us/HT210426)) and register again.

Therefore, while you can go to lengths to ensure you capture this information at first sign-in, it's critical to provide a form for your user to submit this information, especially if it's critical to your application's functionality. This can be frustrating in particular if you use multiple OIDC providers, as this step will most likely be unnecessary with others, so you'll have to tailor your sign-up process per IDP.

## Conclusion

If you're setting up Sign-In with Apple, it's not easy to get it working in your local development environment. And, sadly, due to the quirks of the way Apple implement this service, this can be particularly necessary. Fortunately, there are ways to make it work, as documented above. And using the script I have provided makes the process about as simple as it can get.

If you have any feedback or another way of dealing with this, I'd love to hear about it in the comments!
