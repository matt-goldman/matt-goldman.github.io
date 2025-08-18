---
description: "Part 3 of the .NET MAUI deployment series, providing a comprehensive guide for deploying Windows apps to the Microsoft Store with packaging and submission details."
title:  "Deploying your .NET MAUI apps to production -  Part 3: Windows"
date:   2023-02-05 0:00:00 +1000
image:  /images/posts//maui-deploying-image-3.png
tags:   [mobile, maui, ui, deploying, production]
categories: [.NET, Mobile]
author: Matt Goldman
authorTitle: Owner
avatar: "/images/authors/mattg.png"
---

 This post is part three of a three part series:

* [Part 1: Android](/posts/maui-app-deploy/)
* [Part 2: iOS](/posts/maui-app-deploy-2/)
* Part 3: Windows (this post)

In part one of this series, we saw how to build, sign and deploy Android apps built with .NET MAUI to the Google Play store, and in part two, we deployed the same app (MauiStockTake) to the iOS App Store. In part 3, we'll see how we can deploy our Windows app to the Microsoft Store.


:::info
MauiStockTake is an app we build in my book [.NET MAUI in Action](https://www.manning.com/books/dot-net-maui-in-action?utm_source=goforgoldman&utm_medium=affiliate&utm_campaign=book_goldman_dot_5_10_22&a_aid=goforgoldman&a_bid=38933097), for a fictional client called _Mildred's Surf Shack_. You don't need the book, or the app, to follow along with this; just substitute references to MauiStockTake with your own app.
:::

As with Parts 1 and 2, the process described here is accurate at time of writing but could be subject to change. However, the overall process will remain the same and this should serve as a good reference for the overall process even if the details of some steps change.


# Microsoft
The Microsoft Store is a unified platform for the sale and distribution of physical products, digital content (like books and movies), and games and software for the Windows, Xbox, and HoloLens platforms. There are a few ways you can distribute your .NET MAUI apps for Windows users, but the Microsoft Store is the primary distribution platform, and in this post, we’ll see how you can use it to deploy your apps.

To automate pushing builds from Visual Studio to the store, you will also need an Azure Active Directory (AAD) tenant. It’s best to use the tenant owned by the company you are building the app for (e.g., your client or your employer) if available and if permitted by the security policies. Otherwise, you can create an AAD tenant on [the free tier](https://azure.microsoft.com/free), or you can let the Microsoft Partner Center (MPC) create one for you automatically).

Distributable Windows apps are bundled in the MSIX package format, which contains your app executable and metadata. To create MSIX files, you need access to Windows. Therefore, **these steps are for Windows only**. Windows is easy to virtualize on other platforms, but be aware that you will also need access to the CPU architecture you want to deploy for; for example, you cannot create AMD-x64 builds using an ARM64 CPU.

## Developer Program
The Microsoft Store app developer program has a one-time registration fee of $19 USD for individuals, or $120 USD for businesses. While it is only a one-time fee, you are required to maintain an active presence on the store (meaning you must publish an app), otherwise your membership will be deactivated. If this happens, you will need to raise a support request to get your program membership reinstated.

To sign up, go to [https://developer.microsoft.com/microsoft-store/register/](https://developer.microsoft.com/microsoft-store/register/). Click the **Sign Up** button and complete the form. You will need to pay the registration fee to progress, and once your account is set up, head to the **Agreements** tab and accept the developer agreement. Your Microsoft developer account is now ready, so the next step is to register the app:
1.	Go to the **Apps and Games** section in [Microsoft Partner Center](https://partner.microsoft.com/dashboard/apps-and-games/overview).
2.	Click the **+ New product** button and select MSIX or PWA apps.
3.	Enter a name and click Reserve product name.

    :::info
    **NOTE for readers of .NET MAUI in Action**<br>MauiStockTake is already reserved so you won’t be able to use that.
    :::

4.	In the **Application Overview** section, click **Start your submission.**
5.	Complete the **Pricing and availability**, **Properties**, and **Age ratings** sections. In the **Privacy** section, you will need to add a privacy policy URL (see the [tip in part 1](/posts/maui-app-deploy/#developer-program)).
Your app registration is almost ready. We’ll revisit the Partner Center once we have a signed build.

## Bundle Signing
As with Google, you sign your package using a self-signed certificate that the Partner Center associates with your initial build. Microsoft will then sign the build that gets distributed via the store with their own certificate, which enables end user machines to trust it.
To create a signed bundle, follow these steps:
1.	Ensure that **MauiStockTake.UI** is selected as the startup project in Visual Studio, in **Release** configuration with **Windows** as the target.
2.	In Solution Explorer, right-click on MauiStockTake.UI and select **Publish…**. Select the **Microsoft Store under a new app name** radio button and click **Next**.
3.	Ensure that the right identity is selected in the drop-down (in the top right of the publishing window). Visual Studio will contact Microsoft Partner Center to retrieve the list of reserved app names. Highlight MauiStockTake (or your variation selected in step 3 of the _Developer Program_ section above) and click **Next**.
4.	On the next screen, leave the defaults for version number and auto-incrementing, and for symbols and artifacts. In the **Publishing profile** dropdown, select **`<New…>`**.
5.	In the Create a new MSIX Publishing Profile dialog, change the **Configuration** to **Release &#124; Any CPU**, change the **Target Runtime** to **win10-x64**, leave Self Contained as true, and keep the default Package Location. Then click **OK**.
6.	Click the **Create** button. The Visual Studio status bar (bottom left) will show the current status, you can also follow the progress in the Output window.
7.	**The initial publish will fail**; this is ok, by default it adds some metadata in the `Package.appxmanifest` file that we don’t need and that causes it to fail. Once it has failed, open the `Package.appxmanifest` file in the `Platforms/Windows` folder with the text editor (right-click and select **Open With…**, then **XML (Text) Editor**). Look for the line that has been added that starts with `<mp:PhoneIdentity PhoneProductId=…`; delete (or comment) this line.
8.	Right-click publish the MauiStockTake.UI project again. This time, you should see **Microsoft Store as [your variation of MauiStockTake]  by [your Microsoft nickname]** as an option. Select this radio button, then click **Next**.
9.	On the next screen, the publishing profile should automatically be selected. Leave all the other settings and click **Create.**

This time, Visual Studio should create a release bundle for you successfully. Once you get the confirmation window, click on the **Output location** link to open the folder where the bundle has been created. Then, click **Close** to close the publishing dialog. We will revisit the remaining options (to validate the package and deploy automatically) later.

## Deploying to the Store
As with Google, you must manually upload your first build. To do this, go to the Microsoft Partner Center, and navigate to your app in **Apps and Games**, and select **Packages** from the submission sub-heading on the left-hand menu.

Upload the MSIX package to the Partner Center, either by dragging the file onto the grey upload box or clicking the **browse your files** link and navigating to the package. Once it has finished uploading, click **Save**.

Now that you have uploaded a build, you can progress to the next section (Releasing to Production). Once you have completed your first production release, you can automate some of this process by having Visual Studio automatically upload builds to the Microsoft Partner Center.


:::warning
You can work through all of the remaining steps without a production release, but the upload will be rejected at the last stage until you have one.
:::

Microsoft Partner Center works with Azure Active Directory (AAD) and Visual Studio; an app registration is created in AAD that provides credentials that can be used in Visual Studio (note this is an AAD app registration, not a Microsoft Store app registration). Visual Studio calls the Microsoft Partner Center API using these credentials, which are validated against AAD. This process is summarized in the figure below.

![Use Microsoft Partner Center to create the app registration in AAD. Generate a key, and use the tenant ID, app ID and key in Visual Studio to deploy to Microsoft Partner Center, which validates the credentials against AAD](/images/posts//microsoft-store.drawio.png)

Some understanding of AAD will be beneficial for this process, as it will help you to troubleshoot any problems you encounter but is not strictly necessary as the entire process can be managed by Microsoft Partner Center. Follow these steps to connect Microsoft Partner Center to AAD and create an app registration:
1.	In the Microsoft Partner Center, navigate to **Tenants**. Access this by clicking on the  cog in the top-right, then selecting **Account Settings**, then Tenants under the **Organization profile** sub-heading from the left-hand menu.
2.	On this screen you have the option to Associate Azure AD or Create Azure AD.

    :::sidenote
    **AAD TENANTS**<br>As mentioned earlier in this post, ideally you will create an association with an existing tenant; be that your organization’s tenant or that of your client. If you don’t have one already, you should create one; it’s simple, free, and will be useful for many things, not just publishing apps (for example, you can use it for authentication). You can find out more about how to do this [here](https://learn.microsoft.com/azure/active-directory/develop/quickstart-create-new-tenant). <br><br>However, you can also click the appropriate option to have Microsoft Partner Center manage the creation of a tenant for you. This is an option to consider if you simply want a tenant for publishing apps, and don’t intend to use it for any other purposes.
    :::

3.	Once you’ve completed the process of adding or associating an AAD tenant, click on **User management** in the left-hand menu. You may be prompted to sign in with an AAD global administrator account; if so, click the **Sign in with Azure AD** button, using global administrator credentials from the tenant you have created or associated (if you've just created a tenant, it will be the user account you used to create it).
4.	Once you’ve signed in with an AAD account, you will see the Users, Groups, and Azure AD Applications tabs; click on **Azure AD Applications**, then click **Add Azure AD Application**.
5.	Select the **Create Azure AD Application** radio button, then click **Continue**. You can create the app registration manually in the Azure portal and just associate here, but it’s much easier to let the Microsoft Partner Center handle it as it will set all the required Microsoft Graph permissions.
6.	Enter `MauiStockTake Upload App` as the application name, for the Reply URL enter `https://localhost` (this isn’t used for anything), and for the App ID URI, enter `https://[yourtenantname].onmicrosoft.com/mauistocktakeupload`.
7.	Select the **Developer** role, then click **Create**. This will then create the app registration; once finished, you’ll see two entries in the table: one for the Azure AD app, and the other for the service principal (the identity of the app in the directory). They will both have the same name and GUID. **Click on the link for the app** (this will be the top row).
8.	In the slide-in panel, click on the **Add new key** link. This will generate a client secret that you can use; keep this open for now or copy it to your password manager if you have one. We’ll paste it into Visual Studio shortly.
9.	Go back to Visual Studio, and step through publishing again as we did in the Bundle Signing section. When you get to `Finished creating package` screen, check the box automatically submit to the Microsoft Store. If the submission settings dialog doesn’t automatically pop up, click the **Configure** button.
10.	In this dialog, you will need to enter the client ID and client key. The client ID is the AAD app registration ID; this is the GUI listed underneath the name in the table on the User management page in the Microsoft Partner Center.
11.	You will also need to enter the AAD tenant ID. You can’t get this from the Microsoft Partner Center, you will need to get it from the Azure portal. [Click here](https://learn.microsoft.com/azure/azure-portal/get-subscription-tenant-id) for more information.
12.	Check the box to save the client key, then click **OK**. When the dialog closes, click on the **Launch Windows App Certification Kit** button (note: this may also say Verify and publish). App verification will now run; wait for it to complete.

    :::warning
    Do not use your computer while app verification is running, or it will fail. If at any point it gets stuck, cancel it and start again.
    :::

13.	When app verification has completed, you will see a screen with the **PASSED** heading in green. Click the **Finish** button to dismiss the dialog.

Visual Studio will now proceed to upload the verified bundle to the Microsoft Partner Center. You will see two green completed progress bars once the package has been uploaded.

## Releasing to Production
Unlike with Apple and Google, you don’t manage test users via the Microsoft Store. You can provide your testers with your MSIX file directly, or to their systems or network administrator to deploy it to them using their deployment tools. The Microsoft Store is only used for production releases.

Now that a package has been uploaded, you need to complete the store listings. Use the left-hand menu to navigate to Store listings. The store listings page lets you add an individual listing for each language that you want to provide. `English (United States)` is added by default; you are welcome to add others (using the **Manage additional languages** button), but for now, click on the **English (United States)** link to complete the listing for that language.

For the **Product name**, enter `MauiStockTake` (or your app name), and complete the **Description** section. If you've purchased _.NET MAUI in Action_, the chapter 12 resources folder contains a description and some Windows screenshots you can use. Once you have added the name, description, and screenshots, click **Save**.

Use the left-hand menu to navigate to **Submission Options**. In this section, you can choose whether to release the app as soon as it’s been approved, release it manually, or schedule its release. There is also a field to provide some notes; this is where you would give the username and password for the reviewers to test with.

The Microsoft Partner Center will detect that MauiStockTake is using **Restricted capabilities**. In the `Package.appxmanifest` file, we have listed the `runFullTrust` restricted capability, and Microsoft Partner Center will ask you to justify why. This capability is included by default in the .NET MAUI templates; one option is to remove it from the manifest, but simply stating in this field that this is a .NET MAUI app should be sufficient to satisfy the reviewers.

Once you have completed this section, click **Save**. Navigate back to the submission overview, using the left-hand menu. At this stage, you should see each section (Pricing and availability, Properties, Age ratings, Packages, Store listings, and Submission options) listed as complete, with green check marks down the right-hand side. If any of these are shown as not started, or not complete, finish off any remaining steps for that section. Once everything is ready, click on **Submit to the Store**.

As with Google and Apple, reviewers from Microsoft will evaluate your app. Once complete, you’ll receive an email notification that your app has been accepted and is now available via the Microsoft Store.

# Next Steps
Much of what is covered in this three part series is not .NET MAUI specific, however as an app developer, understanding how to release and manage an app via the various stores is an essential skill. There is enough nuance to justify a book on the topic, but the steps outlined should give you a good foundation.

While we've covered the essentials of releasing an app, there are some further topics you should consider for production apps, and in this section, I summarize what I consider the three next most essential.

## Logging and Telemetry
Releasing your app via the various stores can be a frustrating experience. Sometimes an app or new version can be rejected for reasons beyond your control, and often the communication around why can be sparse. Perseverance is key; it can sometimes take several iterations to get a build released.

I have found telemetry to be invaluable during this stage. When a reviewer raises an issue, being able to see from detailed logs what was happening can help you better understand your app and identify problems (and even use cases) you never thought of.
Check out [this video by Gerald Versluis](https://youtu.be/WicmnH72kf0) for information on client-side logging in .NET MAUI apps. There are several options for capturing this telemetry, including App Center and Application Insights from Microsoft, as well as many third-party options.

## Monetization
So far in this chapter we have discussed publishing a free app. In the case of MauiStockTake, it would be for internal use at Mildred’s Surf Shack, so wouldn’t necessarily be published via the stores, and doesn’t need to generate revenue. But most apps do. At SSW we [have a rule](https://ssw.com.au/rules/how-to-monetize-apps) about this that covers it in more detail.

There are many ways that apps can be monetized, and the easiest way to do this for many of these is through the stores. Apple, Google and Microsoft allow you to charge users to buy your app with a one-time fee, pay an ongoing subscription, or make multiple individual transactions within the app. Depending on the nature of your app, transacting via the stores can save you time and money, and you should spend some time familiarizing yourself with how each of the stores’ monetization models work.

## DevOps
Damian Brady coined the phrase [friends don’t let friends right-click publish](https://damianbrady.com.au/2018/02/01/friends-dont-let-friends-right-click-publish/), and with good reason. Automating deployments saves you time and reduces the risk of introducing human error.

Having a solid DevOps process and using CI/CD pipelines can significantly increase the robustness and quality of your product. Automated deployments for mobile and desktop apps are less common in smaller projects than cloud or web apps, but they still provide significant value. Gerald Versluis [has another video](https://youtu.be/8lvdLa0v8zY) about building apps with GitHub actions, and you can learn how to build a complete end-to-end GitHub Actions pipeline, that publishes store apps for iOS and Google, in [.NET MAUI in Action](https://www.manning.com/books/dot-net-maui-in-action?utm_source=goforgoldman&utm_medium=affiliate&utm_campaign=affiliate&a_aid=goforgoldman).
