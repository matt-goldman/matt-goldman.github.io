---
layout: post
title:  "End to End Test and Release Orchestration with GitHub Actions"
date:   2021-09-05 00:05:55 +0300
image:  e2e-header-image.png
tags:   testing devops orchestration GitHub-Actions
---

I'm working on a project that has some interesting test and release requirements. All our PBIs are defined using [BDD]() and our acceptance criteria are written as [Gherkin statements](). To support this, we're using [Specflow]() to generate our tests, and as most of these behaviours reflect user scenarios, we're using [Playwright]() to automate browser interaction to run these tests.

We've got some pretty standard Git operations set up - when you open a pull request, we run any unit tests in the repository, and we also run a [CodeQL]() analysis. If all these pass (and there are no merge conflicts), the code can be merged once it's approved by a reviewer. When the code is merged, we run workflows that deploy to dev and test environments (but not production).

We're not using a microservices architecture, but we do have a number of independent components that make up the solution, including:

 - A UI built in Blazor
 - A REST API built in .NET 5
 - Dynamics CRM
 - [Contentful]() headless CMS
 - [InRule] business rules engine

All of these components have repositories on GitHub (either for the code or for the configuration), so the above steps described as the standard Git operations apply to each of these independently. The tests and deployments operate in isolation.

While the components are independent, all of them are required to provide the full solution. Some of them have interdependencies, but ultimately everything is required to provide the expected behaviours in the UI. So the challenge was finding a way to deploy all the components to a fully integrated end-to-end test environment, with controlled test scenario data, to run our Specflow BDD tests in Playwright.

I started by defining the requirements and I came up with this sequence diagram (disclaimer: I'm less than amateur when it comes to these so please try not to judge me too harshly for this!).

```mermaid
title Test and Release Workflow
Developer-#blue>Code Repo:Submit PR
activate Code Repo
note over Code Repo:CodeQL and Unit Tests
Code Repo-#blue>Dev:Deploy
Code Repo-#green>Dev:Core Regression Tests
Code Repo<#red--Dev:Roll back and stop if tests fail
note over Code Repo:PR Approve/Merged
Code Repo-#blue>Test:Deploy
Code Repo-#blue>Pre-Prod:Deploy
deactivateafter Code Repo
activate E2E Repo
note over E2E Repo: Time Trigger
E2E Repo-#blue>E2E Env: Deploy
Code Repo<#purple--E2E Repo:Call No-Data Regression Tests
Code Repo-#green>E2E Env: Run No-Data Regression Tests
loop Source: Config file detailing scenarios and data
E2E Repo-#blue>E2E Env: Deploy Scenario Test Data
Code Repo<#purple--E2E Repo:Call Scenario Regression Tests
Code Repo-#green>E2E Env: Run Scenario Regression Tests
end
note over Code Repo, E2E Env: All tests successful
E2E Repo-#blue>E2E Env:Tear down
Code Repo<#purple--E2E Repo:Call Deploy
deactivateafter E2E Repo
Code Repo-#blue>Prod: Deploy
bottomparticipants 
```

