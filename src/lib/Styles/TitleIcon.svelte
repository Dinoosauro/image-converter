<script lang="ts">
    import type { AssetsType } from "../../Scripts/Storage";
    import Assets from "./Assets.svelte";
    export let asset: AssetsType;
    export let isH3 = false;
</script>

<div class="flex hcenter wcenter">
    <Assets imgKey={asset} click={() => {}}></Assets>
    {#if isH3}
        <h3 style="margin-left: 10px;"><slot></slot></h3>
    {:else}
        <h2 style="margin-left: 10px;"><slot></slot></h2>
    {/if}
</div>
