<script lang="ts">
    import { onMount } from "svelte";
    let mainDiv: HTMLDivElement;
    export let close;
    export let customCloseDialogName = "Close dialog";
    onMount(() => {
        setTimeout(() => (mainDiv.style.opacity = "1"), 25);
    });
</script>

<div bind:this={mainDiv} class="dialogContainer">
    <div class="fullDialog">
        <div class="fullDialogPadding">
            <slot></slot>
            <br /><br />
            {#if close}<button on:click={close}>{customCloseDialogName}</button>
            {/if}
        </div>
    </div>
</div>
