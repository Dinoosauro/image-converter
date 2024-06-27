<script lang="ts">
    import { afterUpdate, hasContext, onMount } from "svelte";
    import {
        conversionProgress,
        conversionType,
        convertFiles,
        currentImageEditing,
        forceCanvasUpdate,
        measureMap,
        TikTokCaption,
        TikTokCode,
        TikTokProgress,
        TikTokTitle,
        TikTokURL,
        type FileConversion,
    } from "../../Scripts/Storage";
    import { ExportFile, getZip, restoreZip } from "../../Scripts/ExportFile";
    import FileSystemHandle from "../../Scripts/FileSystemHandle";
    import TitleIcon from "../Styles/TitleIcon.svelte";
    import createSpinner from "../../Scripts/CreateSpinner";
    import Dialog from "../Styles/Dialog.svelte";
    // When the user changes the value of the "Save as zip" checkbox
    let exportAsZip = localStorage.getItem("ImageConverter-SaveZip") === "a";
    $: {
        localStorage.setItem("ImageConverter-SaveZip", exportAsZip ? "a" : "b");
    }
    /**
     * The ID of the "Save as a zip file" checkbox, so that it can be tied with the label
     */
    let zipId = `Checkbox-${Math.random().toString().substring(2)}`;
    /**
     * The canvas where the image is rendered
     */
    let canvas: HTMLCanvasElement;
    /**
     * The image that is being currenty edited
     */
    const img = new Image();
    /**
     * Replace the `img` variable by getting a new Image URL from the selected Blob
     */
    async function updateView() {
        return new Promise<void>(async (resolve, reject) => {
            img.src = URL.createObjectURL(
                $convertFiles[$currentImageEditing].blob,
            );
            img.onload = async () => {
                await reRender();
                resolve();
            };
            img.onerror = () => reject();
            document.title = `[${$currentImageEditing + 1}/${$convertFiles.length}] ${$convertFiles[$currentImageEditing].fileName} | image-converter`;
        });
    }
    /**
     * Get the output [width, height] of the image, according to user's preference
     */
    function getProportions() {
        switch ($convertFiles[$currentImageEditing].scaleType) {
            case "percentage":
                return [
                    (img.width *
                        ($convertFiles[$currentImageEditing].scale ?? 100)) /
                        100,
                    (img.height *
                        ($convertFiles[$currentImageEditing].scale ?? 100)) /
                        100,
                ];
            case "height":
            case "width":
                return [
                    $convertFiles[$currentImageEditing].scaleType === "height"
                        ? (img.width *
                              ($convertFiles[$currentImageEditing].scale ??
                                  img.height)) /
                          img.height
                        : $convertFiles[$currentImageEditing].scale ??
                          img.width,
                    $convertFiles[$currentImageEditing].scaleType === "height"
                        ? $convertFiles[$currentImageEditing].scale ??
                          img.height
                        : (img.height *
                              ($convertFiles[$currentImageEditing].scale ??
                                  img.width)) /
                          img.width,
                ];
            default:
                return [img.width, img.height];
        }
    }
    /**
     * Re-render the canvas, applying both the new width/height and the custom filters
     */
    function reRender() {
        return new Promise<void>((resolve, reject) => {
            if (canvas === undefined) {
                console.warn("Canvas undefined!");
                reject();
            }
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const spinner = createSpinner(); // Show the loading spinner
                setTimeout(() => {
                    // Add it with a timeout so that the spinner is added to the DOM and rendered
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    [canvas.width, canvas.height] = getProportions();
                    /**
                     * The string that'll contain the filters applied by the user.
                     * In the `convertFiles` object array, each filter is stored as a key-value object. The following for loop will convert this.
                     */
                    let outputStr = "";
                    for (let key in $convertFiles[$currentImageEditing]
                        .filters ?? {}) {
                        // @ts-ignore
                        outputStr += `${key}(${$convertFiles[$currentImageEditing].filters[key]}${measureMap.get(key)}) `;
                    }
                    ctx.filter = outputStr;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    spinner.remove();
                    resolve();
                }, 40);
            } else reject();
        });
    }
    onMount(() => {
        updateView();
        window.onmessage = (msg) => {
            if (
                msg.origin === window.location.origin &&
                msg.data.state === userState
            ) {
                TikTokProgress.set(0);
                tikTokAuthorization = msg.data.code;
            }
        };
    });
    forceCanvasUpdate.subscribe(() => reRender()); // Re-render the canvas when is needed (usually when filters are changed)
    currentImageEditing.subscribe(() => updateView()); // Change the image source when the user clicks on another image
    /**
     * Get the output file name of the exported image
     * @param position the index of the `convertFiles` array to extract
     */
    function formatFileName(position: number) {
        return `${$convertFiles[position].fileName.substring(
            0,
            $convertFiles[position].fileName.lastIndexOf("."),
        )}.${
            $convertFiles[position].mimeType === "image/jpeg"
                ? "jpg"
                : ($convertFiles[position].mimeType ?? "image/png").substring(
                      ($convertFiles[position].mimeType ?? "image/png").indexOf(
                          "/",
                      ) + 1,
                  )
        }`;
    }
    /**
     * Get, and save the current canvas as a Blob
     * @param handle A Handle from the File System API. If not provided, the file will be downloaded normally
     * @param beforeName The name to add before the file. This is currently used when a FileSystemDirectoryHandle is provided, so that a new folder can be created with all the exported images
     */
    function exportCanvas(
        handle?: FileSystemFileHandle | FileSystemDirectoryHandle,
        beforeName?: string,
    ) {
        return new Promise<void>((resolve) => {
            canvas.toBlob(
                async (blob) => {
                    blob !== null &&
                        (await ExportFile(
                            blob,
                            `${beforeName ? `${beforeName}/` : ""}${formatFileName($currentImageEditing)}`,
                            exportAsZip ? "zip" : handle,
                        ));
                    resolve();
                },
                $convertFiles[$currentImageEditing].mimeType,
                $convertFiles[$currentImageEditing].quality,
            );
        });
    }
    interface BatchConvertObj {
        id: string;
        update: boolean;
        showText: string;
        updateVal: (keyof FileConversion)[];
    }
    /**
     * An array of the four options that can be copied from an image to all the others
     */
    let batchConvertItems: BatchConvertObj[] = [];
    /**
     * An array that'll be merged on the `batchConvertItems` array, with the text to display for each category
     */
    const batchConvertText = [
        "Image output format",
        "Width/height settings",
        "Quality settings",
        "Filter settings",
    ];
    /**
     * An array that contains an array of properties to copy if a checkbox is checked.
     */
    const availableOptions: (keyof FileConversion)[][] = [
        ["mimeType"],
        ["scaleType", "scale"],
        ["quality"],
        ["filters"],
    ];
    // Populate the new array
    for (let i = 0; i < 4; i++)
        batchConvertItems[i] = {
            id: `Checkbox-${Math.random()}`,
            update: false,
            showText: batchConvertText[i],
            updateVal: availableOptions[i],
        };
    /**
     * Show the "Apply the property to all items" dialog
     */
    function showDialog() {
        const select = document.querySelector(
            ".dialogContainer",
        ) as HTMLElement | null;
        select && setTimeout(() => (select.style.opacity = "1"), 15);
    }

    /**
     * Apply the selected properties to all the items of the array
     */
    async function applyBatchCheckbox() {
        for (let i = 0; i < batchConvertItems.length; i++) {
            if (batchConvertItems[i].update)
                for (let x = 0; x < $convertFiles.length; x++) {
                    for (let option of batchConvertItems[i].updateVal)
                        $convertFiles[x][option as "blob"] = $convertFiles[
                            $currentImageEditing
                        ][option] as Blob;
                }
        }
        if (
            scaleBlurPixel &&
            $convertFiles[$currentImageEditing].filters?.blur
        ) {
            const [currentBlur, currentPixels] = [
                +($convertFiles[$currentImageEditing].filters?.blur as string),
                img.width * img.height,
            ];
            for (let i = 0; i < $convertFiles.length; i++)
                await new Promise<void>((resolve) => {
                    conversionType.set("blurapply"); // Change the text that'll be shown in the bottom dialog
                    conversionProgress.set(i); // And set the number of the image that is being elaborated, so that the bottom dialog can be shown with that number.
                    const newImg = new Image();
                    newImg.src = URL.createObjectURL($convertFiles[i].blob);
                    newImg.onload = () => {
                        $convertFiles[i].filters = {
                            ...$convertFiles[i].filters,
                            blur: `${(currentBlur * newImg.width * newImg.height) / currentPixels}`,
                        };
                        resolve();
                    };
                    img.onerror = () => resolve();
                });
            conversionProgress.set(undefined); // Hide the bottom dialog
        }
        (
            document.querySelector(".dialogContainer") as HTMLElement
        ).style.opacity = "0";
        setTimeout(() => (showBatchDialog = false), 210);
    }
    /**
     * Show the dialog that allows the user to apply the current properties to each picture
     */
    $: showBatchDialog = false;
    /**
     * If enabled, the blur effect of the current image will be scaled to the (width * height) of all the other images, so that the same effect can be achieved
     */
    let scaleBlurPixel = false;
    const blurScaleCheckboxId = `Checkbox-${Math.random().toString().substring(2)}`;
    /**
     * The string that contains the TikTok code used for authentication
     */
    let tikTokAuthorization = "";
    /**
     * The State that'll be used for TikTok API
     */
    let userState = "";
    TikTokProgress.subscribe(async (value) => {
        value === 0 &&
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
        if (value === 1) {
            // Time to send the requests to the server
            const storeThumbnail = $currentImageEditing;
            for (let i = 0; i < $convertFiles.length; i++) {
                $currentImageEditing = i; // Change the image that'll be rendeerd
                conversionProgress.set($currentImageEditing); // And set the number of the current exported image, so that the bottom dialog can be shown with that number.
                await updateView();
                const resizedCanvas = document.createElement("canvas");
                // Currently, TikTok supports image uploads to their API up to 1080p.
                resizedCanvas.width =
                    canvas.width > canvas.height
                        ? (canvas.width * 1080) / canvas.height
                        : 1080;
                resizedCanvas.height =
                    canvas.height > canvas.width
                        ? (canvas.height * 1080) / canvas.width
                        : 1080;
                resizedCanvas
                    .getContext("2d")
                    ?.drawImage(
                        canvas,
                        0,
                        0,
                        resizedCanvas.width,
                        resizedCanvas.height,
                    );
                const arr = await new Promise<Uint8Array>((resolve) => {
                    // Render the canvas to a Blob, and then get the Uint8Array that'll be sent
                    resizedCanvas.toBlob(
                        async (blob) => {
                            if (blob) {
                                resolve(
                                    new Uint8Array(
                                        await new Response(blob).arrayBuffer(),
                                    ),
                                );
                            }
                        },
                        document
                            .createElement("canvas")
                            .toDataURL("image/webp")
                            .startsWith("data:image/webp")
                            ? "image/webp"
                            : "image/jpeg",
                        0.8,
                    );
                });
                await fetch(
                    `${$TikTokURL}upload?id=${$TikTokCode}&position=${i + 1}`, // Upload the image to the server
                    {
                        method: "POST",
                        body: arr,
                    },
                );
            }
            if (
                (
                    await fetch(`${$TikTokURL}post`, {
                        method: "POST",
                        body: JSON.stringify({
                            id: $TikTokCode,
                            description: $TikTokCaption,
                            code: tikTokAuthorization,
                            thumbnail: storeThumbnail,
                            title: $TikTokTitle,
                        }),
                    })
                ).status === 200
            )
                TikTokProgress.set(2);
            else
                alert(
                    "An error occurred while sending the post request to TikTok. Make sure that Deno Deploy is correctly set up.",
                );
            conversionProgress.set(undefined);
        }
    });
</script>

<div class="card">
    <TitleIcon asset="image">Canvas preview:</TitleIcon>
    <i>The canvas is rendered at the size set in the "Resize" tab</i><br /><br
    />
    <div class="flex" style="gap: 10px">
        <button
            on:click={async () => {
                const name = formatFileName($currentImageEditing);
                let handle;
                try {
                    if (localStorage.getItem("ImageConverter-FSApi") === "a")
                        throw new Error(
                            "The user has disabled the usage of File System API",
                        );
                    handle = await FileSystemHandle.getFileHandle({
                        suggestedName: name,
                        types: [
                            {
                                description:
                                    "Exported image. The format has been selected from the first tab.",
                                accept: {
                                    [$convertFiles[$currentImageEditing]
                                        .mimeType ?? "image/jpeg"]: [
                                        name.substring(name.lastIndexOf(".")),
                                    ],
                                },
                            },
                        ],
                    });
                } catch (ex) {
                    console.warn(ex);
                }
                conversionType.set("conversion"); // Change the text that'll be shown in the bottom dialog
                conversionProgress.set($currentImageEditing); // And set the number of the current exported image, so that the bottom dialog can be shown with that number.
                await exportCanvas(handle);
                if (exportAsZip) {
                    getZip();
                    restoreZip();
                }
                conversionProgress.set(undefined); // Hide the bottom dialog
            }}>Export this canvas</button
        >
        <button
            on:click={async () => {
                let handle;
                try {
                    if (localStorage.getItem("ImageConverter-FSApi") === "a")
                        throw new Error(
                            "The user has disabled the usage of File System API",
                        );
                    handle = await FileSystemHandle.getDirectoryHandle();
                } catch (ex) {
                    console.warn(ex);
                }
                let addName = `ImageConverter-Operation-${Date.now()}`; // Create a new directory
                for (let i = 0; i < $convertFiles.length; i++) {
                    $currentImageEditing = i; // Change the image that'll be rendeerd
                    conversionType.set("conversion"); // Change the text that'll be shown in the bottom dialog
                    conversionProgress.set($currentImageEditing); // And set the number of the current exported image, so that the bottom dialog can be shown with that number.
                    try {
                        await updateView();
                        await exportCanvas(
                            handle,
                            handle ? addName : undefined,
                        );
                    } catch (ex) {
                        console.warn(ex);
                    }
                }
                if (exportAsZip) {
                    getZip();
                    restoreZip();
                }
                conversionProgress.set(undefined); // Hide the bottom dialog
            }}>Export all images</button
        >
    </div>
    <div class="flex" style="gap: 10px">
        <button
            style="background-color: var(--second); margin-top: 5px;"
            on:click={() => {
                showDialog();
                showBatchDialog = true;
            }}>Apply current preferences to every image</button
        >
        {#if !!$TikTokURL}
            <button
                style="background-color: var(--second); margin-top: 5px;"
                on:click={() => {
                    userState = Math.random().toString(36).substring(2);
                    window.open(`${$TikTokURL}auth?state=${userState}`);
                }}>Save on TikTok</button
            >
        {/if}
    </div>
    <br /><br />
    <div class="checkContainer">
        <input type="checkbox" id={zipId} bind:checked={exportAsZip} /><label
            for={zipId}>Save as a zip file</label
        >
    </div>
    <br /><br />
    <div class="canvasContainer flex wcenter">
        <canvas bind:this={canvas}></canvas>
    </div>
</div>

{#if showBatchDialog}
    <Dialog close={applyBatchCheckbox} customCloseDialogName="Apply">
        <TitleIcon asset="image">Batch conversion settings:</TitleIcon>
        <p>
            From each slider below, choose which properties of this image should
            be applied to every image currently uploaded. Note that, if you
            upload more images, you'll need to apply these properties again.
        </p>
        <br />
        {#each batchConvertItems as text, i}
            <div class="second card" style="margin-bottom: 10px;">
                <div class="checkContainer">
                    <input
                        type="checkbox"
                        id={text.id}
                        bind:checked={text.update}
                    /><label for={text.id}>{text.showText}</label>
                </div>
            </div>
        {/each}
        <div class="second card">
            <div class="checkContainer">
                <input
                    style="background-color: var(--second)"
                    type="checkbox"
                    id={blurScaleCheckboxId}
                    bind:checked={scaleBlurPixel}
                /><label for={blurScaleCheckboxId}
                    >(Copy and) scale the blur value according to the pixels of
                    the image</label
                >
            </div>
        </div>
        <br /><br />
    </Dialog>
{/if}

<style>
    canvas {
        object-fit: contain;
        height: auto;
        border-radius: 8px;
    }
    canvas,
    .canvasContainer {
        max-width: calc(100vw - 56px);
        max-height: 80vh;
    }
</style>
