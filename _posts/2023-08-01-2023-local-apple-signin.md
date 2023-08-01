---
layout: post
title:  "Testing Sign-in with Apple in your local development environment"
date:   2023-08-01 00:00:00 +1000
image:  /images/sign-in-apple.jpg
tags:   mobile maui ui
categories: [.NET, Auth, Apple, Authentication, iOS, iPadOS, macOS, Mobile, DNS, openssl]
---

Sign-in with Apple is a great way to authenticate users in your web and mobile apps. Apple get a lot right about single sign-on (SSO), and while some people remain apprehensive about tying their identity to a third party, Apple offer a lot of privacy and security features that make it a compelling option. And, of course, many people already have an Apple ID and prefer to use that for authentication than tying their identity to a social media platform.
    
Setting up Sign-In with Apple can be tricky. On the surface, it uses a few approaches that are similar to OIDC, but it has a few quirks that can make getting it up and running a little frustrating. One of these is that they don't allow `localhost` as a callback URL, and this presents a challenge for testing in your local development environment. In this post, I'll show you how to work around this limitation, and test Sign-in with Apple in your local development environment.

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

    > If you're using Windows and have Git installed, Git ships with an OpenSSL binary, so the easiest way to use it is to add the containing folder (`C:\Program Files\Git\usr\bin`) to your `PATH` variable.
    {: .prompt-tip }

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

```chsarp
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

You can trust the certificate when you first browse to your application and see the error, but if you have created the `.crt` file, you can do it manually now too. Simply double-click the file and choose to install it. Note that you need to install it both as a certificate and a trusted root certification authority. This is because it is self-signed, so even if you trust the certificate, if you don't add it as a root CA, then the certification path is not valid.

## My solution

With all this done, you can now run your application and use Sign-in with Apple, and should have no problem testing locally (which you'll need to do, as I show below).

## Other Apple Sign-In gotchas

### Client secret generated on the fly

### User details only once
