/**
 * Creates a new spinner at the center of the page
 * @returns The spinner HTMLElement
 */
export default function createSpinner() {
    let spinner = document.createElement("div");
    spinner.classList.add("spinner", "fullSpinner");
    document.body.append(spinner);
    return spinner;
}
