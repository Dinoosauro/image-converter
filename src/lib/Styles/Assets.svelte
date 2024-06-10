<script lang="ts">
    import { onMount } from "svelte";
    import {
        ImageRes,
        setAccentImage,
    } from "../../Scripts/ImageContentHandler";
    import type { AssetsType } from "../../Scripts/Storage";

    export let imgKey: AssetsType;
    export let click: () => void;
    let img: HTMLImageElement;
    onMount(() => {
        img.src = URL.createObjectURL(
            new Blob([ImageRes(imgKey)], { type: "image/svg+xml" }),
        );
        setAccentImage(img, imgKey);
    });
</script>

<img bind:this={img} on:click={click} width="32" height="32" />
