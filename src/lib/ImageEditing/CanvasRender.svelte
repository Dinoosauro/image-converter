<script lang="ts">
    import { hasContext, onMount } from "svelte";
    import {
        conversionProgress,
        convertFiles,
        currentImageEditing,
        forceCanvasUpdate,
        measureMap,
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
            img.onload = () => {
                reRender();
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
        if (canvas === undefined) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const spinner = createSpinner();
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const proportions = getProportions();
                canvas.width = proportions[0];
                canvas.height = proportions[1];
                let outputStr = "";
                for (let key in $convertFiles[$currentImageEditing].filters ??
                    {}) {
                    // @ts-ignore
                    outputStr += `${key}(${$convertFiles[$currentImageEditing].filters[key]}${measureMap.get(key)}) `;
                }
                ctx.filter = outputStr;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                spinner.remove();
            }, 40);
        }
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
                    if (localStorage.getItem("ImageConverter-FSApi") !== "a")
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
                    if (localStorage.getItem("ImageConverter-FSApi") !== "a")
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
    <br />
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
