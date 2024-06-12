<script lang="ts">
    export let close;
</script>

<div class="dialogContainer">
    <div class="fullDialog">
        <div class="fullDialogPadding">
            <slot></slot>
            <br /><br />
            <button on:click={close}>Close dialog</button>
        </div>
    </div>
</div>
