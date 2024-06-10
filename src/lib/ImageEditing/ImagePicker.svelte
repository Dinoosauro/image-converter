<script lang="ts">
    import { beforeUpdate, onMount } from "svelte";
    import {
        convertFiles,
        currentImageEditing,
        type FileConversion,
    } from "../../Scripts/Storage";
    import file from "../../Scripts/FilePicker";
    let numberOfImagesAdded = 0;
    let isFirstAdditionBeingDone = true;
    let imgArray: HTMLImageElement[] = [];
    let addDiv: HTMLDivElement;
    function checkOverflow() {
        addDiv.style.justifyContent =
            addDiv.clientWidth <
            Array.from(addDiv.children)
                .map((e) => e.scrollWidth + 5)
                .reduce((a, b) => a + b)
                ? "left"
                : "center";
    }
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
                imgArray[$currentImageEditing].remove();
                imgArray.splice($currentImageEditing, 1);
                for (let i = 0; i < imgArray.length; i++)
                    imgArray[i].onclick = () => currentImageEditing.set(i);
                $convertFiles = $convertFiles;
                currentImageEditing.set(0);
            }}>Remove current picutre</button
        >
    </div>
</div>
