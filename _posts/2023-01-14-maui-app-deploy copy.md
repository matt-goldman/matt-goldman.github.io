---
layout: post
title:  "Deploying your .NET MAUI apps to production"
date:   2025-01-14 0:00:00 +1000
image:  /images/maui-deploying-image.png
tags:   mobile maui ui deploying production
categories: [.NET, Mobile]
---

Building apps is fun, but sadly very few people get paid to build apps just for fun; usually, there’s an expectation that you will deliver a working app to users. In this long-form reference post, we’ll see how to do just that. Running apps on simulators, emulators, and developer machines is cool, but not as cool as having an app you’ve built running on a real device. And, of course, the most rewarding feeling of all is seeing your completed product, deployed and being used by real people.

# Developer Programs and App Stores
There are a few ways you can distribute your apps to users, but typically you will distribute them via the public stores. For iOS and macOS this is the App Store, for Android it’s the Google Play store, and for Windows it’s the Microsoft store.
Microsoft, Google, and Apple have paid developer programs. You don’t need to join these developer programs to _develop_ apps for these platforms, but you do have to join them to distribute aps through their stores. Note that you don’t necessarily need to join these programs personally; an organization can have an enterprise membership, and you can be added as a developer to a team.    

In a real-world scenario, in the case of MauiStockTake, this is likely the approach that you would take (i.e., Mildred’s Surf Shack would purchase a membership, and developers from Beach Bytes would be added to the team). However, for the purposes of this chapter we’ll go through the process as if you were using a personal membership and this was your own app.    

In addition to developer program membership, to distribute builds of your app through the stores they must be signed. This means that a cryptographic signature is included with the build that can be used to verify that the app has come from the original creator.    

In the remainder of this chapter, we’ll look at what’s required to join these programs, and how to sign and distribute your app through the stores.    

> **IMPORTANT**  At this point we are going to start uploading test builds of MauiStockTake to the various stores. To avoid conflicts with the application ID, I suggest you change yours now, replacing `mildredssurfshack` with your name, or some other unique identifier. You will not be able to upload an app with a bundle ID that is already in use.
{: .prompt-warning }

Note that you won’t be able to publish release versions of MauiStockTake to the stores, but this section will serve as a reference for other apps that you want to publish.    

# Google
To publish apps to the Google Play store, you need a Google developer account. Before you can get started, you must have a Google account. If you have an `@gmail.com` email address, you have a Google account, and if not, you can sign up for one free of charge by going to https://www.google.com, and clicking on the **Sign In** button in the top right of the screen. This will take you to a login prompt, with a **Create Account** button at the bottom of the form. Click on this and follow the guided steps to create a Google account, and once this is complete, you’re ready to register as a Google developer.    

## Developer Program
To register your Google account as a Google developer account, you will need to pay a one-time fee of $25 USD and verify some of your personal details. The full steps, including guided links through each one, can be found here: https://support.google.com/googleplay/android-developer/answer/6112435. Note that you must complete the identity verification steps before you can publish apps through Google Play.    
    
Once you have signed up, you gain access to the Google Play developer console, available at https://play.google.com/console. **In the console, click on the Create App button in the top right-hand corner.** Fill in the form and then click on the Create App button in the bottom-right to register the app. After this, you’ll be taken to the app’s dashboard.    

Now that your app is registered in the Google Play console, there are some additional setup tasks that you need to run through. These steps are listed as a set of tasks on the dashboard; you will need to work through all these too to provide necessary metadata for your app. Most of these you can simply click through and answer the questions, but for the privacy policy you need to provide a link. It’s a good idea to consult a solicitor to help you draft or review a privacy policy for your app, but you can also use a free privacy policy generator such as https://termly.io. For testing purposes, you are free to use this one: https://www.privacypolicygenerator.org/live.php?token=vbOLjH1o4uHRr73yvyfSm7tYqPcwl1tX.    

> When you publish an app, it’s a good idea to have a website for either the app or the publishing company as this lends credibility to the app. You can (and should) host your privacy policy on your website, but during the development phase you could host the policy as a markdown file on GitHub.
{: .prompt-tip }


Once you’ve completed the first 10 steps, you should see 10/11 green ticks. The final step, creating the store listing, will also need some additional assets. You can find these in the chapter 12 resources folder, along with a sample listing and description you can use (of course you can write your own too).    

With the app metadata now set up in the Google Play developer console, we’re ready to submit a build.

## Bundle Signing
In this section, we’ll see how you can sign your app bundles so that Google Play can verify that they have come from the original publisher. The process is summarized in this figure:
 
![](/images/google-signing.png)
_You can build an app package from your code, and then create an app bundle that you sign with your unique key. Google Play will use this key to verify that you are the rightful publisher of the app, and then use their own key to sign the packages that they distribute to users._

Apps for Android are packaged as Android Package Kit (APK) files, and you can sign and distribute APK files through an MDM, or even just side-load them (meaning to copy the APK file directly onto the device, rather than installing via the Google Play store). However, to distribute your app via the Google Play store, it must be packaged in Android app bundle (AAB) format.    

AAB was introduced in 2018 as a way of separating resources, so that only parts of your app specific for the device running it get deployed (e.g., high-resolution graphics assets won’t be deployed to a device with a low-resolution screen). You can sign both your APK and AAB files, but we’ll skip signing the APK as it requires you to provide the password for the key file during build, and as we won’t be distributing the APK, it’s an unnecessary step.    

As we can see in figure 12.xx, instead we’ll just sign the AAB. This will enable Google Play to verify us as the original publisher; they’ll then sign the package with their own certificate (so that our end users’ Android devices don’t have to trust our key).    

Let’s create a signed app bundle:
1.	Ensure your app builds in Release configuration without any errors.
2.	Ensure that an Android target is selected in the toolbar and that Release configuration is selected. 
3.	**Visual Studio for Windows**: Right-click on the MauiStockTake.UI project in solution explorer and select Publish.
4.	**Visual Studio for Mac**: Right-click on the MauiStockTake.UI project in solution explorer and select Archive for Publishing.
5.	If the archive you have just created is not selected, select it. On macOS, click the **Sign and Distribute…** button, on Windows click the **Distribute…**  button.
6.	Select Ad Hoc as the distribution channel. We’re going to distribute via Google Play, but we need to produce the bundle file and manually upload it the first time.
7.	Create a signing key. On macOS, click on the **Create a New Key** button, on Windows click the + button. 
8.	Create an alias and password for the ley store. It makes sense to create a key store per app as this reduces risk (see warning below), so a sensible alias would be `MauiStockTakeKey`.
    
> Export the key store and store it securely along with the password. Most password managers (like Bitwarden and LastPass) allow you to save files, so this is a good option.
{: .prompt-tip }

> From Google’s point of view, this key store is your Android app. If you lose the key store or the password, you will not be able to upload new versions of your app to Google Play. I have heard of Google support helping people around this, but it is not something you should depend on.
{: .prompt-danger }

9.	In the section that says “Enter at least one of the following”, put `Mildred’s Surf Shack` in the Organization field. Remember that this key represents the publisher, not the developer (although of course in many cases they may be the same).
10.	**On Windows**: Ensure that the signing identity you have just created is selected and click **Save As**. Enter the password for the key store and click on **OK**.
11.	**On macOS**: Click on the Publish button, then choose a location to save the AAB file. Enter the password for the key store and click on **OK**.
    
> Don’t check this file in to source control. Either save it to a local folder (e.g. Downloads in your user profile), or alternatively create an Archives folder in the repo and add it to the .gitignore file.
{: .prompt-tip }

This creates a signed AAB that you can now upload to the Google Play store. On macOS, click **Reveal in Finder** to show the signed AAB file, on Windows click the **Open folder** button. In the next section, we’ll upload our first build to Google Play.    

## Deploying to the Store
You can deploy directly to the Google Play store from Visual Studio (for macOS or Windows), but before you can do that, you need to upload at least one build manually. This allows Google Play to match the signature of the key on all future bundles to the original key used for the first version of the app.    

In this section, we’re going to upload the bundle to the Internal Testing track and select testers to roll the build out to. A summary is shown in the figure below. After that, we’ll configure Visual Studio to upload the signed bundles directly.
 
![](/images/google-testing-track.png) 
_After creating a signed app bundle, we upload it via a web browser to the Google Play Developer Console. We can then create a release in the internal testing track and assign the bundle to it. We also create a list of email addresses for valid testers and assign that list to the release. Then we can provide testers with a link to install the build._

Let’s upload our bundle:
1.	Log in to the Google Play developer console and select your app from the list.
2.	From the menu on the left select **Internal testing**, then click on **Create new release**.
3.	The next screen directs you to choose an app bundle. If you’ve already uploaded bundles, you can select one from the library. But for this first build, we’ll upload the signed bundle we created in the previous section. You can click on the **Upload** button and browse to your file, or you can simply drag and drop the AAB file onto the upload area.
4.	Once bundle has uploaded, it will show up as the listed bundle for the release as a table underneath the upload area. Click **Review release** to move to the next step.
5.	If your app targets Android 13 (API 33), which it does using the default template, in the next step you’ll see an error telling you that you must complete the advertising ID declaration. Click on the **Complete declaration** button, then in the declaration choose **No**, then click **Save**.

> We’re not using the advertising ID in this app, but you would have to select Yes for any apps that do use it. To find out more about it, go to https://support.google.com/googleplay/android-developer/answer/6048248.
{: prompt-info }

6.	You can click the **Start roll-out to Internal testing** button now, and then the **Rollout** button in the dialog that appears. This will make your app available to internal testers, which we’ll add in the next step.
7.	Go to the Testers tab and click on the **Create email list** button. This will let you create a list of email addresses for testers. You can maintain multiple lists; you might want to invite different groups of testers for different apps, or for different tracks (e.g. internal, open beta, etc). `MauiStockTake Internal Testers` would be a sensible name for this list, so add it in the **List name** field.
8.	In the **Add email addresses** field, add the email addresses of any testers you want to include. For now, you should add the email address you use with your Google Play account so that you can verify that the test build can be installed. Once you’ve added all your testers’ email addresses, click the **Save changes** button.
9.	This will return you to the Internal testing screen in the Google Play developer console. You should see the email list you created in the Testers tab.
    
> All of your email lists will be visible, but when you only have one it’s easy to assume the list has been added to testers. You must check the box next to any lists you want to include (and by extension, uncheck any lists you don’t want to include for this track for this app).
{: .prompt-tip }

Note that in the developer console there is a **Track summary** heading, and under here it may say Inactive. This means it’s pending review from Google which for this stage is usually very quick (there is a longer review to release to production). Check back every few minutes until it is marked as active, at which point the build is available to your internal testers.    

In the Testers tab, underneath the email lists, is the heading **How your testers join your test**. Send your testers the link that you can copy from here for them to access the test build.    

## Deploying from Visual Studio
Once you’ve uploaded your initial build, you can sign and distribute your AAB directly from Visual Studio, without having to manually upload it, as shown in the figure below.
 
![](/images/google-visual-studio.png)
_Once we have manually uploaded at lease least one build, we can then deploy directly from Visual Studio. An app registration needs to be created in Google Cloud platform to generate OAuth credentials that will allow Visual Studio to call the publish API in Google Play and upload the signed AAB._

The first thing we need to do to enable this is set up API access for your Google Play developer console. Go back to the console and ensure you’re on the **All apps** screen (rather than in the MauiStockTake app). From here:
1.	Expand the **Setup** menu and click on **API access**.
2.	On the API access screen, click on the **Choose a project to link** button, then click **I agree** to accept the terms of service.
3.	Select the option to **Create a new Google cloud project**.
4.	Under OAuth clients, click on **Refresh OAuth consent**.
5.	On the OAuth consent screen, select the **Internal** user type option, then click on the **CREATE** button.
6.	The next screen has three sections: App information, App domain and Developer contact information. Complete the required fields, which are the **App name, User support email**, and **Developer contact information email addresses**. Enter your email address in the two email address fields, and put `Mildred’s Surf Shack API Access` as the App name.
7.	On the next step of the wizard, click on the **ADD OR REMOVE SCOPES** button. Select all the scopes in the table. Note the scope required to programmatically publish your app is `./auth/androidpublisher`, but the others are standard scopes anyway.
8.	Click the **UPDATE** button to save the scope selections, then click on the **Credentials** menu, and click on the **+ CREATE CREDENTIALS** button at the top, and select **OAuth Client ID**.
9.	Choose **Desktop app** as the **Application Type** and enter `Visual Studio` as the name. Then click on the **CREATE** button.
    
Once you do this, the console will show you a dialog containing your client ID and client secret. You can download a JSON file containing these for safe keeping. To publish a new build of the app, increase the `ApplicationVersion` in the `csproj` file to 2 (not the `ApplicationDisplayVersion`). You can now right-click on the project and select publish, as you did before. Repeat all the same steps, except **instead of choosing Ad hoc, choose Google Play**.    

You’ll be prompted to enter your client ID and client secret; these are the values you just obtained from the console. From here the process is mostly the same, except that now, as Visual Studio will upload the AAB file directly to Google Play, you need to select the track (e.g., Internal testing, production, etc.).    

## Releasing to production
Once you’ve got test builds in the Google Play developer console, provided that all the steps up until now have been completed and your app metadata is ready, releasing to production is a simple step, summarized in the figure below.

![](/images/google-production-track.png) 
_To release an app to production, create a new release in the Production track. Select an app bundle from your library (you can upload a new bundle, if necessary, e.g., if changing API URLs from testing to production), and select the countries the app should be released to. Once reviewed by Google, your app will be available to download via the store._

Simply choose the *Production* release from the menu (above the *Testing* expandable menu section), and in here, choose an app bundle by selecting *Add from library*. Choose the build that has been successfully tested.    

> Ideally you will release a tested build from your library, which will give you confidence that it works well. However sometimes you may want to upload a new build. For example, if your testers have been using a sandbox or QA API, you may need a new build that points to the production environment.
{: .prompt-info }

For the final step, you will be prompted to select the countries to distribute to. For now, just select the country you are in. For real-world apps, select all the countries you want your app to be available in. In some cases, this will be all countries, but if possible, you should try to restrict your selection to only those countries where your app will be used.    

Other than this, releasing an app to the Production track is no different to internal testing (or any other track). When you’re ready, click on the **Start roll-out to Production** button. At this stage, Google will review your app and come back to you with any issues they have found, otherwise, once they have finished, your app will be available to download in the Google Play store.    

# Apple
You can develop apps for iOS devices using macOS or Windows, but you need a macOS device to develop apps for macOS, and you cannot sign and distribute apps to the iOS or macOS App Store without a macOS computer.    

This doesn’t need to be your developer machine; you can connect remotely to a Mac from Visual Studio for Windows. You can also use a macOS build agent in a CI/CD pipeline or use a remote ‘Mac for hire’ service. But you will reduce development friction if you have access to macOS during development. It’s not uncommon for teams working on cross-platform products to have some members working on Windows, some on macOS and some on both.    

Because of this requirement, while some of the information in this section can be adapted to work with Visual Studio on Windows, **the instructions are focused on macOS**.    

We’re only going to step through setting up an iOS device for development, as you can run your .NET MAUI apps on your developer machine without these steps. However, if you want to set up another macOS device for debugging (e.g., a tester on your team), the steps will work for macOS too.    

We’re also only going to walk through iOS distribution; but again, the steps will work for macOS too.    

## Developer Program
To enroll in the Apple developer program, you need an active Apple ID. If you don’t have one, you can create one by going to https://appleid.apple.com, or you can create it during the enrollment process.    

Membership in the Apple developer program costs $99 USD every year. You can enroll as an individual, or you can create an organization enrollment, then invite members to join your team using their Apple ID email address. Individuals who join an organization do not need their own Apple developer program membership.    

To enroll in the Apple developer program, go to https://developer.apple.com/programs/enroll/. You can read more about the process here too, including the different steps for individual and organizational enrollment.    

To develop and distribute apps via Apple’s App Stores, you need to create _provisioning profiles_ in the Apple developer portal. Provisioning profiles come in two flavors: development profiles and distribution profiles. Development profiles consist of one or more device IDs, a certificate, and an app identifier, as shown in the figure below.
 
![](/images/apple-dev-profile.png)
_A development profile is used to run apps on Apple devices during the development stage, and is comprised of one or more device IDs, a development certificate, and an app identifier._

> It’s possible to develop apps using physical devices without a paid Apple developer program membership. You can find out more about free provisioning here: https://learn.microsoft.com/xamarin/ios/get-started/installation/device-provisioning/free-provisioning. This may be useful while you’re learning, but it is not suitable for use in a team (see _Automatic provisioning_ below) and cannot be used for distribution. As a professional app developer, you will need an Apple developer program membership.
{: .prompt-info }

Let’s start by creating a development profile so that you can run MauiStockTake on a physical device. Once you have an Apple ID that is enrolled in the developer program (or has joined an enrolled organization), you can follow steps. The first phase is to create the certificate, and the easiest way to do this is with Visual Studio.
1.	Open Visual Studio for Mac and click on **Preferences** in the **Visual Studio** menu.
2.	Scroll down the menu on the left until you get to the **Publishing** section. Expand it if it’s not already expanded and click on **Apple Developer Accounts**.
3.	Locate the **Add** dropdown and select **Enterprise account**.
4.	Enter the email address and password for your Apple ID. You’ll be prompted to enter a multi-factor authentication (MFA) code; depending on how you’ve set up MFA, generate the code, then enter it here.
    
> MFA is a requirement for the Apple developer program.
{: .prompt-info }

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

> This screen is where you would declare any special capabilities your app needs. If your app uses any of these features , you must include an `Entitlements.plist` file to declare them. You can find out more about entitlements here: https://learn.microsoft.com/dotnet/maui/ios/deployment/entitlements.
{: prompt-info }

> You can select an option here to enable Mac Catalyst for this identifier. **Do not do this**. While .NET MAUI uses Mac Catalyst to build apps for macOS, it produces different builds for iOS and macOS (recall the compiler directives from chapter 10 for example), and this option simply uses the iOS build for macOS. You should create a second identifier for your Mac app.
{: .prompt-warning }

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

> **Automatic provisioning**<br>If you are working on multiple projects for multiple teams, you will see a long list of signing identities, and will need to use the unique identifier (mix of letters and numbers) to pick the right one. You can get this from the Apple developer portal, or you can just set the Signing Identity to **Developer (Automatic)** and Visual Studio will identify the right identity based on your app’s bundle ID. <br><br>While I have shown you how to explicitly select a profile for development, you should use automatic provisioning whenever possible. This is most important when working on a team, because the signing identity is saved in the .csproj file. When you check this into source control, each developer will have to change it every time they pull the latest changes.
{: .prompt-info }

6.	Use the **Provisioning profile** dropdown to select the profile you have just created, then click **OK**.
7.	Ensure your physical iOS device is connected to your Mac via a cable and accept any prompts that are displayed on your device.
    
> You can debug wirelessly without using a cable, and it often works well. But the most reliable way to debug on an iOS device is with a cable. You can read more about setting up wireless deployment here: https://learn.microsoft.com/xamarin/ios/deploy-test/wireless-deployment.
{: .prompt-tip }

8.	In the toolbar, ensure that MauiStockTake.UI is selected as the startup project and **Debug** configuration is selected. From here, you should be able to select your physical device as a deployment target. Click the run (▶️) button, and the app should build and deploy to your physical device.
Note that if you are using iOS 16 or later, you also need to enable developer mode on your device, which you can read how to do here: https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device.     

## Bundle Signing
Now that we’ve created a development profile, we can debug our app on a physical iOS device, but we still need to create a distribution profile so that we can deploy it. Distribution profiles are similar to development profiles; they’re comprised of a development certificate and an app ID (as shown in the figure below) and the process to create them is similar.
 
![](/images/apple-distribution-profile.png)
_A distribution profile is constructed from a distribution certificate and an app identifier. As it’s for distribution rather than development, it’s not tied to any devices, so no device IDs are required._

To create a distribution profile, follow these steps:
1.	Create a distribution certificate. You can do this in Visual Studio, following the steps above used to create a development certificate, but select Apple Distribution instead of Apple Development.
2.	Go to the Apple developer portal and go to Profiles. Click on the plus (+) button to add a new profile.
3.	Under the Distribution heading, select App Store, then click Continue.
4.	Select the MauiStockTake App ID from the dropdown, then click Continue.
5.	Select the distribution certificate you just created, then click Continue.
6.	Give the profile a name. Something like MauiStockTake [your name] Distribution would be appropriate. (Add your name or another identifier as it is dependent on a certificate tied to your key chain). Then click Generate.
This will create a distribution profile you can use. For good measure, ensure the profile is downloaded by clicking the Download All Profiles button under Apple Developer Accounts in Visual Studio preferences, as we did above. Now that we’ve got a distribution profile, let’s put it to use.
    
## Deploying to the store
Whereas the Google Developer console is an all-in-one resource for managing all aspects of your app, the Apple Developer website is only used for managing the development aspects (certificate, profiles, devices, and app identifiers). You manage the distribution side using App Store Connect (https://appstoreconnect.apple.com). App Store Connect is where you manage all the commercial aspects of your app, including the various Apple agreements you need to accept, sales, reports and analytics, users, and the apps themselves. Figure 12.xx shows how the three resources you will use work together.
 
*Figure 12.xx Releasing an app to the App Store requires three different Apple resources. The Apple Developer portal is where you start by creating an app identifier, then provisioning profiles (its easier to let Visual Studio create the certificates for you)., App Store Connect is where you create an App Store listing, using the identifier you created in the Apple Developer portal. You can create an app-specific password at the Apple ID website, which is used to upload builds to App Store Connect.*    
Let’s set up the app registration:
1.	Go to App Store Connect and sign in with your Apple ID.
2.	Click on the Apps tile, then click on the plus (+) button.
3.	In the New App dialog, tick the iOS platform, and enter MauiStockTake in the Name field. Choose English (Australia) from the language dropdown (or whatever language you feel is appropriate) and choose MauiStockTake from the Bundle ID dropdown.
4.	The SKU field is not required, but as we are creating the iOS specific instance, it’s useful. Enter mauistocktake-ios as the SKU (so that we can add the macOS version later).
5.	Select Full Access under User Access, then click Create.
This will create an App Store registration for MauiStockTake (it won’t be listed yet). You can some images that you can use in the chapter 12 resources folder, along with a sample listing and description you can use (of course you can write your own too).

Now that we’ve got an app registered, it’s time to deploy our bundle. Unlike the Google Play store, you can deploy your first build right from Visual Studio.
    
WARNING At the time of writing, publishing directly from Visual Studio is a partially complete feature. It will work for single-project apps but not for apps that have dependencies on other projects (like MauiStockTake). I’ve included the steps here as this should be resolved by the time this goes to print (and will be useful for other apps even if not), but in the event that this issue is not resolved, you can find the alternative steps here: https://github.com/NET-MAUI-in-Action/Chapter-12/wiki.     

To do this, you need to create an app-specific password, which Visual Studio will use to contact Apple’s API and deploy your build. Let’s create this password first.
1.	Go to Apple ID (https://appleid.apple.com) and log in. From the menu on the left, select Sign-In and Security, then App-specific passwords.
2.	Click Generate an app-specific password, then, when prompted, enter a meaningful name that represents how the password is used (for example Visual Studio).
3.	Click the Create button. You will then be shown an app-specific password. Keep this page open for now as we will copy it into Visual Studio shortly.
    
TIP Treat this password with care (i.e., don’t share it or store it in plain text, etc.), but don’t worry about storing it; you can revoke it and generate a new one at any time.    

4.	In Visual Studio, ensure that Release configuration is selected in the toolbar and that a physical iOS device is selected as a target. 
    
NOTE You can also select Generic Device from the iOS Build Devices section of the build targets list to create an archive, but this archive won’t match your distribution profile and cannot be uploaded to App Store Connect.    

5.	Run the app. This will ensure that it works as expected with Release configuration, and will also ensure all the required build assets are generated.
6.	In Solution Explorer, right-click on the MauiStockTake.UI project, and select Archive for Publishing.
7.	Visual Studio will now build, bundle and archive the app. You will see a progress spinner and current task in the status bar (bottom left); the final step will be Archiving App Bundle… which may take a couple of minutes to complete. You can also view the progress in real-time by opening the Archive output window (View | Other Windows | Archive).
8.	When the process has finished, the status bar will show Packages successfully restored, and the Archive window will show Done building project “MauiStockTake.UI.csproj”. Right-click on MauiStockTake.UI in Solution Explorer and select View Archives.
TIP Visual Studio for Mac groups all non-output windows (e.g., code files, or anything that is not a console or error tab) under the Documents tab. If you can’t find the tab you’re looking for, check under here.
9.	In the Archives tab, you should see MauiStockTake.UI listed in the table with iOS shown as the platform. The Creation Date property should correspond to the archive you just created. You can either right-click and select Sign and Distribute or click on the Sign and Distribute… button at the bottom of the window.
10.	You will be prompted to choose a distribution channel. As we want Visual Studio to upload the build directly to Apple, choose App Store, then click Next.
    
Apps for a single business
Typically, you wouldn’t distribute an app like MauiStockTake through the various storefronts. In fact, Apple’s developer guidelines don’t allow apps intended for use by a single company to be deployed to the App Store.
Instead, Apple recommends using their Apple Enterprise program, which lets you distribute an app internally to users inside your business. Another popular approach, and a better one if you’re serving more than just Apple users, is to use a mobile device management (MDM) tool, like Microsoft Intune or Airwatch.
To export bundles for use by these systems, you can select the Ad Hoc or Enterprise distribution channels, which will output an IPA file that can be imported by your MDM tool.
    
11.	 Select the Upload option, then click Next. Visual Studio will show you a table each listing available signing identities, apps, and provisioning profiles. Select the identity you have just created, the MauiStockTake.UI app, and the provisioning profile you have created, then click Next.
    
NOTE Unless you have created other signing identities and provisioning profiles and have archived other apps, you should only see one of each available in this step.    

12.	 On the next screen you will need to enter the app-specific password you created at the Apple ID website. Your Apple ID username (email address) may be pre-filled; if it is, ensure it is selected, otherwise type it into the Apple ID Username box.
13.	 Paste the app-specific password you created into the App-Specific Password field, then click Next.
14.	 Review the information on the last screen, then click the Publish button. Select a location for the IPA file (the Apple app package) to be saved, then click Save.
    
NOTE As with Android archives, don’t add this to source control. Save it to downloads or to a git ignored Archives folder in the repo.    

15.	 You may be prompted to enter your macOS user password so that Visual Studio can gain access to Keychain. This is needed so that the private key for the certificate used in the distribution file can be used to sign the archive. Enter the password, then click Allow (you can also click Always Allow for convenience). You may be prompted more than once which is normal.
16.	 Eventually, the app bundle will upload to App Store Connect and you should see a green banner saying Publishing Succeeded and a message saying Your app is ready to go. Click the Close button. Your app bundle has now been uploaded to App Store Connect.
17.	 Go back to App Store Connect, and navigate to your MauiStockTake app. Go to the TestFlight tab and you should see the build you have just uploaded in the Builds table with the status shown as Processing.
18.	 App Store Connect will perform some automated scanning of your app bundle, which can be completed as quickly as 30 minutes but averages a couple of hours. Check back periodically until the status has changed to Missing Compliance.
19.	Once the status has changed, click the Manage link to add the required compliance. Select the option to specify that none of the listed encryption algorithms are used (SecureStorage uses the OS’s built-in encryption which is exempt). Then click Save.
The status will be shown as Ready to Submit. This means that your app can now be submitted to Apple for review and, when approved, can be released on the App Store. In the meantime, we can release the build to internal testers so that they can start giving us feedback.
    
NOTE Internal testers must be people with an Apple ID that is registered as part of your team.    

1.	In App Store Connect, click the plus (+) button next to Internal Testing in the left-hand menu.
2.	Add a name for the group of testers. A sensible name would be MauiStockTake Internal Testers. Leave the option to automatically distribute builds selected, then click Create.
3.	Click the plus (+) button next to the Testers heading (it will currently show hat the group has 0 testers). You will be shown a list of all available testers that you can add. This list will include your own Apple ID, and anyone else registered as part of your team. To add other people, follow the link to Users and Access.
4.	Add at least yourself as a tester, then once you have selected all the internal testers you want to add, click the Add button.
Your testers will need to install the TestFlight app from the app store, but they will receive an email with instructions once you have added them.    

Once you have added internal testers, the External Testing menu item will become available. You can add external testers, meaning anyone with an Apple ID (you just add their email address rather than assigning them a role in User and Access). However, you must submit your app for review with Apple before you can add external testers.    

## Releasing to Production
Once your build has been successfully tested, it’s time to release it to production. In App Store Connect, navigate to your app and ensure you are in the App Store tab. You will need to step through the left-hand menu links under the General heading.    

You will need to complete the App Information, Pricing and Availability, and App Privacy sections. See the tip in section 12.xx above (about the Google developer program) regarding the privacy policy. Once you have completed these, under the iOS App heading in the left-hand menu, you should see the version number (currently 1.0, unless you have changed it in the .csproj file) with Prepare for Submission; click on this to go back to the main store listing.    

The chapter’s Resources folder contains various assets and sample text you can use for this section. Under the App Review Information heading, you will need to provide sign-in information for MauiStockTake so that Apple’s reviewers can log in and test the app.
    
NOTE You will not be able to submit MauiStockTake for review, unless you host a publicly accessible instance of the API.    

Once you have completed all the sections on this page, you can click on Add for Review. Your app will then go into a queue to be reviewed by Apple staff. This process can take anywhere from (in extremely rare cases) a couple of hours to a few weeks, with the average being between two days and a week. The time can be impacted by how many apps are awaiting review; anecdotally, people that submit apps over seasonal holidays tend to get quicker review times as there are fewer people submitting apps during this period.    

With your own apps, it is extremely likely that Apple will reject your initial build. Apple’s review process is opaque and if they encounter something they are uncomfortable with during the review, they will reject it. I have personally had a build rejected by reviewers because it crashed; upon examining the device logs provided by the reviewers, I was able to identify that this was caused by an unrelated iOS issue. Had the reviewer just tried again, the app would likely have worked, but I simply increased the version number and resubmitted the build without any other changes, and it successfully passed the review the next time around.    

Apple reviews can be frustrating, but eventually you will have a build accepted. Nothing beats the exhilaration if seeing the email in your inbox letting you know that your app has been approved and is now available on the App Store.    

# Microsoft
The Microsoft Store is a unified platform for the sale and distribution of physical products, digital content (like books and movies), and games and software for the Windows, Xbox, and HoloLens platforms. There are a few ways you can distribute your .NET MAUI apps for Windows users, but the Microsoft Store is the primary distribution platform, and in this section, we’ll see how you can use it to deploy your apps.    

To automate pushing builds from Visual Studio to the store, you will also need an Azure Active Directory (AAD) tenant. It’s best to use the tenant owned by the company you are building the app for (e.g., your client or your employer) if available and if permitted by the security policies. Otherwise, you can create an AAD tenant on the free tier (see https://azure.microsoft.com/free), or you can let the Microsoft Partner Center (MPC) create one for you automatically).    

Distributable Windows apps are bundled in the MSIX package format, which contains your app executable and metadata. To create MSIX files, you need access to Windows. Therefore, the steps in this section are for Windows only. Windows is easy to virtualize on other platforms, but be aware that you will also need access to the CPU architecture you want to deploy for; for example, you cannot create AMD-x64 builds using an ARM64 CPU.     

## Developer Program
The Microsoft Store app developer program has a one-time registration fee of $19 USD for individuals, or $120 USD for businesses. While it is only a one-time fee, you are required to maintain an active presence on the store (meaning you must publish an app), otherwise your membership will be deactivated. If this happens, you will need to raise a support request to get your program membership reinstated.    

To sign up, go to https://developer.microsoft.com/microsoft-store/register/. Click the Sign Up button and complete the form. You will need to pay the registration fee to progress, and once your account is set up, head to the Agreements tab and accept the developer agreement. Your Microsoft developer account is now ready, so the next step is to register the app:
1.	Go to the Apps and Games section in Microsoft Partner Center (https://partner.microsoft.com/dashboard/apps-and-games/overview). 
2.	Click the + New product button and select MSIX or PWA apps.
3.	Enter a name and click Reserve product name. 
    
NOTE MauiStockTake is already reserved so you won’t be able to use that.    

4.	In the Application Overview section, click Start your submission.
5.	Complete the Pricing and availability, Properties, and Age ratings sections. In the Privacy section, you will need to add a privacy policy URL (see the notes and tips in the Google and Apple sections above).
Your app registration is almost ready. We’ll revisit the Partner Center once we have a signed build.

## Bundle Signing
As with Google, you sign your package using a self-signed certificate that the Partner Center associates with your initial build. Microsoft will then sign the build that gets distributed via the store with their own certificate, which enables end user machines to trust it.
To create a signed bundle, follow these steps:
6.	Ensure that MauiStockTake.UI is selected as the startup project in Visual Studio, in Release configuration with Windows as the target.
7.	In Solution Explorer, right-click on MauiStockTake.UI and select Publish…. Select the Microsoft Store under a new app name radio button and click Next.
8.	Ensure that the right identity is selected in the drop-down (in the top right of the publishing window). Visual Studio will contact Microsoft Partner Center to retrieve the list of reserved app names. Highlight MauiStockTake (your variation of it; MauiStockTake is reserved)  and click Next.
9.	On the next screen, leave the defaults for version number and auto-incrementing, and for symbols and artifacts. In the Publishing profile dropdown, select <New…>.
10.	In the Create a new MSIX Publishing Profile dialog, change the Configuration to Release | Any CPU, change the Target Runtime to win10-x64, leave Self Contained as true, and keep the default Package Location. Then click OK.
11.	Click the Create button. The Visual Studio status bar (bottom left) will show the current status, you can also follow the progress in the Output window.
12.	The initial publish will fail; this is ok, by default it adds some metadata in the Package.appxmanifest file that we don’t need and that causes it to fail. Once it has failed, open the Package.appxmanifest file in the Platforms/Windows folder with the text editor (right-click and select Open With…, then XML (Text) Editor). Look for the line that has been added that starts with <mp:PhoneIdentity PhoneProductId=…; delete (or comment) this line.
13.	Right-click publish the MauiStockTake.UI project again. This time, you should see Microsoft Store as [your variation of MauiStockTake]  by [your Microsoft nickname] as an option. Select this radio button, then click Next.
14.	On the next screen, the publishing profile should automatically be selected. Leave all the other settings and click Create.
This time, Visual Studio should create a release bundle for you successfully. Once you get the confirmation window, click on the Output location link to open the folder where the bundle has been created. Then, click Close to close the publishing dialog. We will revisit the remaining options (to validate the package and deploy automatically) later.

## Deploying to the Store
As with Google, you must manually upload your first build. To do this, go to the Microsoft Partner Center, and navigate to MauiStockTake (or your variation) in Apps and Games, and select Packages from the submission sub-heading on the left-hand menu.    

Upload the MSIX package to the Partner Center, either by dragging the file onto the grey upload box or clicking the browse your files link and navigating to the package. Once it has finished uploading, click Save.     

Once you have completed your first production release (covered in the next section), you can automate some of this process by having Visual Studio automatically upload builds to the Microsoft Partner Center.     

IMPORTANT You can work through all of the remaining steps without a production release, but the upload will be rejected at the last stage until you have one.    

Microsoft Partner Center works with Azure Active Directory (AAD) and Visual Studio; an app registration is created in AAD that provides credentials that can be used in Visual Studio (note this is an AAD app registration, not a Microsoft Store app registration). Visual Studio calls the Microsoft Partner Center API using these credentials, which are validated against AAD. This process is summarized in figure 12.xx.

 
*Figure 12.xx Use Microsoft Partner Center to create the app registration in AAD. Generate a key, and use the tenant ID, app ID and key in Visual Studio to deploy to Microsoft Partner Center, which validates the credentials against AAD.*    

Some understanding of AAD will be beneficial for this process, as it will help you to troubleshoot any problems you encounter but is not strictly necessary as the entire process can be managed by Microsoft Partner Center. Follow these steps to connect Microsoft Partner Center to AAD and create an app registration:
1.	In the Microsoft Partner Center, navigate to Tenants. Access this by clicking on the  cog in the top-right, then selecting Account Settings, then Tenants under the Organization profile sub-heading from the left-hand menu.
2.	On this screen you have the option to Associate Azure AD or Create Azure AD. 
    
AAD TENANTS
As mentioned in the introduction to this section on Microsoft, ideally you will create an association with an existing tenant; be that your organization’s tenant or that of your client. If you don’t have one already, you should create one; it’s simple, free, and will be useful for many things, not just publishing apps (for example, you can use it for authentication, rather than IdentityServer). You can find out more about how to do this here: https://learn.microsoft.com/azure/active-directory/develop/quickstart-create-new-tenant.
However, if you can also click the appropriate option to have Microsoft Partner Center manage the creation of a tenant for you. This could also be a good option if you simply want a tenant for publishing apps, and don’t intend to use it for any other purposes. 
    
3.	Once you’ve completed the process of adding or associating an AAD tenant, click on User management in the left-hand menu. You may be prompted to sign in with an AAD global administrator account; if so, click the Sign in with Azure AD button, using global administrator credentials from the tenant you have created or associated.
4.	Once you’ve signed in with an AAD account, you will see the Users, Groups, and Azure AD Applications tabs; click on Azure AD Applications, then click Add Azure AD Application.
5.	Select the Create Azure AD Application radio button, then click Continue. You can create the app registration manually in the Azure portal and just associate here, but it’s much easier to let the Microsoft Partner Center handle it as it will set all the required Microsoft Graph permissions.
6.	Enter MauiStockTake Upload App as the application name, for the Reply URL enter https://localhost (this isn’t used for anything), and for the App ID URI, enter https://[yourtenantname].onmicrosoft.com/mauistocktakeupload.
7.	Select the Developer role, then click Create. This will then create the app registration; once finished, you’ll see two entries in the table: one for the Azure AD app, and the other for the service principal (the identity of the app in the directory). They will both have the same name and GUID. Click on the link for the app (this will be the top row).
8.	In the slide-in panel, click on the Add new key link. This will generate a client secret that you can use; keep this open for now or copy it to your password manager if you have one. We’ll paste it into Visual Studio shortly.
9.	Go back to Visual Studio, and step through publishing again as we did in the Bundle Signing section. When you get to Finished creating package screen, check the box automatically submit to the Microsoft Store. If the submission settings dialog doesn’t automatically pop up, click the Configure button.
10.	In this dialog, you will need to enter the client ID and client key. The client ID is the AAD app registration ID; this is the GUI listed underneath the name in the table on the User management page in the Microsoft Partner Center.
11.	You will also need to enter the AAD tenant ID. You can’t get this from the Microsoft Partner Center, you will need to get it from the Azure portal. For more information, see https://learn.microsoft.com/azure/azure-portal/get-subscription-tenant-id.
12.	Check the box to save the client key, then click OK. When the dialog closes, click on the Launch Windows App Certification Kit button (note: this may also say Verify and publish). App verification will now run; wait for it to complete.
    
IMPORTANT Do not use your computer while app verification is running, or it will fail. If at any point it gets stuck, cancel it and start again.    
13.	When app verification has completed, you will see a screen with the PASSED heading in green. Click the Finish button to dismiss the dialog.
Visual Studio will now proceed to upload the verified bundle to the Microsoft Partner Center. You will see two green completed progress bars once the package has been uploaded.
    
## Releasing to Production
Unlike with Apple and Google, you don’t manage test users via the Microsoft Store. You can provide your testers with your MSIX file directly, or to their systems or network administrator to deploy it to them using their deployment tools. The Microsoft Store is only used for production releases.    

Now that a package has been uploaded, you need to complete the store listings. Use the left-hand menu to navigate to Store listings. The store listings page lets you add an individual listing for each language that you want to provide. English (United States) is added by default; you are welcome to add others (using the Manage additional languages   button), but for now, click on the English (United States) link to complete the listing for that language.    

For the Product name, enter MauiStockTake, and complete the Description section. You can use the description provided in the chapter 12 resources folder, as well as some Windows screenshots you can use. Once you have added the name, description, and screenshots, click Save.    

Use the left-hand menu to navigate to Submission Options. In this section, you can choose whether to release the app as soon as it’s been approved, release it manually, or schedule its release. There is also a field to provide some notes; this is where you would give the username and password for the reviewers to test with.    

The Microsoft Partner Center will detect that MauiStockTake is using Restricted capabilities. In the Package.appxmanifest file, we have listed the runFullTrust restricted capability, and Microsoft Partner Center will ask you to justify why. This capability is included by default in the .NET MAUI templates; one option is to remove it from the manifest, but simply stating in this field that this is a .NET MAUI app should be sufficient to satisfy the reviewers.    

Once you have completed this section, click Save. Navigate back to the submission overview, using the left-hand menu. At this stage, you should see each section (Pricing and availability, Properties, Age ratings, Packages, Store listings, and Submission options) listed as complete, with green check marks down the right-hand side. If any of these are shown as not started, or not complete, finish off any remaining steps for that section. Once everything is ready, click on Submit to the Store.
As with Google and Apple, reviewers from Microsoft will evaluate your app. Once complete, you’ll receive an email notification that your app has been accepted and is now available via the Microsoft Store.     

# Next Steps
Much of what is covered in this chapter is not .NET MAUI specific, however as an app developer, understanding how to release and manage an app via the various stores is an essential skill. There is enough nuance to justify a book on the topic all of its own, but the steps outlined in this chapter should give you a good foundation.    

While this chapter covers the essentials of releasing an app, there are some further topics you should consider for production apps, and in this section, I summarize what I consider the three next most essential.

## Logging and Telemetry
Releasing your app via the various stores can be a frustrating experience. Sometimes an app or new version can be rejected for reasons beyond your control, and often the communication around why can be sparse. Perseverance is key; it can sometimes take several iterations to get a build released.    

I have found telemetry to be invaluable during this stage. When a reviewer raises an issue, being able to see from detailed logs what was happening can help you better understand your app and identify problems (and even use cases) you never thought of.
Check out this video by Gerald Versluis for information on client-side logging in .NET MAUI apps: https://youtu.be/WicmnH72kf0. There are several options for capturing this telemetry, including App Center and Application Insights from Microsoft, as well as many third-party options. 

## Monetization
So far in this chapter we have discussed publishing a free app. In the case of MauiStockTake, it would be for internal use at Mildred’s Surf Shack, so wouldn’t necessarily be published via the stores, and doesn’t need to generate revenue. But most apps do. For more information, see https://ssw.com.au/rules/how-to-monetize-apps.    

There are many ways that apps can be monetized, and the easiest way to do this for many of these is through the stores. Apple, Google and Microsoft allow you to charge users to buy your app with a one-time fee, pay an ongoing subscription, or make multiple individual transactions within the app. Depending on the nature of your app, transacting via the stores can save you time and money, and you should spend some time familiarizing yourself with how each of the stores’ monetization models work.

## DevOps
Damian Brady coined the phrase “friends don’t let friends right-click publish” (see https://damianbrady.com.au/2018/02/01/friends-dont-let-friends-right-click-publish/) and with good reason. Automating deployments saves you time and reduces the risk of introducing human error.    

Having a solid DevOps process and using CI/CD pipelines can significantly increase the robustness and quality of your product. Automated deployments for mobile and desktop apps are less common in smaller projects than cloud or web apps, but they still provide significant value. Appendix C provides an example GitHub Actions workflow for deploying a .NET MAUI app for iOS and Android.
