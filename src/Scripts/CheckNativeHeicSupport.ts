import HeicTest from "../assets/test.jpg";

export default function CheckNativeHeicSupport() {
    return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = HeicTest;
        img.onload = () => resolve();
        img.onerror = () => reject();
    })
}