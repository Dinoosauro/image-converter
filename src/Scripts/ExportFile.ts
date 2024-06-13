import JSZip from "jszip";
import { outputLink } from "./Storage";
import FileSystemHandle from "./FileSystemHandle";
let zip = new JSZip();
/**
 * Creates a link to download a file
 * @param blob the blob to download
 * @param name the name of the output file
 */
function LinkDownload(blob: Blob, name: string) {
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name.substring(name.lastIndexOf("/") + 1);
    outputLink.set(a.href);
    a.click();

}
/**
 * Exports the provided Blob, and download it if it isn't a zip file
 * @param blob the blob to download
 * @param name the name of the output tipe
 * @param saveType how the file should be saved. If `zip` is provided, the content will be added in the zip file. If a FileSystemDirectoryHandle is provided, the file will be created in the provided directory (by creating the folders if necessary). If a FileSystemFileHandle is provided, it'll be used to write directly to that file.
 */
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
/**
 * Download the .zip file
 */
export async function getZip() {
    LinkDownload(await zip.generateAsync({ type: "blob" }), "ZipImages.zip");
}
/**
 * Replace the zip file with an empty one
 */
export function restoreZip() {
    zip = new JSZip();
}