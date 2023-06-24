let fileNameData = [];
let imgDataConvert = [];
let progression = 0;
let localZip = [false, undefined];
let isDark = true;
function startConvert() {
    if (progression < imgDataConvert.length) {
        createImg(imgDataConvert[progression], fileNameData[progression]);
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

document.getElementById("zip").addEventListener("change", function() {
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
document.getElementById("autozip").addEventListener("change", function() {
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
    generalImage.onerror = function() {
        // Probably unsupported image, try with the next one
        progression++;
        startConvert();
    }
    generalImage.src = imgLoad;
}
function dataDownload(blob, name) {
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
}
window.onresize = function(e) {
    if (window.innerWidth < 720) document.getElementById("hereLarge").append(document.getElementById("movableDiv")); else document.getElementById("hereSmall").append(document.getElementById("movableDiv"));
}
document.getElementById("quality").addEventListener("input", function() {
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
                    document.getElementById("progressbar").max = parseInt(doucment.getElementById("total").textContent) - 1;
                } else {
                imgDataConvert.push(fileRead.result);
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
document.getElementById("resizePercentage").addEventListener("change", function() {
    let resizeItem = ["pixelNumber", "percentageDiv"];
    if (document.getElementById("resizePercentage").value == "percentage") resizeItem = [resizeItem[1], resizeItem[0]];
    document.getElementById(resizeItem[0]).style.display = "inline";
    document.getElementById(resizeItem[1]).style.display = "none";
}, false);
document.getElementById("resizeRange").oninput = function() {
    document.getElementById("percentageResizeText").textContent = Math.round(document.getElementById("resizeRange").value * 100);
}
document.getElementById("select").addEventListener("change", function() {
    if (document.getElementById("select").value == "png") document.getElementById("outputQualityDiv").style.display = "none"; else document.getElementById("outputQualityDiv").style.display = "inline";
}, false);
if (window.location.href.indexOf("fromedgeimg") !== -1) {
    document.getElementById("goBack").style.display = "inline";
    document.getElementById("introduction").style.display = "none";
    document.getElementById("goBack").onclick = function() {
        window.history.back();
    }
} 
let localItems = document.querySelectorAll(["[data-storage]"]); 
for (let i = 0; i < localItems.length; i++) {    
    localItems[i].addEventListener("change", function() {
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
if (localStorage.getItem("resizeRange") !== null) document.getElementById("percentageResizeText").textContent = Math.round(parseFloat(localStorage.getItem("resizeRange")) * 100);
if (document.getElementById("clipBtn").style.display !== "none") document.getElementById("addBtn").style.marginRight = "25px";
if (navigator.userAgent.toLowerCase().indexOf("safari") !== -1 && navigator.userAgent.toLowerCase().indexOf("chrome") === -1) document.getElementById("select").removeChild(document.getElementById("webp"));
function dialogManager(id, close) {
    if (close) document.getElementById(id).close(); else document.getElementById(id).show();
}
let lightContainer = [["body", "input", "input[type=range]", "select", "button", ".accent", "dialog", ".insideContainer"], ["lightbody", "inputlight", "inputrangelight", "lightselect", "lightbtn", "lightaccent", "lightdialog", "lightinside"]];
let imgBase64 = ["data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTM3LjkwMjYgMzMuMDA5M0MzMi45MzIgNDEuNjE4NSAyMS45MjM0IDQ0LjU2ODMgMTMuMzE0MSAzOS41OTc3QzEwLjk2OTYgMzguMjQ0MSA4Ljk5NTg3IDM2LjQxMjkgNy40OTI2IDM0LjIzQzYuOTkgMzMuNTAwMSA3LjMxNTExIDMyLjQ5MjIgOC4xNDk0NCAzMi4xOTM2QzE0LjkyOTggMjkuNzY2OCAxOC41NjEyIDI2Ljk1NDYgMjAuNjY4NSAyMi45MzJDMjIuODg3IDE4LjY5NzMgMjMuNDYwMyAxNC4wNTg2IDIxLjkwODMgNy43MDAxOUMyMS42OTM3IDYuODIwOTYgMjIuMzg4MiA1Ljk4MzggMjMuMjkyIDYuMDMyMjhDMjYuMDk0MSA2LjE4MjYyIDI4LjgzMTYgNi45ODc1MyAzMS4zMTQxIDguNDIwODJDMzkuOTIzNCAxMy4zOTE0IDQyLjg3MzEgMjQuNCAzNy45MDI2IDMzLjAwOTNaTTIyLjg4MyAyNC4wOTIyQzIwLjU3OTggMjguNDg4OCAxNi43NzA4IDMxLjUyMyAxMC40NTY2IDMzLjk5ODlDMTEuNjA3MyAzNS4zNjUgMTIuOTkxMSAzNi41MjQ1IDE0LjU2NDEgMzcuNDMyN0MyMS45Nzc3IDQxLjcxMjkgMzEuNDU3MyAzOS4xNzI4IDM1LjczNzUgMzEuNzU5M0M0MC4wMTc3IDI0LjM0NTcgMzcuNDc3NiAxNC44NjYxIDMwLjA2NDEgMTAuNTg1OUMyOC41MjY3IDkuNjk4MjUgMjYuODcxOSA5LjA4NzM4IDI1LjE1NzUgOC43Njc1OUwyNC42ODg1IDguNjg3NkMyNS44ODE4IDE0LjY1NTMgMjUuMjggMTkuNTE2NyAyMi44ODMgMjQuMDkyMloiIGZpbGw9IiNkZGRkZGQiLz4KPC9zdmc+", "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjk5OSA0LjAwMDk4QzI0LjY4OTMgNC4wMDA5OCAyNS4yNDkgNC41NjA2MiAyNS4yNDkgNS4yNTA5OFY3Ljc1MDk4QzI1LjI0OSA4LjQ0MTMzIDI0LjY4OTMgOS4wMDA5OCAyMy45OTkgOS4wMDA5OEMyMy4zMDg2IDkuMDAwOTggMjIuNzQ5IDguNDQxMzMgMjIuNzQ5IDcuNzUwOThWNS4yNTA5OEMyMi43NDkgNC41NjA2MiAyMy4zMDg2IDQuMDAwOTggMjMuOTk5IDQuMDAwOThaTTI0LjA0NjYgMzQuMDIxOEMyOS41NTU4IDM0LjAyMTggMzQuMDIxOSAyOS41NTU3IDM0LjAyMTkgMjQuMDQ2NUMzNC4wMjE5IDE4LjUzNzMgMjkuNTU1OCAxNC4wNzEyIDI0LjA0NjYgMTQuMDcxMkMxOC41MzczIDE0LjA3MTIgMTQuMDcxMiAxOC41MzczIDE0LjA3MTIgMjQuMDQ2NUMxNC4wNzEyIDI5LjU1NTcgMTguNTM3MyAzNC4wMjE4IDI0LjA0NjYgMzQuMDIxOFpNMjQuMDQ2NiAzMS41MjE4QzE5LjkxODEgMzEuNTIxOCAxNi41NzEyIDI4LjE3NSAxNi41NzEyIDI0LjA0NjVDMTYuNTcxMiAxOS45MTggMTkuOTE4MSAxNi41NzEyIDI0LjA0NjYgMTYuNTcxMkMyOC4xNzUxIDE2LjU3MTIgMzEuNTIxOSAxOS45MTggMzEuNTIxOSAyNC4wNDY1QzMxLjUyMTkgMjguMTc1IDI4LjE3NTEgMzEuNTIxOCAyNC4wNDY2IDMxLjUyMThaTTQyLjc1IDI1LjI1MDJDNDMuNDQwMyAyNS4yNTAyIDQ0IDI0LjY5MDYgNDQgMjQuMDAwMkM0NCAyMy4zMDk5IDQzLjQ0MDMgMjIuNzUwMiA0Mi43NSAyMi43NTAySDQwLjI1QzM5LjU1OTYgMjIuNzUwMiAzOSAyMy4zMDk5IDM5IDI0LjAwMDJDMzkgMjQuNjkwNiAzOS41NTk2IDI1LjI1MDIgNDAuMjUgMjUuMjUwMkg0Mi43NVpNMjMuOTk5IDM5LjAwMDVDMjQuNjg5MyAzOS4wMDA1IDI1LjI0OSAzOS41NjAyIDI1LjI0OSA0MC4yNTA1VjQyLjc1MDJDMjUuMjQ5IDQzLjQ0MDYgMjQuNjg5MyA0NC4wMDAyIDIzLjk5OSA0NC4wMDAyQzIzLjMwODYgNDQuMDAwMiAyMi43NDkgNDMuNDQwNiAyMi43NDkgNDIuNzUwMlY0MC4yNTA1QzIyLjc0OSAzOS41NjAyIDIzLjMwODYgMzkuMDAwNSAyMy45OTkgMzkuMDAwNVpNNy43NDk5NSAyNS4yNTAyQzguNDQwMyAyNS4yNTAyIDguOTk5OTUgMjQuNjkwNiA4Ljk5OTk1IDI0LjAwMDJDOC45OTk5NSAyMy4zMDk5IDguNDQwMyAyMi43NTAyIDcuNzQ5OTUgMjIuNzUwMkg1LjI0OTUxQzQuNTU5MTYgMjIuNzUwMiAzLjk5OTUxIDIzLjMwOTkgMy45OTk1MSAyNC4wMDAyQzMuOTk5NTEgMjQuNjkwNiA0LjU1OTE2IDI1LjI1MDIgNS4yNDk1MSAyNS4yNTAySDcuNzQ5OTVaTTkuMzY2MDcgOS4zNjY0N0M5Ljg1NDIyIDguODc4MzIgMTAuNjQ1NyA4Ljg3ODMyIDExLjEzMzggOS4zNjY0N0wxMy42MzM4IDExLjg2NjVDMTQuMTIyIDEyLjM1NDYgMTQuMTIyIDEzLjE0NjEgMTMuNjMzOCAxMy42MzQyQzEzLjE0NTcgMTQuMTIyNCAxMi4zNTQyIDE0LjEyMjQgMTEuODY2MSAxMy42MzQyTDkuMzY2MDcgMTEuMTM0MkM4Ljg3NzkxIDEwLjY0NjEgOC44Nzc5MSA5Ljg1NDYzIDkuMzY2MDcgOS4zNjY0N1pNMTEuMTMzOCAzOC42MzQ3QzEwLjY0NTcgMzkuMTIyOSA5Ljg1NDIyIDM5LjEyMjkgOS4zNjYwNyAzOC42MzQ3QzguODc3OTEgMzguMTQ2NiA4Ljg3NzkxIDM3LjM1NTEgOS4zNjYwNyAzNi44NjdMMTEuODY2MSAzNC4zNjdDMTIuMzU0MiAzMy44Nzg4IDEzLjE0NTcgMzMuODc4OCAxMy42MzM4IDM0LjM2N0MxNC4xMjIgMzQuODU1MSAxNC4xMjIgMzUuNjQ2NiAxMy42MzM4IDM2LjEzNDdMMTEuMTMzOCAzOC42MzQ3Wk0zOC42MzQ4IDkuMzY2NDdDMzguMTQ2NyA4Ljg3ODMyIDM3LjM1NTIgOC44NzgzMiAzNi44NjcgOS4zNjY0N0wzNC4zNjcgMTEuODY2NUMzMy44Nzg5IDEyLjM1NDYgMzMuODc4OSAxMy4xNDYxIDM0LjM2NyAxMy42MzQyQzM0Ljg1NTIgMTQuMTIyNCAzNS42NDY3IDE0LjEyMjQgMzYuMTM0OCAxMy42MzQyTDM4LjYzNDggMTEuMTM0MkMzOS4xMjMgMTAuNjQ2MSAzOS4xMjMgOS44NTQ2MyAzOC42MzQ4IDkuMzY2NDdaTTM2Ljg2NyAzOC42MzQ3QzM3LjM1NTIgMzkuMTIyOSAzOC4xNDY3IDM5LjEyMjkgMzguNjM0OCAzOC42MzQ3QzM5LjEyMyAzOC4xNDY2IDM5LjEyMyAzNy4zNTUxIDM4LjYzNDggMzYuODY3TDM2LjEzNDggMzQuMzY3QzM1LjY0NjcgMzMuODc4OCAzNC44NTUyIDMzLjg3ODggMzQuMzY3IDM0LjM2N0MzMy44Nzg5IDM0Ljg1NTEgMzMuODc4OSAzNS42NDY2IDM0LjM2NyAzNi4xMzQ3TDM2Ljg2NyAzOC42MzQ3WiIgZmlsbD0iIzE2MTYxNiIvPgo8L3N2Zz4K"];
function lightSwitch(badDecision) {
        for (let i = 0; i < lightContainer[0].length; i++) {
            let documentFetch = document.querySelectorAll(lightContainer[0][i]);
            console.log(documentFetch);
            for (let x = 0; x < documentFetch.length; x++) {
                if (badDecision) documentFetch[x].classList.add(lightContainer[1][i]); else documentFetch[x].classList.remove(lightContainer[1][i]);
            }
        }
        isDark = !badDecision;
        document.getElementById("theme").src = imgBase64[badDecision == true ? 1 : 0];
        localStorage.setItem("theme", isDark);
}
document.getElementById("theme").onclick = function() {
    lightSwitch(isDark);
}
if (localStorage.getItem("theme") !== null) lightSwitch(localStorage.getItem("theme") === 'false'); else lightSwitch(false);