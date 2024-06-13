interface Props {
    type: string,
    name: string
}
/**
 * 
 * @param item The object that contains the file mimetype (`type`) and its name (`name`).
 * @returns A boolean, true if the file isn't supported
 */
export default function CheckSupportedFile(item: Props) {
    // Note that `item` isn't split since this was originally done by getting properties from the `File` object, and was later divided in a new TypeScript file.
    return (!item.type.startsWith("image") && item.type !== "application/pdf" && !item.name.endsWith(".heic") && !item.name.endsWith(".heif")) || item.type === "image/svg+xml";
}