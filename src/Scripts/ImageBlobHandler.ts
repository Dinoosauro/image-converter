export default function BlobHandler(extension: string, fileBuffer: ArrayBuffer) {
    return new Promise<Blob | Blob[]>(async (resolve) => {
        const file = new Blob([fileBuffer]);
        if (localStorage.getItem("ImageConverter-HeicLibrary") === "a" && (extension === "heic" || extension === "heif")) extension += "temp";
        switch (extension) {
            case "heic": case "heif": {
                const heic = await import("heic2any");
                const blob = await heic.default({ blob: file, multiple: true });
                resolve(blob);
                break;
            }
            case "tiff": case "tif": {
                const utif = (await import("utif")).default;
                const decode = utif.decode(fileBuffer);
                let outputBlobArr: Blob[] = [];
                for (let i = 0; i < decode.length; i++) {
                    utif.decodeImage(fileBuffer, decode[i]);
                    const proxyCanvas = document.createElement("canvas");
                    proxyCanvas.width = decode[i].width;
                    proxyCanvas.height = decode[i].height;
                    const ctx = proxyCanvas.getContext("2d");
                    if (ctx) {
                        const imgData = ctx.createImageData(proxyCanvas.width, proxyCanvas.height);
                        imgData.data.set(utif.toRGBA8(decode[i]));
                        ctx.putImageData(imgData, 0, 0);
                        outputBlobArr.push(await new Promise<Blob>((next) => {
                            proxyCanvas.toBlob((blob) => { blob && next(new Blob([blob], { type: "image/png" })) })
                        }));
                    };
                }
                resolve(outputBlobArr);
                break;
            }
            case "pdf": {
                const pdfjs = (await import("pdfjs-dist"));
                // @ts-ignore
                await import("pdfjs-dist/build/pdf.worker.mjs");
                const pdfdoc = await pdfjs.getDocument(fileBuffer).promise;
                let outputBlobArr: Blob[] = [];
                for (let i = 0; i < pdfdoc.numPages; i++) {
                    const scale = +(localStorage.getItem("ImageConverter-PDFScale") ?? "1");
                    const page = await pdfdoc.getPage(i + 1);
                    const viewport = page.getViewport({ scale: scale });
                    const canvas = document.createElement("canvas");
                    for (let a of ["width", "height"]) canvas[a as "width"] = viewport[a as "width"] * scale;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        await page.render({
                            canvasContext: ctx,
                            viewport: viewport,
                            transform: scale !== 1 ? [scale, 0, 0, scale, 0, 0] : undefined
                        }).promise;
                        outputBlobArr.push(await new Promise<Blob>((next) => canvas.toBlob((blob) => blob && next(blob))))
                    }
                }
                resolve(outputBlobArr);
                break;
            }
            default:
                resolve(file);
                break;
        }

    })
}