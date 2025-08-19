---
description: "Improving Docker container performance in .NET Aspire on Windows by leveraging WSL 2 for better filesystem access and overall container efficiency."
title:  "Fixing Docker Performance in Aspire on Windows"
date:   2025-02-28 00:00:01 +1000
image:  /images/posts/aspire-docker-performance.png
tags:   [docker, aspire, wsl, windows, performance, wsl2]
categories: [.NET, Aspire, Docker, Performance]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

If you're building .NET Aspire projects on Windows, you might be getting frustrated with the performance of your Docker containers. As a cross-platform developer, I switch between Windows and macOS frequently, and I've noticed a significant performance gap between the two platforms. Fortunately, there's a simple solution to give your Docker containers a performance boost.

## Background - are Macs just faster?

Yes and no. I've come across this performance discrepancy between code running on macOS and code running on Windows before, specifically in Node applications. I don't develop them, but I do run them sometimes. For example, this blog is built with Jekyll, a Ruby-based static site generator. Being able to run it locally and preview posts before I publish them is fairly important, but the performance on Windows is so bad that it makes it almost impossible. This was frustrating, especially considering how snappily it ran on my M1 MacBook. I've since upgraded to a newer machine, but I mention this to highlight that it's not just a hardware issue. My Windows machine is an i9 with 32GB of RAM, but would get smoked by my 8GB M1. I didn't think it could be purely a hardware issue, and I also figured that Node developers can't exclusively be using macOS, so I did some digging.

While Node does feature some optimisations for ARM processors, it's not just the hardware that makes a difference, it's the OS too - lowish spec Linux machines can run Node without any trouble, in fact even a Raspberry Pi can run a Node server without breaking a sweat. (Note that I'm talking about development builds - production builds don't tend to have this problem on Windows).

Diving into the nuts and bolts of why Node has such a hard time on Windows compared to macOS and Linux is beyond the scope of this post, but it's enough to know that Linux can run Node efficiently, and that means that my Windows hardware can at least in principle do it as well.

Fortunately, you don't need to switch to Linux. With WSL, you can get the best of both worlds.

## WSL 2

If you're reading this post, you almost certainly know what Windows Subsystem for Linux (WSL) 2 is, but in case you don't, it's a way to run a Linux kernel on Windows. It's not a hardware-emulated VM, but rather a translation layer, which provides a lightweight way to run Linux binaries on Windows. With WSL 2, you can even install your favourite Linux distro from the Microsoft Store. I tend to use Ubuntu, purely because its popularity means that it's well supported and has a large community, so when I encounter issues, I can usually find a solution quickly.

When you set up WSL, you get access to your Windows filesystem as a mounted drive, and your Linux filesystem is accessible from Windows too. At first, I tried navigating in my bash terminal to the folder where my Node project was stored, and running from there. But this would often not work at all, and when it did, it was at best still slow, and at worst riddled with countless errors. There's a simple fix for this though, and that's to run your project from the Linux filesystem.

Instead of navigating to my repo in the Windows filesystem, I just cloned it to the WSL filesystem instead, and ran it from there.

Once I did this, I got performance that was on par with macOS. Well, to be fair, I haven't actually benchmarked these, but the difference between running natively from Windows is night and day, and to be honest I'm not really fussed about the specifics. The point is, it's a usable solution for me, and that's really all that matters. As there's no perceptible difference for me now between running Node on WSL 2 or macOS, I haven't felt the need to run any benchmarks.

## Docker

As with WSL, if you're reading this then you also already know what Docker is. But an important point to note is that, like with WSL, Docker isn't a hypervisor, and containers aren't VMs. This means that you can potentially be limited from running certain containers on Windows, especially if they're Linux-based (the reverse is also true). This is where WSL 2 comes in handy, as it allows you to run Linux containers on Windows.

When you install Docker, you can choose between using WSL 2 as the backend, or the Windows Hypervisor Platform (the same service that runs Hyper-V). WSL 2 is the recommended option, by Docker and Microsoft, for good reasons which I won't go into here (but in short it's much lower overhead - with WHP, you're running a full hardware-emulated VM, with WSL 2, you're running a lightweight Linux kernel).

Most of the time, this runs buttery smooth. As I mentioned, this is the recommended setup and usually results in pretty good performance.

## Aspire

I often describe .NET Aspire as "docker compose in C#". This is a gross oversimplification - it's _way_ more than that, and it's a bit of a disservice to describe it that way. But it's also not inaccurate - .NET Aspire _does_ allow you to define your services in C#, and it _does_ run them in Docker containers.

What this means is that your Aspire services run as Docker containers, and generally they run pretty well. However, if you're running them on Windows, you might occasionally run into some performance issues. I wouldn't describe these as showstoppers, and in fact it was only when I switched a particular project to macOS that I noticed the difference. But it's there, and it's noticeable, and this became important for a client project where I needed to frequently run demos. The performance was fine for my developer experience, but some of the delays in the demos were not conducive to convincing the client that the solution was adequate.

## The Fix

It turns out, you can't just run your Aspire projects from WSL. This is a shame - I think a lot of people would like to see this. If you look on the Aspire repo, you can see it's a popular request. But it turns out it's not as simple as it seems - [this issue](https://github.com/dotnet/aspire/issues/1368) provides some insight into some of the challenges, and [this discussion](https://github.com/dotnet/aspire/discussions/6813) contains a link to the filtered list of WSL issues on the repo, highlighting the problems faced by developers trying to run Aspire projects from WSL.

But, it turns out, you can still gain performance improvements in Docker without running your Aspire project from your WSL filesystem. The fix, it turns out, is actually to limit the memory and CPU usage of your Docker containers. [This StackOverflow question](https://stackoverflow.com/questions/62154016/docker-on-wsl2-very-slow) (and the replies) provide the fix. As you can expect, a popular answer (although not the accepted one) recommends running from your Linux filesystem. This is what I've always done, but as mentioned, this doesn't work for Aspire projects.

The accepted answer states that you can create a `.wslconfig` file in your user profile, shut down Docker desktop (essentially you have to make sure the `VMMem` process is not running; you may have to kill it manually), and then restart Docker. This will apply the settings in the `.wslconfig` file, which can limit the memory and CPU usage of your Docker containers. You may have to tweak it to figure out what works best for you, but for me I simply left the default of one processor, and set the RAM limit to 6GB:

```bash
[wsl2]
memory=6GB    #Limits VM memory in WSL 2 to 6GB
processors=1    #Makes the WSL 2 VM use one virtual processors
```

Depending on your workload you may need to adjust this. I wanted to start with these and tweak as needed, but in my case I found this worked well enough.

I must admit I was sceptical, but it really does work. Again, I haven't done any benchmarks here, but let me give you an anecdote. A solution I am currently working on for a client involves importing documents to be used as templates for reports. In my Aspire infrastructure, I'm running the Cosmos DB emulator for persistence and Azurite for blob storage. In the UI, you can select a file for upload, and once it's uploaded it will process in the background. Once the file has been processed, the UI updates to show the file.

On macOS, when I upload a file, it appears in the UI straight away. On Windows it would take several seconds. Since making this change, I've noticed a significant performance improvement. It's still not instant, but that's because I've introduced another step in the process (uploading to SharePoint rather than Azurite), so I will need to run it again on macOS to compare, and in this case I may need to actually run the benchmarks.

Even so, it's been a huge improvement and, counter-intuitive as it may be, it works and I'm happy with the results.

## Why does this work?

As I said, this seemed counter-intuitive. As others noted in response to that answer, the issue isn't with Windows performance, it's with container performance. I would understand if the issue was that when running Docker containers, my Windows machine was struggling to keep up, but that didn't seem to be the case.

But it turns out that actually _was_ the problem. Without a `.wslconfig` file, WSL will consume all available CPU and memory (the same thing happens with SQL Server and Exchange Server, which is why they're not recommended to run on the same machine). As Docker runs on top of WSL, when the containers are running, WSL consumes all available resources and starves the OS. Since WSL doesn't release memory back to Windows easily, it forces the OS to use disk-based virtual memory ([swapping](https://www.geeksforgeeks.org/swapping-in-operating-system/)), which is much slower than RAM.

Where this sneaks under the radar for developers like me, is that while this is happening, you're typically debugging code running in a container. When you stop, things usually go back to normal (but not always - sometimes you have to kill WSL to get it to release the resources), and you don't notice any performance issues in your OS. This is why it _seems_ like the issue is just with Docker - and in a sense, it is, but the problem _does_ in fact impact the whole OS. I just wasn't noticing.

## Conclusion

If you're running Aspire projects on Windows and you're noticing performance issues, try limiting the memory and CPU usage of your Docker environment through a `.wslconfig` file. It's a simple fix that can make a big difference. In fact, even if you're not running Aspire, you might find this useful for anything where you're using Docker on WSL 2, or even anything with WSL 2 in general.

I'm probably quite late to the party with this one, but it made a huge difference for me, and I hope it does for you too.

Do you have any other performance improvement suggestions for Aspire on Windows? Let me know in the comments below!
