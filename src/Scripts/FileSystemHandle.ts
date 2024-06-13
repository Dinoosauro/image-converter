interface DirectoryPicker {
    id?: string,
    mode?: string
}
interface SaveFilePicker extends BaseFilePicker {
    id?: string,
}
interface BaseFilePicker {
    suggestedName?: string,
    types?: {
        description: string,
        accept: {}
    }[]
}

declare global {
    interface Window {
        showDirectoryPicker: ({ id, mode }: DirectoryPicker) => Promise<FileSystemDirectoryHandle>,
        showSaveFilePicker: ({ id, suggestedName, types }: SaveFilePicker) => Promise<FileSystemFileHandle>
    }
}
export default {
    /**
     * Asks the user to pick a directory, where the files will be written
     * @returns A FileSystemDirectoryHandle
     */
    getDirectoryHandle: async () => {
        return await window.showDirectoryPicker({ id: "ImageConverter-Picker", mode: "readwrite" });
    },
    /**
     * Asks the user to save the content in a specific place (the `Save file picker`)
     * @param type the suggested name and the type of the file to write
     * @returns a FileSystemFileHandle
     */
    getFileHandle: async (type: BaseFilePicker) => {
        return await window.showSaveFilePicker({ id: "ImageConverter-Picker", ...type });
    },
    /**
     * Write a file using the File System API
     * @param name the name of the output file. If a FileSystemDirectoryHandle is later provided, slashes will be used to navigate into the folder structure
     * @param blob the blob to write to the disk
     * @param handle the FileSystemDirectoryHandle or FileSystemFileHandle to write
     */
    writeFile: async ({ name, blob, handle }: { name: string, blob: Blob, handle: FileSystemDirectoryHandle | FileSystemFileHandle }) => {
        if (handle instanceof FileSystemDirectoryHandle) {
            const nameSplit = name.split("/");
            const fileName = nameSplit.pop();
            if (!fileName) return;
            for (let path of nameSplit) handle = await handle.getDirectoryHandle(path, { create: true });
            handle = await handle.getFileHandle(fileName, { create: true });
        }
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    }
}
