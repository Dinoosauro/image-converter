<script lang="ts">
    import { beforeUpdate, onMount } from "svelte";
    import {
        convertFiles,
        currentImageEditing,
        type FileConversion,
    } from "../../Scripts/Storage";
    import file from "../../Scripts/FilePicker";
    let numberOfImagesAdded = 0; // Used for indexing the images
    /**
     * Avoid adding multiple times the pictures if it's the pictures are being loaded from the home's file picker.
     * This is done since later the component subscribes to variations of the `convertFiles` object, and therefore the items from that picker would be counted twice.
     */
    let isFirstAdditionBeingDone = true;
    /**
     * The array of the image elements added
     */
    let imgArray: HTMLImageElement[] = [];
    /**
     * The div where all the images will be added. Used for removing an image.
     */
    let addDiv: HTMLDivElement;
    /**
     * Make the div centered only if there's enough space, since otherwise the images would be cut.
     */
    function checkOverflow() {
        addDiv.style.justifyContent =
            addDiv.clientWidth <
            Array.from(addDiv.children)
                .map((e) => e.scrollWidth + 5)
                .reduce((a, b) => a + b)
                ? "left"
                : "center";
    }
    /**
     * Add an image to the div
     * @param i the position to place the image in the array. This value must be the same as the `convertFiles` equivalent.
     */
    async function addImages(i: number) {
        const img = document.createElement("img");
        img.classList.add("contentImg", "pointer");
        img.src = URL.createObjectURL($convertFiles[i].blob);
        img.onload = () => {
            img.style.aspectRatio = `${img.width}/${img.height}`;
        };
        img.loading = "lazy";
        img.onclick = () => currentImageEditing.set(i);
        addDiv.append(img);
        imgArray[i] = img;
        numberOfImagesAdded++;
        checkOverflow();
    }
    onMount(async () => {
        for (let i = 0; i < $convertFiles.length; i++) await addImages(i);
        checkOverflow();
        isFirstAdditionBeingDone = false;
    });
    window.addEventListener("resize", checkOverflow);
    convertFiles.subscribe(async (newVal) => {
        if (isFirstAdditionBeingDone) return;
        for (let i = numberOfImagesAdded; i < newVal.length; i++)
            await addImages(i);
    });
</script>

<div class="card">
    <div
        class="flex hcenter wcenter"
        style="gap: 5px; overflow: auto"
        bind:this={addDiv}
    ></div>
    <br />
    <div class="flex" style="gap: 5px">
        <button
            on:click={() => {
                file.click();
            }}>Add picture(s)</button
        >
        <button
            on:click={() => {
                $convertFiles.splice($currentImageEditing, 1);
                imgArray[$currentImageEditing].remove(); // Remove the image from the DOM
                imgArray.splice($currentImageEditing, 1); // And delete it from the array
                for (let i = $currentImageEditing; i < imgArray.length; i++)
                    imgArray[i].onclick = () => currentImageEditing.set(i); // Set again the click event, since the [i] value has changed.
                $convertFiles = $convertFiles; // Trigger events for `convertFiles` change
                currentImageEditing.set(0); // Go back to the first image
            }}>Remove current picutre</button
        >
    </div>
</div>
