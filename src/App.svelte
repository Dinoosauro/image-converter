<script lang="ts">
  import Header from "./lib/Header.svelte";
  import "./app.css";
  import { conversionStatus } from "./Scripts/Storage";
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
  const availableLicenses = [
    {
      name: "JSZip",
      extra:
        "2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso",
    },
    { name: "Svelte", extra: "2016-24 these people" },
    { name: "heic2any", extra: "2020 Alex Corvi" },
    { name: "UTIF.js", extra: "2017 Photopea" },
    { name: "context-filter-polyfill", extra: "2019 David Enke" },
  ];
  $: selectedLicense = "JSZip";
  function applyNewTheme(prop: string, val: string) {
    document.body.style.setProperty(`--${prop}`, val);
    localStorage.setItem(
      "ImageConverter-Theme",
      JSON.stringify({
        ...JSON.parse(localStorage.getItem("ImageConverter-Theme") ?? "{}"),
        [prop]: val,
      }),
    );
    prop === "accent" && updateAccentImage();
  }
  const restoreTheme = JSON.parse(
    localStorage.getItem("ImageConverter-Theme") ?? "{}",
  );
  for (let key in restoreTheme) applyNewTheme(key, restoreTheme[key]);
  function changeTheme(e: Event | boolean) {
    if (e instanceof Event)
      e = (e.target as HTMLSelectElement).value === "dark";
    for (let item in theme.dark)
      applyNewTheme(item, theme[e ? "dark" : "light"][item as "background"]);
  }
  function colorPickerApply(e: Event, prop: string) {
    applyNewTheme(prop, (e.target as HTMLSelectElement).value);
  }
  function hideDialog() {
    const select = document.querySelector(
      ".dialogContainer",
    ) as HTMLElement | null;
    if (select) {
      select.style.opacity = "0";
      setTimeout(() => (dialogShow = 0), 210);
    }
  }
  function fileSystemAPIChange(e: Event) {
    localStorage.setItem(
      "ImageConverter-FSApi",
      (e.target as HTMLInputElement).checked ? "a" : "b",
    );
  }
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
    <Resize></Resize>
    <div>
      <Filter></Filter>
    </div>
    <CanvasRender></CanvasRender>
  </div>
  <br /><br />
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
    <br /><br />
    <div class="second card">
      <TitleIcon asset="folder" isH3={true}>File System API:</TitleIcon>
      <div class="checkContainer">
        <input
          type="checkbox"
          id={fileSystemAPIId}
          on:change={fileSystemAPIChange}
        />
        <label for={fileSystemAPIId}
          >Avoid using the File System API (if available)</label
        >
      </div>
    </div>
    <br /><br />
    <div class="second card">
      <TitleIcon asset="paragraph" isH3={true}>License:</TitleIcon>
      <p>
        image-converter is published under the MIT License. You can see its
        source code on <a href="https://github.com/Dinoosauro/image-converter"
          >GitHub</a
        >
      </p>
      <p>
        image-converter also uses some third-party libraries to work. You can
        see their licenses below, by selecting their name.
      </p>
      <br />
      <div class="card">
        <select bind:value={selectedLicense}>
          {#each availableLicenses as { name }}
            <option value={name}>{name}</option>
          {/each}
        </select><br /><br />
        <p>
          MIT License<br /><br />Copyright (c) {availableLicenses.find(
            (e) => e.name === selectedLicense,
          )?.extra}<br /><br />Permission is hereby granted, free of charge, to
          any person obtaining a copy of this software and associated
          documentation files (the "Software"), to deal in the Software without
          restriction, including without limitation the rights to use, copy,
          modify, merge, publish, distribute, sublicense, and/or sell copies of
          the Software, and to permit persons to whom the Software is furnished
          to do so, subject to the following conditions:
        </p>
        <ul>
          <li>
            The above copyright notice and this permission notice shall be
            included in all copies or substantial portions of the Software.
          </li>
          <li>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
            CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </li>
        </ul>
      </div>
    </div>
  </Dialog>
{:else if dialogShow === 2}
  <Dialog close={hideDialog}></Dialog>
{/if}
