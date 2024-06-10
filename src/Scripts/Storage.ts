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
export type AssetsType = "settings" | "documentadd" | "resizeimage" | "imagesparkle" | "image" | "color" | "folder" | "paragraph";
import { writable } from "svelte/store";

export let conversionStatus = writable(0);
export let convertFiles = writable<FileConversion[]>([]);
export let currentImageEditing = writable(0);
export let forceCanvasUpdate = writable(0);
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
export let outputLink = writable<string | undefined>();
export let conversionProgress = writable<number | undefined>();