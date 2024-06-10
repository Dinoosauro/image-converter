export default function createSpinner() {
    let spinner = document.createElement("div");
    spinner.classList.add("spinner", "fullSpinner");
    document.body.append(spinner);
    return spinner;
}
