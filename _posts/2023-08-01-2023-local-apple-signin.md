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


### Configure your application to use the local URL and SSL certificate

## My solution

## Other Apple Sign-In gotchas

### User details only once

### 