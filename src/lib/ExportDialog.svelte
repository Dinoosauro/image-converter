<script lang="ts">
    /**
     * The top div, used for forcing a download
     */
    let div: HTMLDivElement;
    /**
     * The bottom div, used to inform the user of the current operation status
     */
    let bottomDiv: HTMLDivElement;
    import {
        outputLink,
        conversionProgress,
        conversionType,
    } from "../Scripts/Storage";
    /**
     * A number that changes when a value of the top/bottom dialog is edited.
     * This is done since `opacity = 0` is applied immediately, while `opacity = 1` is applied after 15ms. This means that, if an operation completes before 15ms, the alert would remain visible, since the timeout would set the opacity of the dialog as 1. To solve this, `opacity = 1` won't be applied if this value isn't the same of the one when the operation started.
     */
    let currentId = 0;
    /**
     * Force close the dialog, by setting the opacity to 0 and the value linked to the dialog as undefined.
     * @param useBottomDiv hide the bottom diaog instead of the top one
     */
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
        currentId++;
        const keepId = currentId;
        if (val === undefined) closePopup(true);
        else {
            bottomDiv.style.display = "block";
            setTimeout(() => {
                if (keepId === currentId) bottomDiv.style.opacity = "1";
            }, 15);
        }
    });
</script>

<div bind:this={div} class="topDialog" style="display: none; opacity: 0">
    <div class="fullDialogPadding">
        <label>The download has started!</label>
        <a style="margin-left: 10px;" href={$outputLink}>Force download</a>
        <label
            style="margin-left: 10px; text-decoration: underline"
            class="pointer event"
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
                    : $conversionType === "blurapply"
                      ? "Calculating blur for image"
                      : "Converting image"}
                {$conversionProgress !== undefined
                    ? $conversionProgress + 1
                    : "operation completed"}</label
            >
            <label
                style="margin-left: 10px; text-decoration: underline"
                class="pointer event"
                on:click={() => closePopup(true)}>Close alert</label
            >
        </div>
    </div>
</div>
