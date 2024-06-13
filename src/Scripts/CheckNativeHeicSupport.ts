import HeicTest from "../assets/test.jpg";

/**
 * Check if the browser has a native HEIC decoder
 * @returns A promise, resolved if the browser supports HEIC images or rejected otherwise
 */
export default function CheckNativeHeicSupport() {
    return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = HeicTest;
        img.onload = () => resolve();
        img.onerror = () => reject();
    })
}