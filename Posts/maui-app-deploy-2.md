---
description: "Part 2 of the .NET MAUI deployment series, covering the complete process for deploying iOS apps to the Apple App Store with signing and distribution guidance."
title:  "Deploying your .NET MAUI apps to production - Part 2: iOS"
date:   2023-01-22 0:00:00 +1000
image:  /images/posts/maui-deploying-image-2.png
tags:   [mobile, maui, ui, deploying, production]
categories: [.NET, Mobile]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

 This post is part two of a three part series:

* [Part 1: Android](/posts/maui-app-deploy/)
* Part 2: iOS (this post)
* [Part 3: Windows](/posts/maui-app-deploy-3/)

In part one of this series, we saw how to build, sign and deploy Android apps built with .NET MAUI to the Google Play store. In part two, we'll look at deploying the same app (MauiStockTake) to the iOS App Store.

:::info
MauiStockTake is an app we build in my book [.NET MAUI in Action](https://www.manning.com/books/dot-net-maui-in-action?utm_source=goforgoldman&utm_medium=affiliate&utm_campaign=book_goldman_dot_5_10_22&a_aid=goforgoldman&a_bid=38933097), for a fictional client called _Mildred's Surf Shack_. You don't need the book, or the app, to follow along with this; just substitute references to MauiStockTake with your own app.
:::

As with Part 1, the process described here is accurate at time of writing but could be subject to change. However, the overall process will remain the same and this should serve as a good reference for the overall process even if the details of some steps change.

# Part 2: Apple
You can develop apps for iOS devices using macOS or Windows, but you need a macOS device to develop apps for macOS, and you cannot sign and distribute apps to the iOS or macOS App Store without a macOS computer.

This doesn’t need to be your developer machine; you can connect remotely to a Mac from Visual Studio for Windows. You can also use a macOS build agent in a CI/CD pipeline or use a remote ‘Mac for hire’ service. But you will reduce development friction if you have access to macOS during development. It’s not uncommon for teams working on cross-platform products to have some members working on Windows, some on macOS and some on both.

Because of this requirement, while some of the information in this section can be adapted to work with Visual Studio on Windows, **the instructions are focused on macOS**.

We’re only going to step through setting up an iOS device for development, as you can run your .NET MAUI apps on your developer machine without these steps. However, if you want to set up another macOS device for debugging (e.g., a tester on your team), the steps will work for macOS too.

We’re also only going to walk through iOS distribution; but again, the steps will work for macOS too.

## Developer Program
To enroll in the Apple developer program, you need an active Apple ID. If you don’t have one, you can create one by going to [the Apple ID website](https://appleid.apple.com), or you can create it during the enrollment process.

Membership in the Apple developer program costs $99 USD every year. You can enroll as an individual, or you can create an organization enrollment, then invite members to join your team using their Apple ID email address. Individuals who join an organization do not need their own Apple developer program membership.

To enroll in the Apple developer program, go to https://developer.apple.com/programs/enroll/. You can read more about the process here too, including the different steps for individual and organizational enrollment.

To develop and distribute apps via Apple’s App Stores, you need to create _provisioning profiles_ in the Apple developer portal. Provisioning profiles come in two flavors: development profiles and distribution profiles. Development profiles consist of one or more device IDs, a certificate, and an app identifier, as shown in the figure below.

![A development profile is used to run apps on Apple devices during the development stage, and is comprised of one or more device IDs, a development certificate, and an app identifier](/images/posts/apple-dev-profile.png)

:::info
It’s possible to develop apps using physical devices without a paid Apple developer program membership. You can find out more about free provisioning here: https://learn.microsoft.com/xamarin/ios/get-started/installation/device-provisioning/free-provisioning. This may be useful while you’re learning, but it is not suitable for use in a team (see _Automatic provisioning_ below) and cannot be used for distribution. As a professional app developer, you will need an Apple developer program membership.
:::

Let’s start by creating a development profile so that you can run MauiStockTake on a physical device. Once you have an Apple ID that is enrolled in the developer program (or has joined an enrolled organization), you can follow steps. The first phase is to create the certificate, and the easiest way to do this is with Visual Studio.
1.	Open Visual Studio for Mac and click on **Preferences** in the **Visual Studio** menu.
2.	Scroll down the menu on the left until you get to the **Publishing** section. Expand it if it’s not already expanded and click on **Apple Developer Accounts**.
3.	Locate the **Add** dropdown and select **Enterprise account**.
4.	Enter the email address and password for your Apple ID. You’ll be prompted to enter a multi-factor authentication (MFA) code; depending on how you’ve set up MFA, generate the code, then enter it here.

    :::info
    MFA is a requirement for the Apple developer program.
    :::

5.	Once your account has synchronized, ensure the team is selected in the table and click on **View Details...**.
6.	Open the **Create certificate** drop down and choose **Apple Development**.
Visual Studio will automate several steps behind the scenes for you and will generate an Apple development certificate with a corresponding private key in your Keychain. Let’s add the other two components needed for the profile in the Apple developer portal.
1.	Log in to the Apple developer portal (https://developer.apple.com, click on the **Account** menu to log in) and go to **Devices**.
2.	Click on the plus (+) button to add a new device and give it a meaningful name (like `Matt’s iPhone` for example).
3.	You also need to enter a device ID (UDID). The easiest way to find this is for an iOS device is through iTunes, and for a macOS through the System Information app. There is no first-party documentation for finding this so if you’re having trouble finding your device’s UDID, your favorite search engine will likely be helpful.
4.	Once you’ve entered the UDID and name, the **Continue** button should become enabled. Click on this to proceed, then click **Register** on the confirmation screen.
Now that the device is registered, we need to create an identifier for our app:
1.	Click on the **Identifiers** menu item on the left and click the plus (+) button.
2.	Ensure that **App IDs** is selected, then click **Continue**. Select **App** on the next screen, then click **Continue** again.
3.	On the next screen, enter a meaningful description such as `MauiStockTake App`, and enter the bundle ID exactly as you put it in the `MauiSTockTake.UI.csproj` file.

    :::info
    This screen is where you would declare any special capabilities your app needs. If your app uses any of these features , you must include an `Entitlements.plist` file to declare them. You can find out more about entitlements [here](https://learn.microsoft.com/dotnet/maui/ios/deployment/entitlements).
    :::

    :::warning
    You can select an option here to enable Mac Catalyst for this identifier. **Do not do this**. While .NET MAUI uses Mac Catalyst to build apps for macOS, it produces different builds for iOS and macOS, and this option simply uses the iOS build for macOS. You should create a second identifier for your Mac app.
    :::

4.	Ensure that **Explicit** is selected for the bundle ID, then click **Continue**. Double check the information on the confirmation screen, then click **Register**.
At this stage, we’ve got the three components we need to create a development profile (certificate, device ID, and app identifier), so we can go ahead and create it.
1.	Click the **Profiles** menu item on the left and click on the plus (+) button. Select **iOS App Development** as the profile type, then click **Continue**.
2.	Use the dropdown to select the app identifier you just created. You can leave the default selection of No for offline support (you can change this if you think it’s relevant to you), then click **Continue**.
3.	Select the certificate you have created. As you progress, and especially if you’re part of a team, you may need to include multiple certificates in a profile. But for now, the one we’ve created is enough. Click **Continue** once your certificate is selected.
4.	Select the device you have registered. As with certificates, it may be necessary to include multiple devices in a development profile, especially when working on a team. But for now, the certificate you have just created is sufficient. Click **Continue** once you have selected it.
5.	Enter a meaningful name for the profile, such as `MauiStockTake Development Profile`, then click **Generate**.
This will create a profile that you can use to run your app on a physical device rather than just the emulator. Let’s go back to Visual Studio and use the profile:
1.	Ensure the profile is downloaded. To do this, go back to the Apple Developer Accounts section of the Preferences screen. Ensure that the account and team are selected and click on the **View Details…** button.
2.	This should trigger a download of all your provisioning profiles, but you can also force it manually by clicking on the **Download All Profiles** button.
3.	Click the **Close** button to close the details, then **OK** to close preferences. Then right-click on the `MauiStockTake.UI` project and select **Properties** from the menu.
4.	Scroll through the left-hand menu until you get to the **iOS** section and click on **Bundle Signing**.
5.	Ensure that the **Configuration** is set to Debug. For the Signing Identity, use the drop down to select the developer signing identity you have created.

    :::info Title="Automatic provisioning"
    If you are working on multiple projects for multiple teams, you will see a long list of signing identities, and will need to use the unique identifier (mix of letters and numbers) to pick the right one. You can get this from the Apple developer portal, or you can just set the Signing Identity to **Developer (Automatic)** and Visual Studio will identify the right identity based on your app’s bundle ID. <br><br>While I have shown you how to explicitly select a profile for development, you should use automatic provisioning whenever possible. This is most important when working on a team, because the signing identity is saved in the .csproj file. When you check this into source control, each developer will have to change it every time they pull the latest changes.
    :::

6.	Use the **Provisioning profile** dropdown to select the profile you have just created, then click **OK**.
7.	Ensure your physical iOS device is connected to your Mac via a cable and accept any prompts that are displayed on your device.

    :::tip
    You can debug wirelessly without using a cable, and it often works well. But the most reliable way to debug on an iOS device is with a cable. You can read more about setting up wireless deployment [here](https://learn.microsoft.com/xamarin/ios/deploy-test/wireless-deployment).
    :::

8.	In the toolbar, ensure that MauiStockTake.UI is selected as the startup project and **Debug** configuration is selected. From here, you should be able to select your physical device as a deployment target. Click the run (▶️) button, and the app should build and deploy to your physical device.
Note that if you are using iOS 16 or later, you also need to enable developer mode on your device, which you can read how to do [here](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device).

## Bundle Signing
Now that we’ve created a development profile, we can debug our app on a physical iOS device, but we still need to create a distribution profile so that we can deploy it. Distribution profiles are similar to development profiles; they’re comprised of a development certificate and an app ID (as shown in the figure below) and the process to create them is similar.

![A distribution profile is constructed from a distribution certificate and an app identifier. As it’s for distribution rather than development, it’s not tied to any devices, so no device IDs are required](/images/posts/apple-distribution-profile.png)


To create a distribution profile, follow these steps:
1.	Create a distribution certificate. You can do this in Visual Studio, following the steps above used to create a development certificate, but select **Apple Distribution** instead of Apple Development.
2.	Go to the Apple developer portal and go to Profiles. Click on the plus (+) button to add a new profile.
3.	Under the **Distribution** heading, select **App Store**, then click **Continue**.
4.	Select the MauiStockTake App ID from the dropdown, then click **Continue**.
5.	Select the distribution certificate you just created, then click **Continue**.
6.	Give the profile a name. Something like `MauiStockTake [your name] Distribution` would be appropriate. (Add your name or another identifier as it is dependent on a certificate tied to your key chain). Then click **Generate**.
This will create a distribution profile you can use. For good measure, ensure the profile is downloaded by clicking the Download All Profiles button under Apple Developer Accounts in Visual Studio preferences, as we did above. Now that we’ve got a distribution profile, let’s put it to use.

## Deploying to the store
Whereas the Google Developer console is an all-in-one resource for managing all aspects of your app, the Apple Developer website is only used for managing the development aspects (certificate, profiles, devices, and app identifiers). You manage the distribution side using [App Store Connect](https://appstoreconnect.apple.com). App Store Connect is where you manage all the commercial aspects of your app, including the various Apple agreements you need to accept, sales, reports and analytics, users, and the apps themselves. The figure below shows how the three resources you will use work together.

![A distribution profile is constructed from a distribution certificate and an app identifier. As it’s for distribution rather than development, it’s not tied to any devices, so no device IDs are required](/images/posts/apple-ecosystem.png)

Let’s set up the app registration:
1.	Go to App Store Connect and sign in with your Apple ID.
2.	Click on the **Apps** tile, then click on the plus **(+)** button.
3.	In the New App dialog, tick the iOS platform, and enter MauiStockTake in the Name field. Choose **English (Australia)** from the language dropdown (or whatever language you feel is appropriate) and choose MauiStockTake from the Bundle ID dropdown.
4.	The SKU field is not required, but as we are creating the iOS specific instance, it’s useful. Enter mauistocktake-ios as the SKU (so that we can add the macOS version later).
5.	Select Full Access under User Access, then click **Create**.
This will create an App Store registration for MauiStockTake (it won’t be listed yet). If you've purchased _.NET MAUI in Action_, you can find some sample assets in the chapter 12 resources folder, along with a sample listing and description you can use (of course you can write your own too).

Now that we’ve got an app registered, it’s time to deploy our bundle. Unlike the Google Play store, you can deploy your first build right from Visual Studio.

:::warning
At the time of writing, publishing directly from Visual Studio for Mac is a partially complete (and unsupported) feature. It will work for single-project apps but not for apps that have dependencies on other projects (like MauiStockTake). I’ve included the steps here as this should be resolved by the time this goes to print (and will be useful for other apps even if not), but in the event that this issue is not resolved, you can use the .NET CLI to publish the app (instructions [here](https://learn.microsoft.com/dotnet/maui/ios/deployment/overview?view=net-maui-7.0#publish)).
:::

To do this, you need to create an app-specific password, which Visual Studio will use to contact Apple’s API and deploy your build. Let’s create this password first.
1.	Go to [Apple ID](https://appleid.apple.com) and log in. From the menu on the left, select **Sign-In and Security**, then **App-specific passwords**.
2.	Click **Generate an app-specific password**, then, when prompted, enter a meaningful name that represents how the password is used (for example `Visual Studio`).
3.	Click the **Create** button. You will then be shown an app-specific password. Keep this page open for now as we will copy it into Visual Studio shortly.

    :::tip
    Treat this password with care (i.e., don’t share it or store it in plain text, etc.), but don’t worry about storing it; you can revoke it and generate a new one at any time.
    :::

4.	In Visual Studio, ensure that Release configuration is selected in the toolbar and that a physical iOS device is selected as a target.

    :::warning
    You can also select *Generic Device* from the iOS Build Devices section of the build targets list to create an archive, but this archive won’t match your distribution profile and cannot be uploaded to App Store Connect.
    :::

5.	Run the app. This will ensure that it works as expected with Release configuration, and will also ensure all the required build assets are generated.
6.	In Solution Explorer, right-click on the MauiStockTake.UI project, and select **Archive for Publishing.**
7.	Visual Studio will now build, bundle and archive the app. You will see a progress spinner and current task in the status bar (bottom left); the final step will be `Archiving App Bundle…` which may take a couple of minutes to complete. You can also view the progress in real-time by opening the Archive output window (View > Other Windows > Archive).
8.	When the process has finished, the status bar will show `Packages successfully restored`, and the Archive window will show `Done building project “MauiStockTake.UI.csproj”`. Right-click on MauiStockTake.UI in Solution Explorer and select **View Archives**.

    :::tip
    Visual Studio for Mac groups all non-output windows (e.g., code files, or anything that is not a console or error tab) under the Documents tab. If you can’t find the tab you’re looking for, check under here.
    :::

9.	In the Archives tab, you should see MauiStockTake.UI listed in the table with iOS shown as the platform. The Creation Date property should correspond to the archive you just created. You can either right-click and select **Sign and Distribute** or click on the **Sign and Distribute…** button at the bottom of the window.
10.	You will be prompted to choose a distribution channel. As we want Visual Studio to upload the build directly to Apple, choose **App Store**, then click **Next**.

    :::info Title="Apps for a single business"
    Typically, you wouldn’t distribute an app like MauiStockTake through the various storefronts. In fact, Apple’s developer guidelines don’t allow apps intended for use by a single company to be deployed to the App Store.

    Instead, Apple recommends using their Apple Enterprise program, which lets you distribute an app internally to users inside your business. Another popular approach, and a better one if you’re serving more than just Apple users, is to use a mobile device management (MDM) tool, like Microsoft Intune or Airwatch.

    To export bundles for use by these systems, you can select the Ad Hoc or Enterprise distribution channels, which will output an IPA file that can be imported by your MDM tool.
    :::

11.	 Select the **Upload** option, then click **Next**. Visual Studio will show you a table each listing available signing identities, apps, and provisioning profiles. Select the identity you have just created, the MauiStockTake.UI app, and the provisioning profile you have created, then click **Next**.
12.	 On the next screen you will need to enter the app-specific password you created at the Apple ID website. Your Apple ID username (email address) may be pre-filled; if it is, ensure it is selected, otherwise type it into the Apple ID Username box.
13.	 Paste the app-specific password you created into the **App-Specific Password** field, then click **Next**.
14.	 Review the information on the last screen, then click the **Publish** button. Select a location for the IPA file (the Apple app package) to be saved, then click **Save**.


:::warning
As with Android archives, don’t add this to source control. Save it to downloads or to a git ignored Archives folder in the repo.
:::


15.	 You may be prompted to enter your macOS user password so that Visual Studio can gain access to Keychain. This is needed so that the private key for the certificate used in the distribution file can be used to sign the archive. Enter the password, then click **Allow** (you can also click **Always Allow** for convenience). You may be prompted more than once which is normal.
16.	 Eventually, the app bundle will upload to App Store Connect and you should see a green banner saying `Publishing Succeeded` and a message saying `Your app is ready to go`. Click the **Close** button. Your app bundle has now been uploaded to App Store Connect.
17.	 Go back to App Store Connect, and navigate to your MauiStockTake app. Go to the **TestFlight** tab and you should see the build you have just uploaded in the Builds table with the status shown as `Processing`.
18.	 App Store Connect will perform some automated scanning of your app bundle, which can be completed as quickly as 30 minutes but averages a couple of hours. Check back periodically until the status has changed to `Missing Compliance`.
19.	Once the status has changed, click the **Manage link** to add the required compliance. Select the option to specify that none of the listed encryption algorithms are used (`SecureStorage` uses the OS’s built-in encryption which is exempt). Then click **Save**.

The status will be shown as `Ready to Submit`. This means that your app can now be submitted to Apple for review and, when approved, can be released on the App Store. In the meantime, we can release the build to internal testers so that they can start giving us feedback.

:::info
Unlike with Android apps, Internal testers must be people with an Apple ID that is registered as part of your team.
:::

1.	In App Store Connect, click the plus **(+)** button next to **Internal Testing** in the left-hand menu.
2.	Add a name for the group of testers. A sensible name would be `MauiStockTake Internal Testers`. Leave the option to automatically distribute builds selected, then click **Create**.
3.	Click the plus **(+)** button next to the **Testers** heading (it will currently show that the group has 0 testers). You will be shown a list of all available testers that you can add. This list will include your own Apple ID, and anyone else registered as part of your team. To add other people, follow the link to **Users and Access**.
4.	Add at least yourself as a tester, then once you have selected all the internal testers you want to add, click the **Add** button.
Your testers will need to install the TestFlight app from the app store, but they will receive an email with instructions once you have added them.

Once you have added internal testers, the **External Testing** menu item will become available. You can add external testers, meaning anyone with an Apple ID (you just add their email address rather than assigning them a role in User and Access). However, you must submit your app for review with Apple before you can add external testers.

## Releasing to Production
Once your build has been successfully tested, it’s time to release it to production. In App Store Connect, navigate to your app and ensure you are in the **App Store** tab. You will need to step through the left-hand menu links under the **General** heading.

You will need to complete the **App Information**, **Pricing and Availability**, and **App Privacy** sections. See the [tip in part 1](/posts/maui-app-deploy/#developer-program) (about the Google developer program) regarding the privacy policy. Once you have completed these, under the iOS App heading in the left-hand menu, you should see the version number (currently 1.0, unless you have changed it in the `.csproj` file) with **Prepare for Submission**; click on this to go back to the main store listing.

If you've purchased _.NET MAUI in Action_, the chapter 12 resources folder contains various assets and sample text you can use for this section. Under the **App Review Information** heading, you will need to provide sign-in information for MauiStockTake so that Apple’s reviewers can log in and test the app.

:::warning
**Note for readers of .NET MAUI in Action**<br>You will not be able to submit MauiStockTake for review, unless you host a publicly accessible instance of the API.
:::

Once you have completed all the sections on this page, you can click on **Add for Review**. Your app will then go into a queue to be reviewed by Apple staff. This process can take anywhere from (in extremely rare cases) a couple of hours to a few weeks, with the average being between two days and a week. The time can be impacted by how many apps are awaiting review; anecdotally, people that submit apps over seasonal holidays tend to get quicker review times as there are fewer people submitting apps during this period.

With your own apps, it is extremely likely that Apple will reject your initial build. Apple’s review process is opaque and if they encounter something they are uncomfortable with during the review, they will reject it. I have personally had a build rejected by reviewers because it crashed; upon examining the device logs provided by the reviewers, I was able to identify that this was caused by an unrelated iOS issue. Had the reviewer just tried again, the app would likely have worked, but I simply increased the version number and resubmitted the build without any other changes, and it successfully passed the review the next time around.

Apple reviews can be frustrating, but eventually you will have a build accepted. Nothing beats the exhilaration if seeing the email in your inbox letting you know that your app has been approved and is now available on the App Store.


In [part 3](/posts/maui-app-deploy-3/) of this series, we'll see how we can publish Windows apps to the Microsoft Store.
