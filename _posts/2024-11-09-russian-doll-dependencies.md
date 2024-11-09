---
layout: post
title:  "Russian Doll Dependencies"
date:   2024-11-019 00:00:01 +1000
image:  /images/passthrough-behavior.jpeg
tags:   patterns architecture code-smells
categories: [.NET, Design Patterns, Code Smells, Software Architecture]
---

We often move logic into services to share it between different parts of an application, and usually with good reason. This is obviously better than, say, having logic in the presentation layer - not only does this mix concerns, it also means it's not reusable. But sometimes it's this reuse itself that can trip us up.

## What are Russian Doll Dependencies?

While not currently recognised as a conventional code smell, nested services should be thought of in the same way. In addition to being similar to [feature envy](), nesting services can also cause other problems, such as obscuring dependencies, and making it difficult to trace execution flow. This is similar to the [yo-yo problem](), but caused by dependency layering rather than inheritence.

## What aren't Russian Doll Dependencies?

I define Russian Doll Dependencies explicitly as referring to services within the same logical layer or slice. Obviously some (many) services will depend on other things; databases, notifications systems, hardware, etc. These are generally _infrastructure_ services, and it's not only ok for _application_ services to depend on these, but often necessary.

But infrastructure services depending on other infrastructure services can be problematic, as can application services depending on other applciation services.

Additionally, while services _shouldn't_ depend on services in the same layer, they _should only_ depend services in the same slice. So a `UserRegistrationService` can depend on a `UserRepository`, but not a `CustomerRepository`.

TODO: DIAGRAM HERE

## Why are Russian Doll Dependencies Problematic?

It can be tempting to break this rule, especially if you're working on a feature that needs functionality that already exists in the layer you're working in, or in a different slice. But this can lead to all kinds of problems.

### Obscures the flow of execution

Code execution should generally have a clear path from the outermost edge (be it a UI, API, etc.) down to the lowest levels (disk/database access, etc.). Continuing the example above, an API endpoint that handles a POST request at, for example, `/api/user/register`, would logically call a `UserRegistrationService`, or less specifically, a `UserService` somewhere down the chain.

If you have a business rule that requires a customer record to be created for every user, a simple approach is to inject your `CustomerService` into your `UserService`. This is an over-sinplified example, but the more you do this, the harder it becomes to trace the execution path, making debugging, troulbeshooting, and maintenance harder.

### Risks circular dependencies

Perhaps worse, it introduces a significant risk of circular dependencies. A risk that is substantially mitigated by a blanket rule not to inject services into other services in the same layer or across slices.

TODO: Another diagram perhaps?

### Masks dependencies

Direct dependencies are easy to spot - your API hanlder likely depends on an application service, so it's natural to assume this is where the logic might be. You might expect infrastructure services underneath as well, but if your application service also depends on other application services, or the services of another feature or concern, these should be surfaced in the handler, not buried in layers of service dependencies.

This masking exacerbates the problem of tracing and debugging.


## Tip #1: Avoid Wrapping Services with Other Services

Injecting same-layer, cross-slice serivces can sometimes be seen as a way of

Explain the issue of "middle man" methods that wrap functionality from other services without adding value.
Example of a wrapped method that introduces complexity unnecessarily.
Broad Solution: Services Shouldn’t Depend on Other Services:

Suggest that services be independent and focus on their core responsibility.
Emphasize that orchestration belongs in separate layers, such as command handlers.
Alternative Approach: Use Command Handlers for Orchestration:

Outline how command handlers or orchestrators can manage inter-service workflows.
Benefits of using command handlers to keep services decoupled and single-responsibility.
Warning on Injecting Services into Other Services:

Explain how injecting services into other services risks creating circular dependencies.
Example of how circular dependencies arise and why they complicate maintenance and refactoring.
Actionable “Do This Instead” Tips:

Use explicit dependencies and avoid unnecessary service layering.
Delegate orchestration to handlers or orchestrators rather than embedding dependency logic within services.
