---
description: "Exploring whether APIs need to be HTTP standards-compliant and the practical considerations for using HTTP status codes effectively in mobile app development."
title:  "HTTP Status Codes in your APIs"
date:   2019-11-17 18:05:55 +0300
image:  /images/posts//http-codes-image.jpg
tags:   [http]
categories: [Web]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

While working on the [SSW Rewards](https://www.youtube.com/watch?v=ebd6P7cyFPI) mobile app, I got into a discussion with some of my colleagues about whether your API needs to be HTTP standards-compliant. It was an interesting discussion, and while it’s one I’m sure most people are fed up with by now, I decided to document my findings as I didn’t find a clear or definitive answer.

For more information about the app, check out the link above, but for some relevant background, [the app lets you scan QR codes to earn points](https://www.youtube.com/watch?v=84pu24SKrCY) – these points can then later be used to claim rewards or enter you into a draw to win bigger prizes. When a user scans a QR code that they’ve already scanned, we needed a way to show them that they’ve already got the points for this achievement.

When we started working on this feature, the solution seemed obvious to me – if they’ve already claimed the points for this particular code, return an HTTP 409 status code. The app can then display information as required. As a reminder, [HTTP status codes](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) broadly fall into five groups:

* 1xx – these are informational
* 2xx – these are success status codes that indicate the operation succeeded
* 3xx – these are HTTP redirects
* 4xx – these indicate that the operation was not successful, due to a problem on the client side
* 5xx – these indicate that the operation was not successful, due to a problem on the server side

These HTTP status codes, if used consistently, can provide a lot of information about why an operation has not been successful, particularly in the 4xx range. For example:

* 401 – Unauthorised. This means that you have requested an authenticated resource without authenticating.
* 403 – Forbidden. This could be for a number of reasons, but following the above example, you might be requesting something you don’t have permission to access.
* 404 – Not found. This indicates that you have requested something that doesn’t exist.

Particularly relevant to this scenario is 409 – conflict. 409 is often used to indicate you are trying to create a resource that already exists. The SSW Rewards app uses the POST verb to tell the API to create an entry for your user ID for this particular QR code. To me, it seemed obvious that if this entry already exists, HTTP 409 would be the appropriate response.

My colleagues agreed, so I set about working on getting this status code sent back when a duplicate QR code was scanned. But it turned out to not be quite so simple.

The back end for this app was built using [Jason Taylor](https://twitter.com/jasontaylordev?lang=en)'s [Clean Architecture](https://www.youtube.com/watch?v=RQve_bD8X_M), which makes heavy use of the mediator and CQRS patterns (both covered in Jason’s video on Clean Architecture above). And CQRS, or more specifically the [CQS](https://martinfowler.com/bliki/CommandQuerySeparation.html) pattern which it is based upon, breaks HTTP and REST compliance.

Using a simple example, a REST convention – admittedly not a standard – is to return either the newly created object or at least the ID when using a POST request (in fact, under CQRS, POST is distinctly a command and not a request). In CQS anything that returns data should categorically not change state, and anything that changes state should not return data.

In my scenario specifically, the API had been set up to return 200 status codes (200 means OK) for all successful operations, 401 for unauthenticated requests that require authentication, and 500 for everything else. Without going into detail as to why, changing this would require breaking the clean architecture.

For me, a standards purist (more on this later), this was a problem. 500 means ‘internal server error’, which means that something unexpected and unrecoverable has gone wrong on the server side. 5xx errors, in general, mean that the problem is on the server-side, and in this case that’s not the problem – the problem is the client is trying to submit something it is not allowed to, hence my assertion that this should be a 409.

When I started raising this discussion with my colleagues, I discovered something I found quite surprising – basically, nobody cared. To me using standards and complying with them makes everyone’s lives easier, but it turns out not everyone shares this view, preferring instead to just get the job done in a way that works and solves the problem efficiently. So I started shopping this idea around with other developer friends outside the office, and I got the same response – that I was being nit-picky and that it didn’t matter.

In fact, while researching an unrelated issue ([API versioning](https://www.troyhunt.com/your-api-versioning-is-wrong-which-is/)), I came across this cartoon on [Troy Hunt](https://www.troyhunt.com/)'s blog:

![](/images/posts//robin-rest.png)
*Thanks Troy!"*

To clarify, I’m Robin in this picture. Maybe it’s because of my background in health, where standards compliance is paramount, or because of my previous work consulting on [GRC](https://en.wikipedia.org/wiki/Governance,_risk_management,_and_compliance), but to me standards are important. But in the real world, I’m just an irritating jerk (something my incredibly patient partner would have no hesitation in confirming!).

Wanting a definitive answer, I turned to the first place I look in these situations – the SSW Rules. And sure enough, [Rule 10 under Rules to Better WebAPI](https://rules.ssw.com.au/do-you-return-the-correct-response-code), is Do you return the correct response code?

You can see details at the link, but in short the rule states what I have stated above. The most important point being:

> You can save yourself countless hours of painful debugging, by specifying the correct response code.

But still, expert engineers at SSW felt that exceptions to this rule are OK, so I dug deeper. I found [Microsoft’s REST API guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md) on GitHub, which do provide some guidance on HTTP status codes, but it’s not much:

> 7.11 HTTP Status Codes
>
> Standard HTTP Status Codes SHOULD be used; see the HTTP Status Code definitions for more information.

[Sic – capitalisation not mine]

At first glance, this seems to support my initial view – that the standard HTTP codes should be used. But curious as to what the ‘SHOULD’ meant, I found this under Section 4: ‘Interpreting the Guidelines’:

> 4.3 Requirements Language
>
> The keywords “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in [RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).

Interesting. And looking to the RFC in question:

> 3. SHOULD This word, or the adjective “RECOMMENDED”, mean that there may exist valid reasons in particular circumstances to ignore a particular item, but the full implications must be understood and carefully weighed before choosing a different course

Based on this, I think it’s fair to say we have complied with this requirement. The decision to not comply with the standard HTTP status codes was considered and well understood, and in reality, there are no consequences. This is an API we have built to serve a client which we have also built, and we have full control over both ends, what data gets sent back and forth, and how we handle that.

So what does this mean for the future? Where do I stand now on standards compliance vs non-compliance? Well, for me personally, I’m still an irritating jerk who likes standards and likes to adhere to them as much as possible. As mentioned in the SSW rule, it just makes life easier. So for any API I build, it’s unlikely I’ll be happy with non-compliance.

But in this particular scenario, the key distinction is that it’s not an open API, it’s for our own consumption by our own client app. I think that the rule can be extended to state that if this is your scenario, non-compliance with the standards is OK – provided, as per the Microsoft guidelines, that this is a proactive decision that you have made with due consideration and full understanding of the implications.

If you are building an open API, then I don’t think this is true. If you are providing it for general consumption, where you have no control over what data gets submitted, how the data you provide will be consumed, or what clients will be accessing it, then it is critical to stick to standards and stick with standard HTTP status codes
