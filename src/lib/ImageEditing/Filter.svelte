<script lang="ts">
    import {
        convertFiles,
        currentImageEditing,
        measureMap,
        forceCanvasUpdate,
    } from "../../Scripts/Storage";
    import TitleIcon from "../Styles/TitleIcon.svelte";
    /**
     * Get the filter applied to the current image
     * @param type the filter value to look
     */
    function getFilter(type: string) {
        const filter = $convertFiles[$currentImageEditing].filters;
        return filter ? filter[type as "blur"] : undefined;
    }
    // Import the filter polyfill if the browser doesn't support native filtering
    document.createElement("canvas").getContext("2d")?.filter === undefined &&
        import("context-filter-polyfill");
</script>

<div class="card">
    <TitleIcon asset="imagesparkle">Apply filters:</TitleIcon>
    <br />
    <div class="card second" style="overflow: auto;">
        <div class="flex flexWrap" style="position: relative;">
            {#each [{ description: "Blur", updateVal: "blur", min: 0, max: 999 }, { description: "Contrast", updateVal: "contrast", min: 0 }, { description: "Brigthness", updateVal: "brightness", min: 0 }, { description: "Saturation", updateVal: "saturate", min: 0 }, { description: "Grayscale", updateVal: "grayscale", min: 0, max: 100 }, { description: "Sepia", updateVal: "sepia", min: 0, max: 100 }, { description: "Inversion", min: 0, max: 100, updateVal: "invert" }, { description: "Opacity", updateVal: "opacity", min: 0, max: 100 }, { description: "Hue rotation", updateVal: "hue-rotate", min: -180, max: 180 }, { description: "Drop shadow (Provide full CSS values)", updateVal: "drop-shadow", type: "text" }] as option (`${option.updateVal}-${$currentImageEditing}`)}
                <div class="circular">
                    <div>
                        {option.description}:
                        <input
                            type={option.type ?? "number"}
                            min="{option.min},"
                            max="{option.max},"
                            value={getFilter(option.updateVal) ?? ""}
                            on:input={(e) => {
                                const input = e.currentTarget.value;
                                $convertFiles[$currentImageEditing].filters = {
                                    ...$convertFiles[$currentImageEditing]
                                        .filters,
                                    [option.updateVal]: input,
                                };
                                setTimeout(() => {
                                    // @ts-ignore
                                    e.target?.value === input &&
                                        forceCanvasUpdate.set(Date.now());
                                }, 450);
                            }}
                        />
                        {measureMap.get(option.updateVal)}
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <br /><br />
</div>

<style>
    input {
        width: 40px;
        margin: 0;
    }
</style>
