import createSpinner from "./CreateSpinner";
import ImageBlobHandler from "./ImageBlobHandler";
import { conversionStatus, convertFiles, type FileConversion } from "./Storage";

export default async function FileArrayHandler(files: File[] | FileList) {
    const composeAsyncArray: FileConversion[] = [];
    const spinner = createSpinner();
    for (let item of files) {
        if (!item.type.startsWith("image") || item.type === "image/svg+xml") continue;
        composeAsyncArray.push({ fileName: (item.webkitRelativePath ?? "") !== "" ? item.webkitRelativePath : item.name, scaleType: "percentage", blob: await ImageBlobHandler(item.name.substring(item.name.lastIndexOf(".") + 1), await item.arrayBuffer()) }); // Honestly, I don't know what the fuck is going on here. However, this makes TypeScript happy.
    }
    convertFiles.update((val) => [
        ...val,
        ...composeAsyncArray
    ]);
    composeAsyncArray.length > 0 && conversionStatus.set(1);
    spinner.remove();
}