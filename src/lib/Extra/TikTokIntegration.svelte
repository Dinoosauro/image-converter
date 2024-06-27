<script lang="ts">
    import {
        TikTokCode,
        TikTokURL,
        TikTokProgress,
        TikTokCaption,
        TikTokTitle,
    } from "../../Scripts/Storage";

    async function sendRequest() {
        $TikTokCode = (await (await fetch(`${$TikTokURL}getId`)).json()).id;
        $TikTokProgress = 1;
    }
</script>

<div class="card">
    <h2>Upload to TikTok</h2>
    {#if $TikTokProgress === 0}
        <p>
            The image will stored on the server written in the settings for up
            to 10 minutes, so that they can be uploaded to TikTok. Then, the
            server (if it's running the same version as the one suggested in the
            repository) will delete them. The currently selected image will be
            used for the thumbnail.
        </p>
        <br /><br />
        <div class="second card">
            <h3>Post title and caption:</h3>
            <h4>Title:</h4>
            <input
                type="text"
                style="background-color: var(--struct) !important; margin-right: 0px"
                class="fullWidth"
                bind:value={$TikTokTitle}
            /><br />
            <h4>Caption:</h4>
            <textarea bind:value={$TikTokCaption}></textarea>
        </div>
        <br />
        <br />
        <button on:click={sendRequest}>Publish video</button>
    {:else if $TikTokProgress === 1}
        <p>Uploading images on the server. Please wait.</p>
    {:else if $TikTokProgress === 2}
        <p>
            Request successfully made to TikTok. The slideshow is now available
            on your profile as a private content.
        </p>
        <br />
        <button on:click={() => ($TikTokProgress = -1)}>Close tab</button>
    {/if}
</div>
