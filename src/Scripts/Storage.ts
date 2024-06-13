export interface FileConversion {
    fileName: string,
    blob: Blob
    filters?: {
        blur?: string
    },
    scaleType: "percentage" | "width" | "height",
    scale?: number,
    quality?: number,
    mimeType?: string
}
export type AssetsType = "settings" | "documentadd" | "resizeimage" | "imagesparkle" | "image" | "color" | "folder" | "paragraph" | "apps" | "imgmultiple" | "shield" | "documentpdf";
import { writable } from "svelte/store";

/**
 * The `conversionStatus` writable is used to change the UI from the `Picker` part to the `Edit` part
 */
export let conversionStatus = writable(0);
/**
 * The array that contains all the files that needs to be processed
 */
export let convertFiles = writable<FileConversion[]>([]);
/**
 * The image that is being currently edited
 */
export let currentImageEditing = writable(0);
/**
 * A value that, when changed, will trigger a re-render of the canvas
 */
export let forceCanvasUpdate = writable(0);
/**
 * A Map that conatins all the measure of the CSS filters to apply
 */
export const measureMap = new Map<string, string>([
    ["blur", "px"],
    ["contrast", "%"],
    ["grayscale", "%"],
    ["brightness", "%"],
    ["hue-rotate", "deg"],
    ["invert", "%"],
    ["opacity", "%"],
    ["saturate", "%"],
    ["sepia", "%"],
    ["drop-shadow", ""],
]);
/**
 * The link that permits to download a file. By setting this value to a string, the top dialog (the one used for re-downloading the file) will be set visible. By setting this as undefined, it'll be hidden
 */
export let outputLink = writable<string | undefined>();
/**
 * The number of items processed. This number is the one shown in the bottom dialog. Just like `outputLink`, by setting it as a number, the bottom dialog will be shown. By setting it as undefined, it'll be hidden.
 */
export let conversionProgress = writable<number | undefined>();
/**
 * The type of string that'll be shown in the bottom dialog
 */
export let conversionType = writable<"fileopen" | "conversion" | "blurapply">("fileopen");