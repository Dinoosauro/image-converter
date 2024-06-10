import JSZip from "jszip";
import { outputLink } from "./Storage";
import FileSystemHandle from "./FileSystemHandle";
let zip = new JSZip();
function LinkDownload(blob: Blob, name: string) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name.substring(name.lastIndexOf("/") + 1);
    outputLink.set(a.href);
    a.click();

}
export async function ExportFile(blob: Blob, name: string, saveType?: "zip" | FileSystemDirectoryHandle | FileSystemFileHandle) {
    if (saveType === "zip") {
        zip.file(name, blob, {
            createFolders: true
        });
        return;
    } else if (saveType) {
        await FileSystemHandle.writeFile({ name: name, blob: blob, handle: saveType });
        return;
    }
    LinkDownload(blob, name);
}
export async function getZip() {
    LinkDownload(await zip.generateAsync({ type: "blob" }), "ZipImages.zip");
}
export function restoreZip() {
    zip = new JSZip();
}