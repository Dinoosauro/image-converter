import type { AssetsType } from "./Storage";
/**
 * The Map that ties the image to the asset it refers to. This is done so that the image can be updated when the user changes the accent color value
 */
const imageMap = new Map<HTMLImageElement, AssetsType>([]);
/**
 * Get the SVG path of an icon
 * @param key the asset to fetch
 * @returns the string of the SVG of that image
 */
export function ImageRes(key: AssetsType) {
    const color = getComputedStyle(document.body).getPropertyValue("--accent");
    return {
        settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M12.012 2.25c.734.008 1.465.093 2.182.253a.75.75 0 0 1 .582.649l.17 1.527a1.384 1.384 0 0 0 1.927 1.116l1.4-.615a.75.75 0 0 1 .85.174 9.793 9.793 0 0 1 2.205 3.792.75.75 0 0 1-.272.825l-1.241.916a1.38 1.38 0 0 0 0 2.226l1.243.915a.75.75 0 0 1 .272.826 9.798 9.798 0 0 1-2.204 3.792.75.75 0 0 1-.849.175l-1.406-.617a1.38 1.38 0 0 0-1.926 1.114l-.17 1.526a.75.75 0 0 1-.571.647 9.518 9.518 0 0 1-4.406 0 .75.75 0 0 1-.572-.647l-.169-1.524a1.382 1.382 0 0 0-1.925-1.11l-1.406.616a.75.75 0 0 1-.85-.175 9.798 9.798 0 0 1-2.203-3.796.75.75 0 0 1 .272-.826l1.243-.916a1.38 1.38 0 0 0 0-2.226l-1.243-.914a.75.75 0 0 1-.272-.826 9.793 9.793 0 0 1 2.205-3.792.75.75 0 0 1 .85-.174l1.4.615a1.387 1.387 0 0 0 1.93-1.118l.17-1.526a.75.75 0 0 1 .583-.65c.717-.159 1.449-.243 2.201-.252Zm0 1.5a9.136 9.136 0 0 0-1.354.117l-.11.977A2.886 2.886 0 0 1 6.526 7.17l-.899-.394A8.293 8.293 0 0 0 4.28 9.092l.797.587a2.881 2.881 0 0 1 .001 4.643l-.799.588c.32.842.776 1.626 1.348 2.322l.905-.397a2.882 2.882 0 0 1 4.017 2.318l.109.984c.89.15 1.799.15 2.688 0l.11-.984a2.881 2.881 0 0 1 4.018-2.322l.904.396a8.299 8.299 0 0 0 1.348-2.318l-.798-.588a2.88 2.88 0 0 1-.001-4.643l.797-.587a8.293 8.293 0 0 0-1.348-2.317l-.897.393a2.884 2.884 0 0 1-4.023-2.324l-.109-.976a8.99 8.99 0 0 0-1.334-.117ZM12 8.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 1.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"/></svg>`,
        documentadd: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M18.5 20a.5.5 0 0 1-.5.5h-5.732A6.518 6.518 0 0 1 11.19 22H18a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414l-5.829-5.828a.491.491 0 0 0-.049-.04.63.63 0 0 1-.036-.03 2.072 2.072 0 0 0-.219-.18.652.652 0 0 0-.08-.044l-.048-.024-.05-.029c-.054-.031-.109-.063-.166-.087a1.977 1.977 0 0 0-.624-.138c-.02-.001-.04-.004-.059-.007A.605.605 0 0 0 12.172 2H6a2 2 0 0 0-2 2v7.498a6.451 6.451 0 0 1 1.5-.422V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5v10Zm-5-15.379L17.378 8.5H14a.5.5 0 0 1-.5-.5V4.621ZM12 17.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0ZM7 18l.001 2.503a.5.5 0 1 1-1 0V18H3.496a.5.5 0 0 1 0-1H6v-2.5a.5.5 0 1 1 1 0V17h2.497a.5.5 0 0 1 0 1H7Z"/></svg>`,
        resizeimage: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M11 2.75a.75.75 0 0 0-.75-.75h-5A3.25 3.25 0 0 0 2 5.25v5a.75.75 0 0 0 1.5 0v-5c0-.966.784-1.75 1.75-1.75h5a.75.75 0 0 0 .75-.75ZM13.75 2a.75.75 0 0 0 0 1.5h5c.966 0 1.75.784 1.75 1.75v5a.75.75 0 0 0 1.5 0v-5A3.25 3.25 0 0 0 18.75 2h-5Zm0 20a.75.75 0 0 1 0-1.5h5a1.75 1.75 0 0 0 1.75-1.75v-5a.75.75 0 0 1 1.5 0v5A3.25 3.25 0 0 1 18.75 22h-5ZM4 12a3 3 0 0 0-3 3v5c0 .556.151 1.077.415 1.524L4.91 18.03a2.25 2.25 0 0 1 3.182 0l3.494 3.494c.264-.447.415-.968.415-1.524v-5a3 3 0 0 0-3-3H4Zm0 11a2.985 2.985 0 0 1-1.524-.415L5.97 19.09a.75.75 0 0 1 1.06 0l3.494 3.494A2.986 2.986 0 0 1 9 23H4Zm5-7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>`,
        imagesparkle: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M7.912 6.412a2.837 2.837 0 0 1 1.347-.955l1.378-.448a.544.544 0 0 0 0-1.025l-1.378-.448A2.838 2.838 0 0 1 7.5 1.774l-.011-.034L7.04.363a.544.544 0 0 0-1.027 0L5.567 1.74a2.836 2.836 0 0 1-1.798 1.796l-1.378.448-.028.007a.544.544 0 0 0 0 1.025l1.378.448A2.839 2.839 0 0 1 5.539 7.26l.448 1.377A.547.547 0 0 0 6.5 9a.544.544 0 0 0 .513-.363l.448-1.377c.101-.307.254-.593.45-.848ZM.217 10.213l.766-.248a1.577 1.577 0 0 0 .998-.999l.25-.764a.302.302 0 0 1 .57 0l.248.764a1.575 1.575 0 0 0 .984.999l.765.248a.302.302 0 0 1 0 .57l-.765.249a1.577 1.577 0 0 0-1 1.002l-.248.764a.302.302 0 0 1-.57 0l-.249-.764a1.576 1.576 0 0 0-.999-.999l-.765-.248a.302.302 0 0 1 0-.57l.015-.004ZM12 4.47V4.5h5.75c.966 0 1.75.784 1.75 1.75v11.5c0 .209-.037.409-.104.595l-5.822-5.702-.128-.116a2.25 2.25 0 0 0-3.02.116l-5.823 5.7a1.747 1.747 0 0 1-.103-.593v-5.759l-.12.038a.741.741 0 0 0-.22.14.59.59 0 0 0-.14.23l-.24.76a1.35 1.35 0 0 1-.78.806v3.785A3.25 3.25 0 0 0 6.25 21h11.5A3.25 3.25 0 0 0 21 17.75V6.25A3.25 3.25 0 0 0 17.75 3h-6.797c.306.11.573.308.767.569a1.6 1.6 0 0 1 .28.9Zm.525 9.246L18.33 19.4a1.746 1.746 0 0 1-.581.099H6.25c-.204 0-.4-.035-.582-.099l5.807-5.686.084-.071a.75.75 0 0 1 .966.07Zm4.98-4.963a2.252 2.252 0 1 0-4.505 0 2.252 2.252 0 0 0 4.504 0Zm-3.005 0a.752.752 0 1 1 1.504 0 .752.752 0 0 1-1.504 0Z"/></svg>`,
        image: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M17.75 3A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3h11.5Zm.58 16.401-5.805-5.686a.75.75 0 0 0-.966-.071l-.084.07-5.807 5.687c.182.064.378.099.582.099h11.5c.203 0 .399-.035.58-.099l-5.805-5.686L18.33 19.4ZM17.75 4.5H6.25A1.75 1.75 0 0 0 4.5 6.25v11.5c0 .208.036.408.103.594l5.823-5.701a2.25 2.25 0 0 1 3.02-.116l.128.116 5.822 5.702c.067-.186.104-.386.104-.595V6.25a1.75 1.75 0 0 0-1.75-1.75Zm-2.498 2a2.252 2.252 0 1 1 0 4.504 2.252 2.252 0 0 1 0-4.504Zm0 1.5a.752.752 0 1 0 0 1.504.752.752 0 0 0 0-1.504Z"/></svg>`,
        color: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M3.839 5.858c2.94-3.916 9.03-5.055 13.364-2.36 4.28 2.66 5.854 7.777 4.1 12.577-1.655 4.533-6.016 6.328-9.159 4.048-1.177-.854-1.634-1.925-1.854-3.664l-.106-.987-.045-.398c-.123-.934-.311-1.352-.705-1.572-.535-.298-.892-.305-1.595-.033l-.351.146-.179.078c-1.014.44-1.688.595-2.541.416l-.2-.047-.164-.047c-2.789-.864-3.202-4.647-.565-8.157Zm.984 6.716.123.037.134.03c.439.087.814.015 1.437-.242l.602-.257c1.202-.493 1.985-.54 3.046.05.917.512 1.275 1.298 1.457 2.66l.053.459.055.532.047.422c.172 1.361.485 2.09 1.248 2.644 2.275 1.65 5.534.309 6.87-3.349 1.516-4.152.174-8.514-3.484-10.789-3.675-2.284-8.899-1.306-11.373 1.987-2.075 2.763-1.82 5.28-.215 5.816Zm11.225-1.994a1.25 1.25 0 1 1 2.414-.647 1.25 1.25 0 0 1-2.414.647Zm.494 3.488a1.25 1.25 0 1 1 2.415-.647 1.25 1.25 0 0 1-2.415.647ZM14.07 7.577a1.25 1.25 0 1 1 2.415-.647 1.25 1.25 0 0 1-2.415.647Zm-.028 8.998a1.25 1.25 0 1 1 2.414-.647 1.25 1.25 0 0 1-2.414.647Zm-3.497-9.97a1.25 1.25 0 1 1 2.415-.646 1.25 1.25 0 0 1-2.415.646Z"/></svg>`,
        folder: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M3.5 6.25V8h4.629a.75.75 0 0 0 .53-.22l1.53-1.53-1.53-1.53a.75.75 0 0 0-.53-.22H5.25A1.75 1.75 0 0 0 3.5 6.25Zm-1.5 0A3.25 3.25 0 0 1 5.25 3h2.879a2.25 2.25 0 0 1 1.59.659L11.562 5.5h7.189A3.25 3.25 0 0 1 22 8.75v9A3.25 3.25 0 0 1 18.75 21H5.25A3.25 3.25 0 0 1 2 17.75V6.25ZM3.5 9.5v8.25c0 .966.784 1.75 1.75 1.75h13.5a1.75 1.75 0 0 0 1.75-1.75v-9A1.75 1.75 0 0 0 18.75 7h-7.19L9.72 8.841a2.25 2.25 0 0 1-1.591.659H3.5Z"/></svg>`,
        paragraph: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M16.5 8a4.25 4.25 0 0 0 0 8.5h.5v4.75a.75.75 0 0 0 1.5 0V9.5h1v11.75a.75.75 0 0 0 1.5 0V9.5h.25a.75.75 0 0 0 0-1.5H16.5Zm0 1.5h.5V15h-.5a2.75 2.75 0 1 1 0-5.5ZM2.75 5a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5H2.75Zm0 5a.75.75 0 0 0 0 1.5h8.553c.076-.53.23-1.034.452-1.5H2.75Zm9.277 5H2.75a.75.75 0 0 0 0 1.5h10.667a5.278 5.278 0 0 1-1.39-1.5Z"/></svg>`,
        apps: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="m18.492 2.33 3.179 3.18a2.25 2.25 0 0 1 0 3.182l-2.584 2.584A2.25 2.25 0 0 1 21 13.5v5.25A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25A2.25 2.25 0 0 1 5.25 3h5.25a2.25 2.25 0 0 1 2.225 1.915l2.585-2.585a2.25 2.25 0 0 1 3.182 0ZM4.5 18.75c0 .415.336.75.75.75h5.999l.001-6.75H4.5v6Zm8.249.75h6.001a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75h-6.001v6.75ZM10.5 4.5H5.25a.75.75 0 0 0-.75.75v6h6.75v-6a.75.75 0 0 0-.75-.75Zm2.25 4.81v1.94h1.94l-1.94-1.94Zm3.62-5.918L13.193 6.57a.75.75 0 0 0 0 1.061l3.179 3.179a.75.75 0 0 0 1.06 0l3.18-3.179a.75.75 0 0 0 0-1.06l-3.18-3.18a.75.75 0 0 0-1.06 0Z"/></svg>`,
        imgmultiple: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M13.748 8.996a1.248 1.248 0 1 0 0-2.496 1.248 1.248 0 0 0 0 2.496ZM6.25 3A3.25 3.25 0 0 0 3 6.25v9a3.25 3.25 0 0 0 3.25 3.25h9a3.25 3.25 0 0 0 3.25-3.25v-9A3.25 3.25 0 0 0 15.25 3h-9ZM4.5 6.25c0-.966.784-1.75 1.75-1.75h9c.966 0 1.75.784 1.75 1.75v9c0 .231-.045.452-.126.654l-4.587-4.291a2.25 2.25 0 0 0-3.074 0l-4.587 4.29a1.745 1.745 0 0 1-.126-.653v-9Zm6.762 6.458 4.505 4.214c-.163.05-.337.078-.517.078h-9c-.18 0-.354-.027-.517-.078l4.504-4.214a.75.75 0 0 1 1.025 0ZM8.75 21a3.247 3.247 0 0 1-2.74-1.5h9.74a3.75 3.75 0 0 0 3.75-3.75V6.011a3.248 3.248 0 0 1 1.5 2.74v7C21 18.65 18.65 21 15.75 21h-7Z"/></svg>`,
        shield: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M3 5.75A.75.75 0 0 1 3.75 5c2.663 0 5.258-.943 7.8-2.85a.75.75 0 0 1 .9 0C14.992 4.057 17.587 5 20.25 5a.75.75 0 0 1 .75.75V11c0 5.001-2.958 8.676-8.725 10.948a.75.75 0 0 1-.55 0C5.958 19.676 3 16 3 11V5.75Zm1.5.728V11c0 4.256 2.453 7.379 7.5 9.442 5.047-2.063 7.5-5.186 7.5-9.442V6.478c-2.577-.152-5.08-1.09-7.5-2.8-2.42 1.71-4.923 2.648-7.5 2.8Z"/></svg>`,
        documentpdf: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M7.503 13.002a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 1 0v-.5H8.5a1.5 1.5 0 0 0 0-3h-.997Zm.997 2h-.497v-1H8.5a.5.5 0 1 1 0 1Zm6.498-1.5a.5.5 0 0 1 .5-.5h1.505a.5.5 0 1 1 0 1h-1.006l-.001 1.002h1.007a.5.5 0 0 1 0 1h-1.007l.002.497a.5.5 0 0 1-1 .002l-.003-.998v-.002l.003-2.002Zm-3.498-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h.498a2 2 0 0 0 0-4H11.5Zm.5 3v-2a1 1 0 0 1 0 2ZM20 20v-1.164c.591-.281 1-.884 1-1.582V12.75c0-.698-.409-1.3-1-1.582v-1.34a2 2 0 0 0-.586-1.414l-5.829-5.828a.491.491 0 0 0-.049-.04.63.63 0 0 1-.036-.03 2.072 2.072 0 0 0-.219-.18.652.652 0 0 0-.08-.044l-.048-.024-.05-.029c-.054-.031-.109-.063-.166-.087a1.977 1.977 0 0 0-.624-.138c-.02-.001-.04-.004-.059-.007A.605.605 0 0 0 12.172 2H6a2 2 0 0 0-2 2v7.168c-.591.281-1 .884-1 1.582v4.504c0 .698.409 1.3 1 1.582V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Zm-2 .5H6a.5.5 0 0 1-.5-.5v-.996h13V20a.5.5 0 0 1-.5.5Zm.5-10.5v1h-13V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5Zm-1.122-1.5H14a.5.5 0 0 1-.5-.5V4.621L17.378 8.5Zm-12.628 4h14.5a.25.25 0 0 1 .25.25v4.504a.25.25 0 0 1-.25.25H4.75a.25.25 0 0 1-.25-.25V12.75a.25.25 0 0 1 .25-.25Z"/></svg>`,
        musicnote: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="${color}" d="M11.513 2.048a.75.75 0 0 0-1.013.702v12.127a4 4 0 1 0 1.476 3.56.749.749 0 0 0 .024-.187V8.832l6.987 2.62A.75.75 0 0 0 20 10.75V7.483a3.25 3.25 0 0 0-2.109-3.044l-6.378-2.391Z"/></svg>`
    }[key]
}
/**
 * Link an image to a specific asset, so that it can be re-rendered when the user changes the accent color
 * @param img the Image element that needs to be updated
 * @param str the asset of that image element
 */
export function setAccentImage(img: HTMLImageElement, str: AssetsType) {
    imageMap.set(img, str);
}
/**
 * Re-render all the images with the new accent color
 */
export function updateAccentImage() {
    for (let [img, str] of imageMap) img.src = URL.createObjectURL(new Blob([ImageRes(str)], { type: "image/svg+xml" }))
}