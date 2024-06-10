export default function BlobHandler(extension: string, fileBuffer: ArrayBuffer) {
    return new Promise<Blob>(async (resolve) => {
        const file = new Blob([fileBuffer]);
        switch (extension) {
            case "heic": case "heif": {
                const heic = await import("heic2any");
                const blob = await heic.default({ blob: file });
                resolve(blob as Blob);
                break;
            }
            case "tiff": case "tif": {
                const utif = (await import("utif")).default;
                const decode = utif.decode(fileBuffer);
                utif.decodeImage(fileBuffer, decode[0]);
                const proxyCanvas = document.createElement("canvas");
                proxyCanvas.width = decode[0].width;
                proxyCanvas.height = decode[0].height;
                const ctx = proxyCanvas.getContext("2d");
                if (ctx) {
                    const imgData = ctx.createImageData(proxyCanvas.width, proxyCanvas.height);
                    imgData.data.set(utif.toRGBA8(decode[0]));
                    ctx.putImageData(imgData, 0, 0);
                    proxyCanvas.toBlob((blob) => { if (blob) resolve(new Blob([blob], { type: "image/png" })) })
                };
                break;
            }
            default:
                resolve(file);
                break;
        }

    })
}