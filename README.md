# image-converter
Convert (and compress) lots of image formats into JPEG, PNG and WebP formats, locally on your device. It supports also HEIC/HEIF photos!

Try it: https://dinoosauro.github.io/image-converter/
## What you can do:
![Screenshot 2023-07-07 alle 23 46 06](https://github.com/Dinoosauro/image-converter/assets/80783030/8386f0b6-7ef5-4ba5-a655-3c889f32b050)


After opening the website, you can change the output file format and the image quality (for JPG and WebP). 

If you want to convert lots of images, you can enable the "Put all data in a .zip file" option, so that you won't have to deal with lots of file save requests. You can also choose to download the file zip manually and not after the conversion has ended, so that you have all the time to choose different images from different folders.

Then, look at the resizing options: you can resize the images by putting a percentage with a slider (so that all of your images will be scaled down of x%), or by setting a fixed width or height (all your images will have the same width or the same height, and then the other parameter will vary due to different proportion rates).

Now you can choose the images to convert. You can convert directly the images you've in your clipboard (only if zip option is disabled), otherwise you can also choose the photos from a folder. At the end, the images or the zip file will be downloaded automatically, except if you've disabled the "Download the zip file immediately" option. In that case, you'll see a button called "Download zip". Click it and the zip file will be downloaded.

Lastly, you can change themes: click the icon on the top of the page and you'll be able to select three themes (Light, Dark, Dracula). If you want, you can create your own one by changing the color from the inputs below the selector.

## HEIC support
Even if most browsers don't support HEIC/HEIF photos, image-converter uses the open-source library [heic2any](https://github.com/alexcorvi/heic2any) to decode HEIC photos.

## Privacy
Everything is elaborated locally on your device. Nothing is sent to a server. The only things saved on your device are the settings, and they're saved in an isolated local storage that can be deleted at any time from the browser's settings.

### Connected domains:
- GitHub Pages: hosting of the webpage
- Google Fonts: only for getting fonts and make the webpage a little decent-looking, no other data is sent or fetched from Google.
