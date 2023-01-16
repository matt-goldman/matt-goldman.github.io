---
layout: post
title:  "Deploying your .NET MAUI apps to production - Part 1: Android"
date:   2023-01-14 0:00:00 +1000
image:  /images/maui-deploying-image.png
tags:   mobile maui ui deploying production
categories: [.NET, Mobile]
---

Building apps is fun, but sadly very few people get paid to build apps just for fun; usually, there’s an expectation that you will deliver a working app to users. Running apps on simulators, emulators, and developer machines is cool, but not as cool as having an app you’ve built running on a real device. And, of course, the most rewarding feeling of all is seeing your completed product, deployed and being used by real people.    

In this three-part series of posts, we'll walk through deploying a fictional app called MauiStockTake to the Google Play Store, the iOS App Store, and the Microsoft Store.

> MauiStockTake is an app we build in my book [.NET MAUI in Action](https://www.manning.com/books/dot-net-maui-in-action?utm_source=goforgoldman&utm_medium=affiliate&utm_campaign=book_goldman_dot_5_10_22&a_aid=goforgoldman&a_bid=38933097), for a fictional client called _Mildred's Surf Shack_. You don't need the book, or the app, to follow along with this; just substitute references to MauiStockTake with your own app.
{: .prompt-info }

The process is correct at time of writing, but even if the individual steps change, the overall process should remain similar enough for this to be a valuable reference. Perhaps more importantly, where possible I've shared hard-won tips I've learned through my professional experience of battling with app stores and developer programs.    

If you find this useful, I'd love to know! And if you find any errors, please let me know in the comments, and I'll get them fixed up as soon as I can.

# Developer Programs and App Stores
There are a few ways you can distribute your apps to users, but typically you will distribute them via the public stores. For iOS and macOS this is the App Store, for Android it’s the Google Play store, and for Windows it’s the Microsoft store.
Microsoft, Google, and Apple have paid developer programs. You don’t need to join these developer programs to _develop_ apps for these platforms, but you do have to join them to distribute apps through their stores. Note that you don’t necessarily need to join these programs personally; an organization can have an enterprise membership, and you can be added as a developer to a team.    

In a real-world scenario, in the case of MauiStockTake, this is likely the approach that you would take (i.e., Mildred’s Surf Shack would purchase a membership, and developers' accounts would be added to the team). However, for the purposes of this walkthrough we’ll go through the process as if you were using a personal membership and this was your own app.    

In addition to developer program membership, to distribute builds of your app through the stores they must be signed. This means that a cryptographic signature is included with the build that can be used to verify that the app has come from the original creator.    

In this series, we’ll look at what’s required to join these programs, and how to sign and distribute your app through the stores.    

> **Note for readers of .NET MAUI in Action** <br>As we are going to be uploading test builds of MauiStockTake to the various stores, to avoid conflicts with the application ID, I suggest you change yours now, replacing `mildredssurfshack` with your name, or some other unique identifier. You will not be able to upload an app with a bundle ID that is already in use.
{: .prompt-info }
 

# Part 1: Google
To publish apps to the Google Play store, you need a Google developer account. Before you can get started, you must have a Google account. If you have an `@gmail.com` email address, you have a Google account, and if not, you can sign up for one free of charge by going to [https://www.google.com](https://www.google.com), and clicking on the **Sign In** button in the top right of the screen. This will take you to a login prompt, with a **Create Account** button at the bottom of the form. Click on this and follow the guided steps to create a Google account, and once this is complete, you’re ready to register as a Google developer.    

## Developer Program
To register your Google account as a Google developer account, you will need to pay a one-time fee of $25 USD and verify some of your personal details. [The full steps, including guided links through each one, can be found here](https://support.google.com/googleplay/android-developer/answer/6112435). Note that you must complete the identity verification steps before you can publish apps through Google Play.    
    
Once you have signed up, you gain access to the [Google Play developer console](https://play.google.com/console). **In the console, click on the Create App button in the top right-hand corner.** Fill in the form and then click on the **Create App** button in the bottom-right to register the app. After this, you’ll be taken to the app’s dashboard.    

Now that your app is registered in the Google Play console, there are some additional setup tasks that you need to run through. These steps are listed as a set of tasks on the dashboard; you will need to work through all these too to provide necessary metadata for your app. Most of these you can simply click through and answer the questions, but for the privacy policy you need to provide a link. It’s a good idea to consult a solicitor to help you draft or review a privacy policy for your app, but you can also use a free privacy policy generator such as <a href="https://termly.io" rel="nofollow">Termly</a>. For testing purposes, you are free to use <a href="https://www.privacypolicygenerator.org/live.php?token=vbOLjH1o4uHRr73yvyfSm7tYqPcwl1tX" rel="nofollow">this one</a>.    

> When you publish an app, it’s a good idea to have a website for either the app or the publishing company as this lends credibility to the app. You can (and should) host your privacy policy on your website, but during the development phase you could host the policy as a markdown file on GitHub.
{: .prompt-tip }


Once you’ve completed the first 10 steps, you should see 10/11 green ticks. The final step, creating the store listing, will also need some additional assets. If you've purchased _.NET MAUI in Action_, you can find some sample assets in the chapter 12 resources folder, along with a sample listing and description you can use (of course you can write your own too).    

With the app metadata now set up in the Google Play developer console, we’re ready to submit a build.

## Bundle Signing
In this section, we’ll see how you can sign your app bundles so that Google Play can verify that they have come from the original publisher. The process is summarized in this figure:
 
![](/images/google-signing.png)
_You can build an app package from your code, and then create an app bundle that you sign with your unique key. Google Play will use this key to verify that you are the rightful publisher of the app, and then use their own key to sign the packages that they distribute to users._

Apps for Android are packaged as Android Package Kit (APK) files, and you can sign and distribute APK files through an MDM, or even just side-load them (meaning to copy the APK file directly onto the device, rather than installing via the Google Play store). However, to distribute your app via the Google Play store, it must be packaged in Android app bundle (AAB) format.    

AAB was introduced in 2018 as a way of separating resources, so that only parts of your app specific for the device running it get deployed (e.g., high-resolution graphics assets won’t be deployed to a device with a low-resolution screen). You can sign both your APK and AAB files, but we’ll skip signing the APK as it requires you to provide the password for the key file during build, and as we won’t be distributing the APK, it’s an unnecessary step.    

As we can see in the figure above, we’ll just sign the AAB. This will enable Google Play to verify us as the original publisher; they’ll then sign the package with their own certificate (so that our end users’ Android devices don’t have to trust our key).    

Let’s create a signed app bundle:
1.	Ensure your app builds in Release configuration without any errors.
2.	Ensure that an Android target is selected in the toolbar and that Release configuration is selected. 
3.	**Visual Studio for Windows**: Right-click on the MauiStockTake.UI project (or your .NET MAUI project) in solution explorer and select **Publish**.
4.	**Visual Studio for Mac**: Right-click on the MauiStockTake.UI project (or your .NET MAUI project) in solution explorer and select **Archive for Publishing**.
5.	If the archive you have just created is not selected, select it. On macOS, click the **Sign and Distribute…** button, on Windows click the **Distribute…**  button.
6.	Select Ad Hoc as the distribution channel. We’re going to distribute via Google Play, but we need to produce the bundle file and manually upload it the first time.
7.	Create a signing key. On macOS, click on the **Create a New Key** button, on Windows click the + button. 
8.	Create an alias and password for the key store. It makes sense to create a key store per app as this reduces risk (see warning below), so a sensible alias would be `MauiStockTakeKey`.
    
    > Export the key store and store it securely along with the password. Most password managers (like Bitwarden and LastPass) allow you to save files, so this is a good option.
    {: .prompt-tip }

    > From Google’s point of view, this key store _is_ your Android app. If you lose the key store or the password, you will not be able to upload new versions of your app to Google Play. I have heard of Google support helping people around this, but it is not something you should depend on.
    {: .prompt-danger }

9.	In the section that says “Enter at least one of the following”, put `Mildred’s Surf Shack` in the Organization field. Remember that this key represents the publisher, not the developer (although of course in many cases they may be the same).
10.	**On Windows**: Ensure that the signing identity you have just created is selected and click **Save As**. Enter the password for the key store and click on **OK**.
11.	**On macOS**: Click on the **Publish** button, then choose a location to save the AAB file. Enter the password for the key store and click on **OK**.
    
> Don’t check this file in to source control. Either save it to a local folder (e.g. Downloads in your user profile), or alternatively create an Archives folder in the repo and add it to the `.gitignore` file.
{: .prompt-tip }

This creates a signed AAB that you can now upload to the Google Play store. On macOS, click **Reveal in Finder** to show the signed AAB file, on Windows click the **Open folder** button. In the next section, we’ll upload our first build to Google Play.    

## Deploying to the Store
You can deploy directly to the Google Play store from Visual Studio (for macOS or Windows), but before you can do that, you need to upload at least one build manually. This allows Google Play to match the signature of the key on all future bundles to the original key used for the first version of the app.    

In this section, we’re going to upload the bundle to the Internal Testing track and select testers to roll out the build to. A summary is shown in the figure below. After that, we’ll configure Visual Studio to upload the signed bundles directly.
 
![](/images/google-testing-track.png) 
_After creating a signed app bundle, we upload it via a web browser to the Google Play Developer Console. We can then create a release in the internal testing track and assign the bundle to it. We also create a list of email addresses for valid testers and assign that list to the release. Then we can provide testers with a link to install the build._

Let’s upload our bundle:
1.	Log in to the Google Play developer console and select your app from the list.
2.	From the menu on the left select **Internal testing**, then click on **Create new release**.
3.	The next screen directs you to choose an app bundle. If you’ve already uploaded bundles, you can select one from the library. But for this first build, we’ll upload the signed bundle we created in the previous section. You can click on the **Upload** button and browse to your file, or you can simply drag and drop the AAB file onto the upload area.
4.	Once the bundle has uploaded, it will show up as the listed bundle for the release as a table underneath the upload area. Click **Review release** to move to the next step.
5.	If your app targets Android 13 / API 33 (which it does in the default .NET MAUI template), in the next step you’ll see an error telling you that you must complete the advertising ID declaration. Click on the **Complete declaration** button, then in the declaration choose **No**, then click **Save**.

    > We’re not using the advertising ID in this app, but you would have to select Yes for any apps that do use it. To find out more about it, see the [Google Support article](https://support.google.com/googleplay/android-developer/answer/6048248).
    {: .prompt-info }

6.	You can click the **Start roll-out to Internal testing** button now, and then the **Rollout** button in the dialog that appears. This will make your app available to internal testers, which we’ll add in the next step.
7.	Go to the Testers tab and click on the **Create email list** button. This will let you create a list of email addresses for testers. You can maintain multiple lists; you might want to invite different groups of testers for different apps, or for different tracks (e.g. internal, open beta, etc). `MauiStockTake Internal Testers` would be a sensible name for this list, so add it in the **List name** field.
8.	In the **Add email addresses** field, add the email addresses of any testers you want to include. For now, you should add the email address you use with your Google Play account so that you can verify that the test build can be installed. Once you’ve added all your testers’ email addresses, click the **Save changes** button.
9.	This will return you to the Internal testing screen in the Google Play developer console. You should see the email list you created in the Testers tab.
    
> All of your email lists will be visible, but when you only have one it’s easy to assume the list has been added to testers. You must check the box next to any lists you want to include (and by extension, uncheck any lists you don’t want to include for this track for this app).
{: .prompt-tip }

Note that in the developer console there is a **Track summary** heading, and under here it may say Inactive. This means it’s pending review from Google which for this stage is usually very quick (there is a longer review for releasing to production). Check back every few minutes until it is marked as active, at which point the build is available to your internal testers.    

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
6.	The next screen has three sections: App information, App domain and Developer contact information. Complete the fields marked as required, which are the **App name, User support email**, and **Developer contact information email addresses**. Enter your email address in the two email address fields, and put `Mildred’s Surf Shack API Access` as the App name.
7.	On the next step of the wizard, click on the **ADD OR REMOVE SCOPES** button. Select all the scopes in the table. Note the scope required to programmatically publish your app is `./auth/androidpublisher`, but the others are standard scopes anyway.
8.	Click the **UPDATE** button to save the scope selections, then click on the **Credentials** menu, and click on the **+ CREATE CREDENTIALS** button at the top, and select **OAuth Client ID**.
9.	Choose **Desktop app** as the **Application Type** and enter `Visual Studio` as the name. Then click on the **CREATE** button.
    
Once you do this, the console will show you a dialog containing your client ID and client secret. You can download a JSON file containing these for safe keeping. To publish a new build of the app, increase the `ApplicationVersion` in the `csproj` file to 2 (not the `ApplicationDisplayVersion`). You can now right-click on the project and select publish, as you did before. Repeat all the same steps, except **instead of choosing Ad hoc, choose Google Play**.    

You’ll be prompted to enter your client ID and client secret; these are the values you just obtained from the console. From here the process is mostly the same, except that now, as Visual Studio will upload the AAB file directly to Google Play, you need to select the track (e.g., Internal testing, production, etc.), and don't need to manually upload the AAB.    

## Releasing to Production
Once you’ve got test builds in the Google Play developer console, provided that all the steps up until now have been completed and your app metadata is ready, releasing to production is a simple step, summarized in the figure below.

![](/images/google-production-track.png) 
_To release an app to production, create a new release in the Production track. Select an app bundle from your library (you can upload a new bundle, if necessary, e.g., if changing API URLs from testing to production), and select the countries the app should be released to. Once reviewed by Google, your app will be available to download via the store._

Simply choose the *Production* release from the menu (above the *Testing* expandable menu section), and in here, choose an app bundle by selecting *Add from library*. Choose the build that has been successfully tested.    

> Ideally you will release a tested build from your library, which will give you confidence that it works well. However sometimes you may want to upload a new build. For example, if your testers have been using a sandbox or QA API, you may need a new build that points to the production environment.
{: .prompt-info }

For the final step, you will be prompted to select the countries to distribute to. For now, just select the country you are in. For real-world apps, select all the countries you want your app to be available in. In some cases, this will be all countries, but if possible, you should try to restrict your selection to only those countries where your app will be used.    

Other than this, releasing an app to the Production track is no different to internal testing (or any other track). When you’re ready, click on the **Start roll-out to Production** button. At this stage, Google will review your app and come back to you with any issues they have found, otherwise, once they have finished, your app will be available to download in the Google Play store.    
    

In part 2 of this series, we'll see how to publish an iOS app to the App Store.