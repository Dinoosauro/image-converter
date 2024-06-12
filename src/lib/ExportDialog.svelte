<script lang="ts">
    let div: HTMLDivElement;
    let bottomDiv: HTMLDivElement;
    import {
        outputLink,
        conversionProgress,
        conversionType,
    } from "../Scripts/Storage";
    function closePopup(useBottomDiv?: boolean) {
        (useBottomDiv ? bottomDiv : div).style.opacity = "0";
        setTimeout(
            () =>
                (useBottomDiv ? conversionProgress : outputLink).set(undefined),
            210,
        );
    }
    outputLink.subscribe((link) => {
        if (div !== undefined) {
            const newLink = link;
            div.style.display = link ? "block" : "none";
            if (link) {
                setTimeout(() => {
                    div.style.opacity = "1";
                }, 15);
                setTimeout(() => {
                    newLink === link && closePopup();
                }, 4000);
            }
        }
    });
    conversionProgress.subscribe((val) => {
        if (!bottomDiv) return;
        if (val === undefined) closePopup(true);
        else {
            bottomDiv.style.display = "block";
            setTimeout(() => (bottomDiv.style.opacity = "1"), 15);
        }
    });
</script>

<div bind:this={div} class="topDialog" style="display: none; opacity: 0">
    <div class="fullDialogPadding">
        <label>The download has started!</label>
        <a style="margin-left: 10px;" href={$outputLink}>Force download</a>
        <label
            style="margin-left: 10px; text-decoration: underline"
            class="pointer"
            on:click={() => closePopup()}>Close alert</label
        >
    </div>
</div>
<div
    bind:this={bottomDiv}
    class="topDialog"
    style="top: auto; bottom: 10vh; display: none; opacity: 0"
>
    <div class="fullDialogPadding">
        <div class="flex hcenter">
            <div class="spinner" style="margin-right: 10px"></div>
            <label
                >{$conversionType === "fileopen"
                    ? "Reading file"
                    : "Converting image"}
                {$conversionProgress !== undefined
                    ? $conversionProgress + 1
                    : "operation completed"}</label
            >
            <label
                style="margin-left: 10px; text-decoration: underline"
                class="pointer"
                on:click={() => closePopup(true)}>Close alert</label
            >
        </div>
    </div>
</div>
