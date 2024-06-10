<script lang="ts">
    export let close;
</script>

<div class="dialogContainer">
    <div class="fullDialog">
        <slot></slot>
        <br /><br />
        <button on:click={close}>Close dialog</button>
    </div>
</div>
