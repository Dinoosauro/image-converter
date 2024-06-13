<script lang="ts">
    import {
        convertFiles,
        currentImageEditing,
        forceCanvasUpdate,
    } from "../../Scripts/Storage";
    import TitleIcon from "../Styles/TitleIcon.svelte";
    const inputId = `Input-${Math.random().toString().substring(2)}`;
    /**
     * Wait 350ms and check if the value is the same before re-rendering the image with the new size
     * @param e the Event
     */
    function refreshEvent(e: Event) {
        const time = (e.target as HTMLInputElement).value;
        setTimeout(() => {
            if (time === (e.target as HTMLInputElement).value)
                forceCanvasUpdate.set(Date.now());
        }, 350);
    }
</script>

<div class="card">
    <TitleIcon asset="resizeimage">Resize content:</TitleIcon>
    <select
        on:change={() => forceCanvasUpdate.set(Date.now())}
        bind:value={$convertFiles[$currentImageEditing].scaleType}
    >
        <option value="percentage">Percentage</option>
        <option value="width">Fixed width</option>
        <option value="height">Fixed height</option>
    </select><br /><br />
    <div class="card second">
        {#if $convertFiles[$currentImageEditing].scaleType === "percentage"}
            <input
                on:input={refreshEvent}
                bind:value={$convertFiles[$currentImageEditing].scale}
                type="range"
                min="1"
                max="100"
                step="1"
            /><br /><br />
            <p style="text-align: center;">
                {$convertFiles[$currentImageEditing].scale ??
                    "Please choose a percentage. Otherwise, the deafult value will be 100"}%
            </p>
        {:else}
            <input
                id={inputId}
                type="number"
                on:input={refreshEvent}
                bind:value={$convertFiles[$currentImageEditing].scale}
            /><label for={inputId}
                >Choose output {$convertFiles[$currentImageEditing]
                    .scaleType}</label
            >
        {/if}
    </div>
    <br />
    <div class="second card">
        <h3>File exportation format:</h3>
        <select bind:value={$convertFiles[$currentImageEditing].mimeType}>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            {#if document
                .createElement("canvas")
                .toDataURL("image/webp")
                .startsWith("data:image/webp")}
                <option value="image/webp">WebP</option>
            {/if}
        </select><br />
        {#if $convertFiles[$currentImageEditing].mimeType !== undefined && $convertFiles[$currentImageEditing].mimeType !== "image/png"}
            <h4>Choose image quality:</h4>
            <input
                type="range"
                step="0.01"
                min="0.01"
                max="1"
                bind:value={$convertFiles[$currentImageEditing].quality}
            />
            <p style="text-align: center;">
                {$convertFiles[$currentImageEditing].quality ??
                    "Select the output quality. Default: 1"}/1
            </p>
        {/if}
    </div>
</div>
