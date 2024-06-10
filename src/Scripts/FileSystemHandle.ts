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
    getDirectoryHandle: async () => {
        return await window.showDirectoryPicker({ id: "ImageConverter-Picker", mode: "readwrite" });
    },
    getFileHandle: async (type: BaseFilePicker) => {
        return await window.showSaveFilePicker({ id: "ImageConverter-Picker", ...type });
    },
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
