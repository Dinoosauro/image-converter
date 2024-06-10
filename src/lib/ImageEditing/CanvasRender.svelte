<script lang="ts">
    import { afterUpdate, hasContext, onMount } from "svelte";
    import {
        conversionProgress,
        convertFiles,
        currentImageEditing,
        forceCanvasUpdate,
        measureMap,
        type FileConversion,
    } from "../../Scripts/Storage";
    import { ExportFile, getZip, restoreZip } from "../../Scripts/ExportFile";
    import FileSystemHandle from "../../Scripts/FileSystemHandle";
    import { get } from "svelte/store";
    import TitleIcon from "../Styles/TitleIcon.svelte";
    import createSpinner from "../../Scripts/CreateSpinner";
    let exportAsZip = localStorage.getItem("ImageConverter-SaveZip") === "a";
    $: {
        localStorage.setItem("ImageConverter-SaveZip", exportAsZip ? "a" : "b");
    }
    let zipId = `Checkbox-${Math.random().toString().substring(2)}`;
    let canvas: HTMLCanvasElement;
    const img = new Image();
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
        });
    }
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
    function reRender() {
        return new Promise<void>((resolve, reject) => {
            if (canvas === undefined) {
                console.warn("Canvas undefined!");
                reject();
            }
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const spinner = createSpinner();
                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const proportions = getProportions();
                    canvas.width = proportions[0];
                    canvas.height = proportions[1];
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
    onMount(() => updateView());
    forceCanvasUpdate.subscribe(() => reRender());
    currentImageEditing.subscribe(() => updateView());
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
    let batchConvertItems: BatchConvertObj[] = [];
    const batchConvertText = [
        "Image output format",
        "Width/height settings",
        "Quality settings",
        "Filter settings",
    ];
    const availableOptions: (keyof FileConversion)[][] = [
        ["mimeType"],
        ["scaleType", "scale"],
        ["quality"],
        ["filters"],
    ];
    for (let i = 0; i < 4; i++)
        batchConvertItems[i] = {
            id: `Checkbox-${Math.random()}`,
            update: false,
            showText: batchConvertText[i],
            updateVal: availableOptions[i],
        };
    function updateBatchCheckbox(e: Event, ref: number) {
        batchConvertItems[ref].update = (e.target as HTMLInputElement).checked;
    }
    function applyBatchCheckbox() {
        for (let i = 0; i < batchConvertItems.length; i++) {
            if (batchConvertItems[i].update)
                for (let x = 0; x < $convertFiles.length; x++) {
                    for (let option of batchConvertItems[i].updateVal)
                        $convertFiles[x][option as "blob"] = $convertFiles[
                            $currentImageEditing
                        ][option] as Blob;
                }
        }
        batchDialog.style.opacity = "0";
        setTimeout(() => (showBatchDialog = false), 210);
    }
    let batchDialog: HTMLDivElement;
    $: showBatchDialog = false;
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
                conversionProgress.set($currentImageEditing);
                await exportCanvas(handle);
                if (exportAsZip) {
                    getZip();
                    restoreZip();
                }
                conversionProgress.set(undefined);
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
                let addName = `ImageConverter-Operation-${Date.now()}`;
                for (let i = 0; i < $convertFiles.length; i++) {
                    $currentImageEditing = i;
                    conversionProgress.set($currentImageEditing);
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
                conversionProgress.set(undefined);
            }}>Export all images</button
        >
    </div>
    <button
        style="background-color: var(--second); margin-top: 5px;"
        on:click={() => {
            showBatchDialog = true;
            // TODO: Move this on afterMount, this solution is horrible
            const interval = setInterval(() => {
                if (!batchDialog) return;
                batchDialog.style.opacity = "1";
                for (let i = 0; i < batchConvertItems.length; i++)
                    batchConvertItems[i].update = false;
                clearInterval(interval);
            }, 15);
        }}>Apply current preferences to every image</button
    >
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
    <div class="dialogContainer" bind:this={batchDialog}>
        <div class="fullDialog">
            <TitleIcon asset="image">Batch conversion settings:</TitleIcon>
            <p>
                From each slider below, choose which properties of this image
                should be applied to every image currently uploaded. Note that,
                if you upload more images, you'll need to apply these properties
                again.
            </p>
            <br />
            {#each batchConvertItems as text, i}
                <div class="second card" style="margin-bottom: 10px;">
                    <div class="checkContainer">
                        <input
                            type="checkbox"
                            id={text.id}
                            on:change={(e) => updateBatchCheckbox(e, i)}
                        /><label for={text.id}>{text.showText}</label>
                    </div>
                </div>
            {/each}
            <br /><br />
            <button on:click={() => applyBatchCheckbox()}>Apply</button>
        </div>
    </div>
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
