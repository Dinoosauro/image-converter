if ('serviceWorker' in navigator) {
    let registration;
    const registerServiceWorker = async () => {
        registration = await navigator.serviceWorker.register('./service-worker.js', {scope: 'https://dinoosauro.github.io/image-converter/'});
    };
    registerServiceWorker();
}
// Save for caching / offline use
fetch("./heic2any.js").then((res) => res.text().then((text) => {localHeic[2] = text; localHeic[0] = true;}));

let fileNameData = [];
let imgDataConvert = [];
let progression = 0;
let localZip = [false, undefined];
let localHeic = [false, false, ""];
let finalExtension = [];
let isDark = true;
function startConvert() {
    if (progression < imgDataConvert.length) {
        function getPng() {
            fetch(imgDataConvert[progression]).then((res) => { res.blob().then((blob) => { heic2any({ blob }).then((img) => createImg(URL.createObjectURL(img), fileNameData[progression])) }) });
        }
        console.log(finalExtension[progression]);
        if (finalExtension[progression].endsWith("heic") || finalExtension[progression].endsWith("heif")) {
            if (!localHeic[1] && localHeic[0]) {
                let heicLoader = document.createElement("script");
                heicLoader.src = URL.createObjectURL(new Blob([localHeic[2]]), {type: "text/plain"});
                heicLoader.setAttribute("crossorigin", "anonymous");
                heicLoader.onload = function () {
                    localHeic[1] = true;
                    getPng();
                }
                document.body.append(heicLoader);
            } else if (!localHeic[0] && !localHeic[1]) {
                setTimeout(() => {startConvert()}, 500);
            } else {
                getPng();
            }
        } else {
            createImg(imgDataConvert[progression], fileNameData[progression]);
        }
    } else {
        fileNameData = [];
        imgDataConvert = [];
        progression = 0;
        document.getElementById("progressbar").value = 1;
        document.getElementById("progressbar").max = 1;
        document.getElementById("progresslabel").style.display = "none";
        document.getElementById("progressfinish").style.display = "inline";
        if (document.getElementById("autozip").checked && document.getElementById("zip").checked) downloadZip(); else if (!document.getElementById("zip").checked) alert("Conversion Completed!");
        document.getElementById("reset").reset();

    }
}
function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

document.getElementById("zip").addEventListener("change", function () {
    if (localZip[0] == false) {
        let JSZipLoader = document.createElement("script");
        JSZipLoader.src = "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js";
        JSZipLoader.integrity = "sha256-rMfkFFWoB2W1/Zx+4bgHim0WC7vKRVrq6FTeZclH1Z4=";
        JSZipLoader.setAttribute("crossorigin", "anonymous");
        JSZipLoader.onload = function () {
            localZip[1] = new JSZip();
        }
        document.body.append(JSZipLoader);
        localZip[0] = true;
    } else {
        localZip[1] = new JSZip();
    }
    if (document.getElementById("zip").checked) {
        document.getElementById("clipBtn").style.display = "none";
        document.getElementById("autoDiv").style.display = "inline";
        if (document.getElementById("autozip").checked) {
            document.getElementById("zipBtn").style.display = "none";
            document.getElementById("addBtn").style.marginRight = "0px";
        }
    } else {
        document.getElementById("clipBtn").style.display = "inline";
        document.getElementById("zipBtn").style.display = "none";
        document.getElementById("addBtn").style.marginRight = "25px";
        document.getElementById("autoDiv").style.display = "none";
    }
}, false);
document.getElementById("autozip").addEventListener("change", function () {
    if (!document.getElementById("autozip").checked && document.getElementById("zip").checked) {
        document.getElementById("zipBtn").style.display = "inline";
        document.getElementById("addBtn").style.marginRight = "25px";
    } else {
        document.getElementById("zipBtn").style.display = "none";
        document.getElementById("addBtn").style.marginRight = "0px";
    }
}, false);
function downloadZip() {
    localZip[1].generateAsync({ type: "blob" }).then(function (content) {
        dataDownload(content, "image.zip");
        localZip[1] = new JSZip();
    });
}

function createImg(imgLoad, name) {
    document.getElementById("current").textContent = progression + 1;
    document.getElementById("progressbar").value = progression;
    let generalImage = new Image();
    generalImage.onload = function () {
        let canvas = document.createElement("canvas");
        let imageSize = [];
        switch (document.getElementById("resizePercentage").value) {
            case "width":
                imageSize = [Math.floor(parseInt(document.getElementById("pixelNumber").value)), Math.floor(parseInt(document.getElementById("pixelNumber").value) * generalImage.height / generalImage.width)];
                break;
            case "height":
                imageSize = [Math.floor(parseInt(document.getElementById("pixelNumber").value) * generalImage.width / generalImage.height), Math.floor(parseInt(document.getElementById("pixelNumber").value))];
                break;
            default:
                imageSize = [Math.floor(generalImage.width * document.getElementById("resizeRange").value), Math.floor(generalImage.height * document.getElementById("resizeRange").value)];
                break;
        }
        canvas.width = imageSize[0];
        canvas.height = imageSize[1];
        let context = canvas.getContext("2d");
        context.drawImage(generalImage, 0, 0, imageSize[0], imageSize[1]);
        let image;
        switch (document.getElementById("select").value) {
            case "jpg":
                image = canvas.toDataURL("image/jpeg", document.getElementById("quality").value);
                break;
            case "webp":
                image = canvas.toDataURL("image/webp", document.getElementById("quality").value);
                break;
            default:
                image = canvas.toDataURL("image/png");
                break;
        }
        if (document.getElementById("zip").checked) {
            localZip[1].file(name, dataURLtoFile(image, name));
            progression++;
            startConvert();
        } else {
            fetch(image).then(response => response.blob()).then(blob => {
                dataDownload(blob, name);
                progression++;
                startConvert();
            });
        }
    }
    generalImage.onerror = function (e) {
        // Probably unsupported image, try with the next one
        progression++;
        console.error(e);
        startConvert();
    }
    generalImage.src = imgLoad;
}
let linkStore = [[], []]; // [[File URL], [File Name]]
function dataDownload(blob, name) {
    let url = window.URL.createObjectURL(blob);
    console.warn(url);
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    let optionRecover = document.createElement("option");
    optionRecover.textContent = name;
    optionRecover.value = linkStore[0].length;
    linkStore[0].push(url);
    linkStore[1].push(name);
    document.getElementById("itemSelect").append(optionRecover);
    document.getElementById("noOption").disabled = true;
}
document.getElementById("itemSelect").addEventListener("input", () => {
    if (document.getElementById("itemSelect").value === "no") return;
    document.getElementById("linkId").textContent = "Download file";
    document.getElementById("linkId").download = linkStore[1][parseInt(document.getElementById("itemSelect").value)];
    document.getElementById("linkId").href = linkStore[0][parseInt(document.getElementById("itemSelect").value)];
})
window.onresize = function (e) {
    if (window.innerWidth < 720) document.getElementById("hereLarge").append(document.getElementById("movableDiv")); else document.getElementById("hereSmall").append(document.getElementById("movableDiv"));
}
document.getElementById("quality").addEventListener("input", function () {
    document.getElementById("qualityPercentage").textContent = Math.round(document.getElementById("quality").value * 100);
}, false)
document.getElementById("fileOpen").addEventListener("change", function () {
    document.getElementById("progresslabel").style.display = "inline";
    document.getElementById("progressfinish").style.display = "none";
    if (document.getElementById("fileOpen").files) {
        document.getElementById("total").textContent = document.getElementById("fileOpen").files.length;
        document.getElementById("progressbar").max = document.getElementById("fileOpen").files.length;
        let itemReadProgression = 0;
        function loadItems() {
            let item = document.getElementById("fileOpen").files[itemReadProgression];
            let fileRead = new FileReader();
            fileRead.onload = function () {
                if (item.type.indexOf("image/") == -1) {
                    document.getElementById("total").textContent = parseInt(document.getElementById("total").textContent) - 1;
                    document.getElementById("progressbar").max = parseInt(document.getElementById("total").textContent) - 1;
                } else {
                    imgDataConvert.push(fileRead.result);
                    finalExtension.push(item.name.substring(item.name.lastIndexOf(".") + 1));
                    fileNameData.push(`${item.name.substring(0, item.name.lastIndexOf("."))}.${document.getElementById("select").value}`);
                }
                itemReadProgression++;
                if (document.getElementById("fileOpen").files.length > itemReadProgression) loadItems(); else startConvert();
            }
            fileRead.readAsDataURL(item);
        }
        loadItems();
    }
}, false);
function getFiles() {
    document.getElementById("fileOpen").click();
}
async function getClipboard() {
    document.getElementById("progresslabel").style.display = "inline";
    document.getElementById("progressfinish").style.display = "none";
    let clipboardAsk = await navigator.permissions.query({
        name: "clipboard-read",
    });
    if (clipboardAsk.state === "denied") {
        alert("Without reading the image from the clipboard, it's impossible to transcode the image.");
        return;
    }
    let clipboard = await navigator.clipboard.read();
    document.getElementById("total").textContent = clipboard.length;
    document.getElementById("progressbar").max = clipboard.length;
    for (let item of clipboard) {
        if (item.types[0].indexOf("image/") == -1) {
            document.getElementById("total").textContent = parseInt(document.getElementById("total").textContent) - 1;
            document.getElementById("progressbar").max = parseInt(document.getElementById("total").textContent) - 1;
            continue;
        }
        let blob = await item.getType(item.types[0]);
        imgDataConvert.push(URL.createObjectURL(blob));
        fileNameData.push(`clipboard.${document.getElementById("select").value}`);
    }
    startConvert();
}
document.getElementById("resizePercentage").addEventListener("change", function () {
    let resizeItem = ["pixelNumber", "percentageDiv"];
    if (document.getElementById("resizePercentage").value == "percentage") resizeItem = [resizeItem[1], resizeItem[0]];
    document.getElementById(resizeItem[0]).style.display = "inline";
    document.getElementById(resizeItem[1]).style.display = "none";
}, false);
document.getElementById("resizeRange").oninput = function () {
    document.getElementById("percentageResizeText").textContent = Math.round(document.getElementById("resizeRange").value * 100);
}
document.getElementById("select").addEventListener("change", function () {
    if (document.getElementById("select").value == "png") document.getElementById("outputQualityDiv").style.display = "none"; else document.getElementById("outputQualityDiv").style.display = "inline";
}, false);
if (window.location.href.indexOf("fromedgeimg") !== -1) {
    document.getElementById("goBack").style.display = "inline";
    document.getElementById("introduction").style.display = "none";
    document.getElementById("goBack").onclick = function () {
        window.history.back();
    }
}
let localItems = document.querySelectorAll(["[data-storage]"]);
for (let i = 0; i < localItems.length; i++) {
    localItems[i].addEventListener("change", function () {
        let value = "";
        switch (localItems[i].getAttribute("data-value")) {
            case "checkbox":
                value = localItems[i].checked;
                break;
            case "index":
                value = localItems[i].selectedIndex;
                break;
            default:
                value = localItems[i].value;
                break;
        }
        localStorage.setItem(localItems[i].getAttribute("data-storage"), value);
    }, false);
    if (localStorage.getItem(localItems[i].getAttribute("data-storage")) !== null) {
        switch (localItems[i].getAttribute("data-value")) {
            case "checkbox":
                localItems[i].checked = localStorage.getItem(localItems[i].getAttribute("data-storage")) === 'true';
                break;
            case "index":
                localItems[i].selectedIndex = parseInt(localStorage.getItem(localItems[i].getAttribute("data-storage")));
                break;
            default:
                localItems[i].value = parseFloat(localStorage.getItem(localItems[i].getAttribute("data-storage")));
                break;
        }
        localItems[i].dispatchEvent(new Event("change"));
    }
}
document.getElementById("qualityPercentage").textContent = Math.round(document.getElementById("quality").value * 100);
if (localStorage.getItem("imageconverter-resizeRange") !== null) document.getElementById("percentageResizeText").textContent = Math.round(parseFloat(localStorage.getItem("imageconverter-resizeRange")) * 100);
if (document.getElementById("clipBtn").style.display !== "none") document.getElementById("addBtn").style.marginRight = "25px";
if (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 && navigator.userAgent.toLowerCase().indexOf("chrome") === -1) document.getElementById("select").removeChild(document.getElementById("webp"));
function dialogManager(id, close) {
    if (close) {
        document.getElementById(id).style.opacity = 0;
        setTimeout(() => {document.getElementById(id).close();}, 400); 
    } else {
        document.getElementById(id).show();
        document.getElementById(id).style.opacity = 1;
    }
}
let defaultThemeList = {
    theme: [{
        text: "#edeeed",
        background: "#151515",
        card: "#292929",
        input: "#474747",
        accent: "#865e5e"
    }, {
        text: "#161616",
        background: "#f5f5f5",
        card: "#d2d2d2",
        input: "#dcdcdc",
        accent: "#58b88d"
    }, {
        text: "#fcf7f2",
        background: "#282a36",
        card: "#44475A",
        input: "#787b90",
        accent: "#5ea8b8"
    }]
}
if (localStorage.getItem("imageconverter-theme") === null) localStorage.setItem("imageconverter-theme", JSON.stringify(defaultThemeList.theme[0]));
function changeTheme() {
    let JSONTheme = JSON.parse(localStorage.getItem("imageconverter-theme"));
    for (let i = 0; i < Object.keys(JSONTheme).length; i++) {
        document.querySelector(`[data-change=${Object.keys(JSONTheme)[i]}]`).value = JSONTheme[Object.keys(JSONTheme)[i]];
        document.querySelector(`[data-change=${Object.keys(JSONTheme)[i]}]`).dispatchEvent(new Event("input", {}))
    }
}
function hexToRgbNew(hex) { // Borrowed from https://stackoverflow.com/a/11508164
    var arrBuff = new ArrayBuffer(4);
    var vw = new DataView(arrBuff);
    vw.setUint32(0, parseInt(hex, 16), false);
    var arrByte = new Uint8Array(arrBuff);
    return arrByte[1] + "," + arrByte[2] + "," + arrByte[3];
}
document.querySelector("[data-change=accent]").addEventListener("input", () => {
    let rgbOption = hexToRgbNew(document.querySelector("[data-change=accent]").value.replace("#", "")).split(",");
    document.getElementById("theme").src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' height='100%' stroke-miterlimit='10' viewBox='0 0 24 24' width='100%' fill-rule='nonzero' stroke-linecap='round' stroke-linejoin='round' xmlns:v='https://vecta.io/nano'><path d='M3.839 5.858c2.941-3.916 9.03-5.055 13.364-2.36 4.28 2.661 5.854 7.777 4.101 12.577-1.655 4.533-6.016 6.328-9.16 4.048-1.177-.854-1.634-1.925-1.854-3.664l-.105-.988-.045-.397c-.123-.934-.311-1.352-.704-1.572-.536-.299-.892-.306-1.595-.033l-.351.146-.179.078c-1.014.44-1.688.595-2.541.416l-.2-.047-.164-.047c-2.789-.864-3.202-4.647-.565-8.158zm.984 6.716l.123.036.134.031c.439.087.814.014 1.437-.242l.602-.257c1.202-.493 1.985-.541 3.045.05.918.511 1.275 1.298 1.458 2.66l.053.459.054.532.047.422c.172 1.361.485 2.09 1.248 2.644 2.275 1.65 5.534.308 6.87-3.349 1.516-4.152.174-8.515-3.484-10.789-3.674-2.284-8.898-1.307-11.372 1.987-2.075 2.762-1.82 5.28-.215 5.816zm11.225-1.994a1.25 1.25 0 0 1 2.415-.647 1.25 1.25 0 0 1-2.415.647zm.495 3.489a1.25 1.25 0 1 1 2.415-.647 1.25 1.25 0 1 1-2.415.647zm-2.473-6.491a1.25 1.25 0 0 1 2.415-.647 1.25 1.25 0 0 1-2.415.647zm-.029 8.998a1.25 1.25 0 1 1 2.415-.647 1.25 1.25 0 1 1-2.415.647zm-3.497-9.97a1.25 1.25 0 1 1 2.415-.647 1.25 1.25 0 1 1-2.415.647z' fill='rgb(${rgbOption[0]},${rgbOption[1]},${rgbOption[2]})'/></svg>`;
    document.getElementById("icon").src = `data:image/svg+xml;utf8,<svg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M3 6.75C3 4.67893 4.67893 3 6.75 3H21.25C23.3211 3 25 4.67893 25 6.75V21.25C25 23.3211 23.3211 25 21.25 25H6.75C4.67893 25 3 23.3211 3 21.25V6.75ZM6.75 4.5C5.50736 4.5 4.5 5.50736 4.5 6.75V21.25C4.5 21.611 4.58501 21.9521 4.73612 22.2545L12.6019 14.5674C13.3791 13.8079 14.6205 13.8079 15.3977 14.5674L23.2638 22.2547C23.4149 21.9523 23.5 21.6111 23.5 21.25V6.75C23.5 5.50736 22.4926 4.5 21.25 4.5H6.75ZM22.1845 23.2974L14.3493 15.6402C14.155 15.4503 13.8446 15.4503 13.6503 15.6402L5.81524 23.2972C6.09993 23.4274 6.41649 23.5 6.75 23.5H21.25C21.5834 23.5 21.8999 23.4275 22.1845 23.2974ZM18.5 11C17.9477 11 17.5 10.5523 17.5 10C17.5 9.44772 17.9477 9 18.5 9C19.0523 9 19.5 9.44772 19.5 10C19.5 10.5523 19.0523 11 18.5 11ZM18.5 12.5C19.8807 12.5 21 11.3807 21 10C21 8.61929 19.8807 7.5 18.5 7.5C17.1193 7.5 16 8.61929 16 10C16 11.3807 17.1193 12.5 18.5 12.5Z' fill='rgb(${rgbOption[0]},${rgbOption[1]},${rgbOption[2]})'/></svg>`
})
for (let item of document.querySelectorAll("[data-change]")) {
    item.addEventListener("input", () => {
        document.documentElement.style.setProperty(`--${item.getAttribute("data-change")}`, item.value);
        let JSONParse = JSON.parse(localStorage.getItem("imageconverter-theme"));
        JSONParse[item.getAttribute("data-change")] = item.value;
        localStorage.setItem("imageconverter-theme", JSON.stringify(JSONParse));
    });
}
changeTheme();
for (let item of document.getElementsByClassName("hoverAnimate")) item.addEventListener("mouseleave", () => {
    item.classList.add("hoverAnimateBack");
    setTimeout(() => {
        item.classList.remove("hoverAnimateBack");
    }, 350);
})
document.getElementById("themeSelect").addEventListener("input", () => {
    localStorage.setItem("imageconverter-theme", JSON.stringify(defaultThemeList.theme[parseInt(document.getElementById("themeSelect").value)]));
    changeTheme();
})
if (window.location.href.indexOf("themeoptions") !== -1) document.getElementById("theme").click();