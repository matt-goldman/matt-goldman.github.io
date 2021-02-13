---
layout: post
title:  "Sending Email via Office365 Exchange Online with Fluent Email"
date:   2021-02-15 18:05:55 +0300
image:  fluent-email-title-image.png
tags:   email dotnet dotnet-core office-365
---

[FluentEmail](https://github.com/lukencode/FluentEmail) is an awesome library for simplifying sending email from your .NET applications. It offers a powerful yet simple fluent API, with Razor templating and support for a number of popular senders, including plain old SMTP, SendGrid, Mailkit and, as of Recently, Exchange Online.

It was possible to do this before using the SMTP sender, but it's better to use the Microsoft Graph API (the FluentEmail Graph Sender is just an abstraction of this). Using the Graph API provides a number of advantages, including:

* It sends requests using REST, so you don't need to worry about spam filters of blocking port 25 (for SMTP) on your network.
* It offers integration with Exchange features, such as calendar, voting buttons, and @ mentions (Note some features are experimental).
* You authenticate with an API key managed as an Azure AD app registration, so no need to create a service mailbox account and store/rotate login credentials.

You can check out the link above to learn more about FluentEmail in general, but in this post I'm going to show you how to send an email with FluentEmail via Exchange Online.

# 1. App Registration

The first thing you need to do is create an app registration in Azure AD.