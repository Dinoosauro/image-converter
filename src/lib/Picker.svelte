<script lang="ts">
    import { onMount } from "svelte";
    import FilePicker from "../Scripts/FilePicker";
    import {
        conversionStatus,
        convertFiles,
        type FileConversion,
    } from "../Scripts/Storage";
    import TitleIcon from "./Styles/TitleIcon.svelte";
    import FileArrayHandler from "../Scripts/FileArrayHandler";
    import CheckNativeHeicSupport from "../Scripts/CheckNativeHeicSupport";
    import CheckSupportedFile from "../Scripts/CheckSupportedFile";
    const file = FilePicker;
    $: folderPickerName = file.webkitdirectory ? "a folder" : "files";
    const inputId = `CheckBox-${Math.random().toString().substring(2)}`;
    /**
     * Get content from the clipboard, and convert them. Usually, the content provided is `image/png`
     */
    async function readFromClipboard() {
        try {
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
        } catch (ex) {
            console.warn(ex);
        }
        const content = await navigator.clipboard.read();
        const tempArray: File[] = [];
        for (let item of content) {
            for (let type of item.types) {
                if (!CheckSupportedFile({ type, name: `.temp` })) {
                    tempArray.push(
                        new File(
                            [await item.getType(type)],
                            `ClipboardItem-${Date.now()}-${Math.random().toString().substring(2)}.${type.substring(type.indexOf("/") + 1)}`,
                            {
                                type,
                            },
                        ),
                    );
                    break;
                }
            }
        }
        FileArrayHandler(tempArray);
    }
    onMount(() => {
        if ("launchQueue" in window) {
            // Check if the user has opened files from the system's file picker
            (window.launchQueue as any).setConsumer(
                async (launchParams: any) => {
                    const arr = [];
                    for (let item of launchParams.files)
                        arr.push(await item.getFile());
                    FileArrayHandler(arr);
                },
            );
        }
    });
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
