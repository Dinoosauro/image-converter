<script lang="ts">
  import Header from "./lib/Header.svelte";
  import "./app.css";
  import {
    conversionStatus,
    TikTokProgress,
    TikTokURL,
  } from "./Scripts/Storage";
  import Picker from "./lib/Picker.svelte";
  import Resize from "./lib/ImageEditing/Resize.svelte";
  import Filter from "./lib/ImageEditing/Filter.svelte";
  import PWAPrompt from "./lib/PWAPrompt.svelte";
  import CanvasRender from "./lib/ImageEditing/CanvasRender.svelte";
  import ImagePicker from "./lib/ImageEditing/ImagePicker.svelte";
  import ExportDialog from "./lib/ExportDialog.svelte";
  import Dialog from "./lib/Styles/Dialog.svelte";
  import { afterUpdate, onMount } from "svelte";
  import FileArrayHandler from "./Scripts/FileArrayHandler";
  import Assets from "./lib/Styles/Assets.svelte";
  import TitleIcon from "./lib/Styles/TitleIcon.svelte";
  import { updateAccentImage } from "./Scripts/ImageContentHandler";
  import Privacy from "./lib/Privacy.svelte";
  import Licenses from "./lib/Licenses.svelte";
  import CheckNativeHeicSupport from "./Scripts/CheckNativeHeicSupport";
  import TikTokIntegration from "./lib/Extra/TikTokIntegration.svelte";
  /**
   * If set to `1`, the Settings dialog will be shown
   */
  $: dialogShow = 0;
  const fileSystemAPIId = `Checkbox-${Math.random().toString().substring(2)}`;
  afterUpdate(() => {
    const select = document.querySelector(
      ".dialogContainer",
    ) as HTMLElement | null;
    select && setTimeout(() => (select.style.opacity = "1"), 15);
  });
  const theme = {
    dark: {
      background: "#151515",
      text: "#fafafa",
      struct: "#313131",
      second: "#4d4d4d",
      accent: "#138375",
    },
    light: {
      background: "#fafafa",
      text: "#151515",
      struct: "#d9d9d9",
      second: "#b6b6b6",
      accent: "#3ab4a4",
    },
  };
  /**
   * Update a style property
   * @param prop the key to update
   * @param val its new value
   */
  function applyNewTheme(prop: string, val: string) {
    document.body.style.setProperty(`--${prop}`, val);
    localStorage.setItem(
      "ImageConverter-Theme",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("ImageConverter-Theme") ?? "{}"),
        [prop]: val,
      }),
    );
    prop === "accent" && updateAccentImage(); // If the accent color is changed, update also the icons
  }
  const restoreTheme = JSON.parse(
    localStorage.getItem("ImageConverter-Theme") ?? "{}",
  );
  for (let key in restoreTheme) applyNewTheme(key, restoreTheme[key]);
  /**
   * Change the theme from dark to light (or viceversa)
   * @param e the Event of the checkbox change, or the booelan that indicates if the dark theme is checked (true) or not (false).
   */
  function changeTheme(e: Event | boolean) {
    if (e instanceof Event)
      e = (e.target as HTMLSelectElement).value === "dark";
    for (let item in theme.dark)
      applyNewTheme(item, theme[e ? "dark" : "light"][item as "background"]);
  }
  /**
   * The event triggered when the user changes a specific input[type=color] for the theme
   * @param e the Event
   * @param prop the property to edit
   */
  function colorPickerApply(e: Event, prop: string) {
    applyNewTheme(prop, (e.target as HTMLSelectElement).value);
  }
  /**
   * Hide the settings dialog, or, in general, every dialog
   */
  function hideDialog() {
    const select = document.querySelector(
      ".dialogContainer",
    ) as HTMLElement | null;
    if (select) {
      select.style.opacity = "0";
      setTimeout(() => (dialogShow = 0), 210);
    }
  }
  /**
   * Set in the LocalStorage if the checkbox is checked or not
   * @param e the Event
   * @param isHeic if this is the `Use native heic library` checkbox (if not provided -> `Don't use File System API` checkbox)
   */
  function fileSystemAPIChange(e: Event, isHeic?: true) {
    localStorage.setItem(
      isHeic ? "ImageConverter-HeicLibrary" : "ImageConverter-FSApi",
      (e.target as HTMLInputElement).checked ? "a" : "b",
    );
  }
  /**
   * Set in the LocalStorage the new PDF Scale
   * @param e the Event
   */
  function PDFScaleChange(e: Event, key?: string) {
    localStorage.setItem(
      key ?? "ImageConverter-PDFScale",
      (e.target as HTMLInputElement).value,
    );
  }
  /**
   * Handle file drop in the Document
   * @param e
   */
  function drop(e: DragEvent) {
    e.preventDefault();
    const files: File[] = [];
    if (e.dataTransfer?.items) {
      for (let item of e.dataTransfer.items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          file && files.push(file);
        }
      }
      FileArrayHandler(files);
    }
    document.documentElement.classList.remove("drop");
  }
  const pdfScalingId = `Input-${Math.random().toString().substring(2)}`;
  const heicImageId = `Input-${Math.random().toString().substring(2)}`;
</script>

<svelte:document
  on:drop={drop}
  on:dragover={(e) => e.preventDefault()}
  on:dragenter={() => document.documentElement.classList.add("drop")}
  on:dragleave={() => document.documentElement.classList.remove("drop")}
/>
<Header></Header><br />
{#if $conversionStatus === 0}
  <div class="flex multiPage">
    <Picker></Picker>
    {#if !window.matchMedia("(display-mode: standalone)").matches}
      <PWAPrompt></PWAPrompt>
    {/if}
    <Privacy></Privacy>
  </div>
{:else if $conversionStatus === 1}
  <ImagePicker></ImagePicker><br />
  <div class="flex multiPage">
    <div>
      <Filter></Filter>
    </div>
    <CanvasRender></CanvasRender>
  </div>
  <br /><br />
  {#if $TikTokProgress !== -1}
    <TikTokIntegration></TikTokIntegration>
  {/if}
{/if}
<ExportDialog></ExportDialog>

<br /><br /><br />
<span
  style="position: absolute; right: 15px; top: 15px; transform: scale(0.9)"
  class="pointer"
>
  <Assets imgKey="settings" click={() => (dialogShow = 1)}></Assets>
</span>
{#if dialogShow === 1}
  <Dialog close={hideDialog}>
    <TitleIcon asset="settings">Settings:</TitleIcon>
    <div class="second card">
      <TitleIcon asset="color" isH3={true}>Change theme:</TitleIcon>
      <div class="flex hcenter">
        <label>Presets:</label>
        <select style="margin-left: 10px;" on:change={changeTheme}>
          <option disabled selected>Choose a theme</option>
          <option value="dark">Dark theme</option>
          <option value="light">Light theme</option>
        </select><br /><br />
      </div>
      <br /><br />
      <div class="card" style="overflow: auto;">
        <h3>Change each color:</h3>
        <div class="flex flexWrap" style="position: relative;">
          {#each [{ desc: "Background", edit: "background" }, { desc: "Text", edit: "text" }, { desc: "Main cards", edit: "struct" }, { desc: "Secondary cards", edit: "second" }, { desc: "Accent color", edit: "accent" }] as prop}
            <div class="circular" style="padding: 10px">
              <div>
                <input
                  on:input={(e) => colorPickerApply(e, prop.edit)}
                  type="color"
                  style="width: 70px;"
                />
                <label>{prop.desc}</label>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    {#if window.showDirectoryPicker !== undefined}
      <br /><br />
      <div class="second card">
        <TitleIcon asset="folder" isH3={true}>File System API:</TitleIcon>
        <div class="checkContainer">
          <input
            type="checkbox"
            id={fileSystemAPIId}
            min="0.01"
            checked={localStorage.getItem("ImageConverter-FSApi") === "a"}
            on:change={(e) => fileSystemAPIChange(e)}
          />
          <label for={fileSystemAPIId}
            >Avoid using the File System API (if available)</label
          >
        </div>
      </div>
    {/if}
    <br /><br />
    <div class="second card">
      <TitleIcon asset="documentpdf" isH3={true}
        >Specific file support</TitleIcon
      >
      <div class="checkContainer">
        <label for={pdfScalingId}>Scale the PDF:</label><input
          type="number"
          style="margin: 0px 10px;"
          id={pdfScalingId}
          value={localStorage.getItem("ImageConverter-PDFScale") ?? "1"}
          on:change={PDFScaleChange}
        /><label for={pdfScalingId}>time(s)</label>
      </div>
      {#await CheckNativeHeicSupport() then}
        <br /><br />
        <div class="checkContainer">
          <input
            id={heicImageId}
            checked={localStorage.getItem("ImageConverter-HeicLibrary") === "a"}
            type="checkbox"
            on:change={(e) => fileSystemAPIChange(e, true)}
          />
          <label for={heicImageId}
            >Use your browser's native HEIC decoder (faster, but doesn't decode
            multiple images if available)</label
          >
        </div>
      {/await}
    </div>
    <br /><br />
    <div class="second card">
      <TitleIcon asset="musicnote" isH3={true}>TikTok integration</TitleIcon>
      <p>
        Write the link for the server that'll be used for posting images on
        TikTok (add the / after the URL). Leave this field blank to disable this
        function
      </p>
      <input
        class="fullWidth"
        type="text"
        bind:value={$TikTokURL}
        on:input={(e) => PDFScaleChange(e, "ImageConverter-TikTokURL")}
      /><br /><br />
      <i
        >TikTok is a trademark of ByteDance, that is in no way affiliated with
        image-renderer</i
      >
    </div>
    <br /><br />
    <Licenses></Licenses>
  </Dialog>
{:else if dialogShow === 2}
  <Dialog close={hideDialog}></Dialog>
{/if}
