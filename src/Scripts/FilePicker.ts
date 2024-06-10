import FileArrayHandler from "./FileArrayHandler";

const file = document.createElement("input");
file.type = "file";
file.multiple = true;
file.onchange = async () => {
    file.files !== null && await FileArrayHandler(file.files);
};
export default file;