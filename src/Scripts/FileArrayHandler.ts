import Dialog from "../lib/Styles/Dialog.svelte";
import CheckNativeHeicSupport from "./CheckNativeHeicSupport";
import createSpinner from "./CreateSpinner";
import ImageBlobHandler from "./ImageBlobHandler";
import { conversionStatus, convertFiles, type FileConversion } from "./Storage";

export default async function FileArrayHandler(files: File[] | FileList) {
    if (!localStorage.getItem("ImageConverter-AskEncoding") && (Array.from(files).some(e => e.name.endsWith("heic") || e.name.endsWith("heif")))) {
        try {
            await CheckNativeHeicSupport();
            localStorage.setItem("ImageConverter-HeicLibrary", confirm("It seems that your browser supports native decoding of HEIC image. Do you want to use your browser's native decoder? This will greatly improve performance, but you won't be able to decode multiple images in a single HEIC container. If you don't understand what this means, you should accept this.") ? "a" : "b");
            localStorage.setItem("ImageConverter-AskEncoding", "a");
        } catch (ex) {
            localStorage.setItem("ImageConverter-HeicLibrary", "b");
            console.log("No native HEIC decoder found. Using heic2any library.");
        }
    }
    const composeAsyncArray: FileConversion[] = [];
    const spinner = createSpinner();
    for (let item of files) {
        if ((!item.type.startsWith("image") && item.type !== "application/pdf") || item.type === "image/svg+xml") continue;
        const getBlob = await ImageBlobHandler(item.name.substring(item.name.lastIndexOf(".") + 1), await item.arrayBuffer());
        if (Array.isArray(getBlob)) {
            for (let i = 0; i < getBlob.length; i++) composeAsyncArray.push({ fileName: (item.webkitRelativePath ?? "") !== "" ? `${item.webkitRelativePath.substring(0, item.webkitRelativePath.lastIndexOf("."))}-${i}${item.webkitRelativePath.substring(item.webkitRelativePath.lastIndexOf("."))}` : `${item.name.substring(0, item.name.lastIndexOf("."))}-${i}${item.name.substring(item.name.lastIndexOf("."))}`, scaleType: "percentage", blob: getBlob[i] });
        } else composeAsyncArray.push({ fileName: (item.webkitRelativePath ?? "") !== "" ? item.webkitRelativePath : item.name, scaleType: "percentage", blob: getBlob });
    }
    convertFiles.update((val) => [
        ...val,
        ...composeAsyncArray
    ]);
    composeAsyncArray.length > 0 && conversionStatus.set(1);
    spinner.remove();
}