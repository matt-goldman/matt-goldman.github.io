---
description: "Workaround for the Cosmos DB Emulator Explorer dashboard bug in Aspire by using the vnext-preview image tag until the fix is promoted to latest."
title:  "Cosmic Aspirations: A Workaround for the Cosmos DB Emulator Explorer in Aspire"
date:   2024-12-06 00:00:01 +1000
image:  /images/posts/cosmic-aspirations.png
tags:   [mobile, maui, ui, di]
categories: [.NET, Aspire, Cosmos DB, Azure]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

If you've been struggling to get the Cosmos DB Emulator's Explorer Dashboard working in Aspire, hopefully this will help. Recently, I encountered a frustrating issue where the dashboard refused to work, resulting in a deep dive into the emulator’s configuration, Aspire's abstraction, and containerised environments. After hours of digging, I discovered that the root cause lies in the emulator image itself.

Here’s how I worked around the issue and got everything running smoothly.

## The Problem
The Cosmos DB Emulator Docker image currently tagged as `latest` has a bug preventing the Explorer Dashboard from functioning. The problem isn’t related to Aspire or any misconfiguration—it’s a bug in the emulator image itself.

After some digging, I came across an [open issue on GitHub](https://github.com/Azure/azure-cosmos-db-emulator-docker/issues/135) that confirms the problem. Fortunately, the issue has been fixed, and a new emulator image with the `vnext-preview` tag includes the fix. However, until the fix is promoted to the `latest` tag, we’ll need to explicitly configure Aspire to use the `vnext-preview image`.

## The Workaround
Here’s how to configure Aspire to use the fixed emulator image:

```csharp

var cosmos = builder.AddAzureCosmosDB("cosmos")
    .WithHttpEndpoint(51234, 1234, "explorer-port") // Enable the Explorer on a custom port
    .WithExternalHttpEndpoints()                   // Expose the ports externally
    // TECH DEBT: Workaround for Explorer dashboard not working in emulator. See: https://github.com/Azure/azure-cosmos-db-emulator-docker/issues/135.
    .RunAsEmulator(cfgContainer =>
    {
        cfgContainer
        .WithImageRegistry("mcr.microsoft.com")        // Set the registry
        .WithImage("cosmosdb/linux/azure-cosmos-emulator") // Use the emulator image
        .WithImageTag("vnext-preview");                // Use the preview tag with the fix
    });
```

## Breaking It Down

### 1. Set the HTTP Endpoint:

The `WithHttpEndpoint` method specifies the Explorer port (in this case, `1234`) and exposes it locally (within the Aspire network).

### 2. Expose External Endpoints:

Use `.WithExternalHttpEndpoints()` to ensure that the emulator’s ports can be accessed from your host environment (proxied via Aspire)

### 3. Override the Emulator Image:

The `RunAsEmulator` configuration lets us specify the `vnext-preview` image tag, which includes the fix for the Explorer Dashboard.

Et voila!

![The Cosmos DB Emulator explorer dashboard running in Aspire](/images/posts/aspire-cosmos-screenshot.png)
_The Cosmos DB Emulator explorer dashboard running in Aspire_

## Why This Matters

For developers leveraging Aspire to emulate Azure Cosmos DB locally, this workaround ensures you can:

* Access the Cosmos DB Emulator Explorer Dashboard for easier debugging and data exploration
* Continue to use Aspire's abstractions without needing to manually manage Docker configurations

This is critical, as the Cosmos DB emulator has some quirks that make it operate ever-so-slightly differently from the real thing, particularly around case-sensitivity. Having access to the Explorer is an essential troubleshooting tool in any case, but particularly in light of these gotchas.

## When Will This Be Fixed?

The Cosmos DB Emulator team has already fixed this issue in the `vnext-preview` image. Once this image is promoted to `latest`, you’ll no longer need this workaround. Keep an eye on the [GitHub](https://github.com/Azure/azure-cosmos-db-emulator-docker/issues/135) issue for updates.

## Final Thoughts

I've come to love .NET Aspire and use it as the default for most projects now, but debugging this issue highlighted both the strengths and challenges of using tools like Aspire and the Cosmos DB Emulator. While it simplifies the setup of complex distributed systems, this abstraction can sometimes make diagnosing edge cases tricky. Thanks to the open-source nature of nearly every component involved, however, it's always possible to dig deeper and find solutions (with enough determination).

Have you run into similar roadblocks with Aspire or Cosmos DB Emulator? Share your experiences in the comments below—I’d love to hear about them!
