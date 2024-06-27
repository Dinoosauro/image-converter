# TikTok Server

Since TikTok API requries that photo upload is done through an URL, you'll need
a server to handle this. Here's a server example that you can use with Deno
Deploy.

## Setup:

### Getting an API Key

You'll need an API Key to upload content on TikTok.

1. Go to the
   [TikTok for Developers' website](https://developers.tiktok.com/apps/). You
   might need to create an account.
2. Go into the [Manage apps](https://developers.tiktok.com/apps/) section.
3. Click to the "Connect an app" button, and write the app name.
4. Now go to the "Sandbox" tab, and then click the red "Create Sandbox" button.
   Add whatever name you like.
5. Fill the form of the "Basic information" card. Check "Web" in the platforms.
   Currently, don't add anything in the URLs.

### Deno Deploy

6. Create a new serverless project in Deno Deploy, and copy the `server.ts`
   content.
7. You now need to add some environment values: click on the option button (at
   the left of the "TS" select) and write the following values
   - `clientKey`: the Client Key that you can access from the TikTok dashboard
     in the "Credentials" tab
   - `clientSecret`: same as above, but for the Client Secret
   - `denoUrl`: the URL where the Deno project is deployed. Put it without "/"
   - `sourceUrl`: the URL where your image-converter webpage is located. Put
     only the origin, without the "/"
     - `oauthLocation`: the URL where the "oauth.html" file of image-converter
       is located
8. Save the values. Copy again the URL of your Deno project, and add it where
   required in the TikTok form.

### Add the products on TikTok

9. On the TikTok Developers page, click to "Add products", and choose "Login
   Kit" and "Content Posting API"
10. Write again the Deno URL in the "Redirect URI" textbox in the "Login Kit"
    card
11. Enable "Direct Post" on the "Content Posting API" card
12. Now click on the "Verify" button of the "Content Posting API" card.
13. Choose "sandbox1" from the "URL properties for" select, and click on "Verify
    new property"
14. Choose "URL prefix", write the same URL you've put in `oauthLocation`
15. Go back to the Deno Deploy project, and add two new environment values:
    - `tiktokVerificationFileName`: the name of the file you've downloaded (with
      also the extension)
    - `tiktokVerificationFileContent`: the content of the file you've downloaded
16. Save the values. Now verify the URL on the TikTok page.
17. In the Sandbox settings, login with your TikTok account.

### Setup on image-converter

You are now ready to use the image-converter integration to TikTok!

18. On image-converter, open the settings.
19. Write the Deno URL (with the final "/") in the "TikTok integration" card

## Server endpoints

| Endpoint | Search parameters                                                                | Body                 | Method | Description                                                                                          |
| -------- | -------------------------------------------------------------------------------- | -------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| getId    | -                                                                                | -                    | GET    | Obtain a UUID for the next requests                                                                  |
| upload   | position [the number of the file, from 1 to 36]</br>id [the UUID provided above] | The image to upload  | POST   | Upload an image to the server                                                                        |
| fetch    | position [the number of the file, from 1 to 36]</br>id [the UUID provided above] | -                    | GET    | Get an image that was previously uploaded to the server                                              |
| auth     | state [the State parameter for the request]                                      | -                    | GET    | Start the authentication process. The webpage will redirect the user to TikTok's authentication flow |
| post     | -                                                                                | `PostRequest` object | POST   | Send to the server the request to upload the content TikTok                                          |

### PostRequest Object:

- `id`: the UUID used for photo uploading (String)
- `code`: the TikTok authentiaction code (String)
- `description`: the post description/caption (String)
- `title`: the post title (String)
- `thumbnail`: the image that needs to be marked as thumbnail (Number)
