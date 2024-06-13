import Dialog from "../lib/Styles/Dialog.svelte";
import CheckNativeHeicSupport from "./CheckNativeHeicSupport";
import CheckSupportedFile from "./CheckSupportedFile";
import createSpinner from "./CreateSpinner";
import ImageBlobHandler from "./ImageBlobHandler";
import { conversionProgress, conversionStatus, conversionType, convertFiles, type FileConversion } from "./Storage";

/**
 * Processes the files, adding them to the operation array
 * @param files the files to handle
 */
export default async function FileArrayHandler(files: File[] | FileList) {
    if (!localStorage.getItem("ImageConverter-AskEncoding") && (Array.from(files).some(e => e.name.endsWith("heic") || e.name.endsWith("heif")))) { // The `ImageConverter-AskEncoding` LocalStorage value will be set to `a` when the user has made a choice. So, if it's nullish and the image is a HEIC/HEIF file, ask which library should be used
        try {
            await CheckNativeHeicSupport(); // If an error is not thrown, ask the user if they want to use heic2any or the native libary
            localStorage.setItem("ImageConverter-HeicLibrary", confirm("It seems that your browser supports native decoding of HEIC image. Do you want to use your browser's native decoder? This will greatly improve performance, but you won't be able to decode multiple images in a single HEIC container. If you don't understand what this means, you should accept this.") ? "a" : "b");
            localStorage.setItem("ImageConverter-AskEncoding", "a");
        } catch (ex) {
            localStorage.setItem("ImageConverter-HeicLibrary", "b");
            console.log("No native HEIC decoder found. Using heic2any library.");
        }
    }
    const composeAsyncArray: FileConversion[] = [];
    const spinner = createSpinner();
    conversionType.set("fileopen"); // Change the value of `conversionType` so that the correct string will be shown in the bottom dialog.
    for (let x = 0; x < files.length; x++) {
        conversionProgress.set(x); // Update the number shown in the bottom dialog
        const item = files[x];
        if (CheckSupportedFile(item)) continue;
        const getBlob = await ImageBlobHandler(item.name.substring(item.name.lastIndexOf(".") + 1), await item.arrayBuffer());
        if (Array.isArray(getBlob)) { // Multiple images: add each image to the array by creating a new name
            for (let i = 0; i < getBlob.length; i++) composeAsyncArray.push({ fileName: (item.webkitRelativePath ?? "") !== "" ? `${item.webkitRelativePath.substring(0, item.webkitRelativePath.lastIndexOf("."))}-${i + 1}${item.webkitRelativePath.substring(item.webkitRelativePath.lastIndexOf("."))}` : `${item.name.substring(0, item.name.lastIndexOf("."))}-${i + 1}${item.name.substring(item.name.lastIndexOf("."))}`, scaleType: "percentage", blob: getBlob[i] });
        } else composeAsyncArray.push({ fileName: (item.webkitRelativePath ?? "") !== "" ? item.webkitRelativePath : item.name, scaleType: "percentage", blob: getBlob });
    }
    convertFiles.update((val) => [
        ...val,
        ...composeAsyncArray
    ]);
    composeAsyncArray.length > 0 && conversionStatus.set(1); // If there's at least a new image, update the UI status to `1` (show edit controls)
    conversionProgress.set(undefined); // Hide the bottom dialog
    spinner.remove();
}