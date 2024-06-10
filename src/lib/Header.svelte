<script>
    import Assets from "./Styles/Assets.svelte";
</script>

<div class="flex hcenter wcenter">
    <span style="transform: scale(1.25); line-height: 0">
        <Assets imgKey="image" click={() => {}}></Assets>
    </span>
    <h1 style="margin-left: 10px;">image-converter</h1>
</div>
<p>Re-render images to JPG/PNG/WebP, by scaling them and adding filters</p>
