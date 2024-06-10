<script lang="ts">
    import FilePicker from "../Scripts/FilePicker";
    import {
        conversionStatus,
        convertFiles,
        type FileConversion,
    } from "../Scripts/Storage";
    import TitleIcon from "./Styles/TitleIcon.svelte";
    const file = FilePicker;
    $: folderPickerName = file.webkitdirectory ? "a folder" : "files";
    const inputId = `CheckBox-${Math.random().toString().substring(2)}`;
    async function readFromClipboard() {
        if (
            (
                await navigator.permissions.query({
                    name: "clipboard-read",
                })
            ).state === "denied"
        ) {
            alert("Clipboard access is required to use this feature.");
            return;
        }
        const content = await navigator.clipboard.read();
        const tempArray: FileConversion[] = [];
        for (let item of content) {
            for (let type of item.types) {
                if (type.startsWith("image/")) {
                    tempArray.push({
                        fileName: `ClipboardItem-${Date.now()}-${Math.random().toString().substring(2)}.png`,
                        scaleType: "percentage",
                        blob: await item.getType(type),
                    });
                    break;
                }
            }
        }
        if (tempArray.length !== 0) {
            convertFiles.update((prev) => [...prev, ...tempArray]);
            conversionStatus.set(1);
        }
    }
</script>

<div class="card">
    <TitleIcon asset="documentadd">Choose a file</TitleIcon>
    <i>You can also drop files here from the file picker</i><br /><br />
    <div class="checkContainer">
        <input
            id={inputId}
            type="checkbox"
            bind:checked={file.webkitdirectory}
        /><label for={inputId}>Pick a folder</label>
    </div>
    <br /><br />
    <div class="flex" style="gap: 5px">
        <button on:click={() => file.click()}>Choose {folderPickerName}</button>
        <button on:click={readFromClipboard}>Get from clipboard</button>
    </div>
</div>
