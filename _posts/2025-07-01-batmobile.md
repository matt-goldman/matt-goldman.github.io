---
layout: post
title:  "Batmobile telemetry with MauiGraphics and Grpc"
date:   2025-07-01 00:00:01 +1000
image:  /images/maui-ui-july-bg.png
tags:   mobile maui ui
categories: [.NET, Mobile, UI, GRPC, Batman]
---

Welcome to MAUI UI Juily 2025! In this post I'm reviving an old project. I initially created this to showcase MauiGraphics in my book. Unfortuantley, due to space constraints this was one of many things that ended up on the cutting room floor. But I feel like it's a fun project so I've upgraded it to .NET 9 (this was originally .NET 6) and written up some of the interesting challenges, as well as some other fun things we could do with this.

As this is MAUI UI July, I'll focus mainly on the graphics aspects, but if you want to see more of how the Grpc code works, the whole solution is available in the repo.

## Setup

The solution consists of three projects:

* **BatComputer**: This is this project that will run on the BatComputer ™️ and let Alfred remotely moitor telemetry from the Batmobile. It displays data on the screen as well as remotely mirroring the RPM gauge from the Batmobile.
* **Batmobile**: This provides the throttle control Batman can use. Moving the throttle up and down adjusts the signal sent to the BatComputer.
* **BatShared**: This contains the shared Grpc contracts used to excahgne data between the Batmobile and the BatCave.
* **BatCave**: The BatCave is the central server running all of Batman's operations. for our purposes, we've omitted much of the crimefighting code and only replicate the Grpc server here. **TODO:** Aspirify it.

As I mentioned I won't go too much into the Grpc setup, but we'll see a little of how it works as we go.

## Building the throttle
