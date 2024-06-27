
const kv = await Deno.openKv();
kv.listenQueue(async (value: string) => { // Time to delete the content
    const list = (await kv.get(["availableImages", value])).value as number ?? 0; // The maximum "position" number
    for (let i = 1; i < list + 1; i++) { // Items start to 1
        const getBuffersAvailable = (await kv.get(["availableImages", value, i.toString()])).value as number ?? 0; // Get the number of divided buffers
        for (let x = 0; x < getBuffersAvailable; x++) await kv.delete(["availableImages", value, i.toString(), x]); // Iterate on each buffer to delete them
        await kv.delete(["availableImages", value, i.toString()]);
    }
    await kv.delete(["availableImages", value]);
    await kv.delete(["availableIds", value]);
})
interface AutoResponse {
    body?: BodyInit,
    status?: number,
    type?: string
}
interface PostRequest {
    id: string,
    code: string,
    description: string,
    title: string,
    thumbnail: number
}
/**
 * Make a Response with CORS configured
 * @param body the body of the request
 * @param status the status of the response
 * @param type the "Content-Type" added in the header
 * @returns a Response to return to the request
 */
function autoResponse({ body, status, type }: AutoResponse) {
    return new Response(body, {
        status: status,
        headers: {
            "Content-Type": type ?? "text/plain",
            "Access-Control-Allow-Origin": Deno.env.get("sourceUrl") ?? "http://localhost:5173", // TODO: Change it with only the production website!
            "Access-Control-Allow-Methods": "GET, POST",
            "Access-Control-Allow-Headers": "Authorization",

        }
    });
}
/**
 * Divide an ArrayBuffer in an array of ArrayBuffers of a smaller length, so that they can be stored on Deno KV
 * @param buffer the buffer to divide
 * @param chunkSize the size of the chunk
 * @returns an ArrayBuffer[], of a fixed length
 */
function chunkArrayBuffer(buffer: ArrayBuffer, chunkSize: number) {
    const chunked = [];
    let offset = 0;
    while (offset < buffer.byteLength) {
        const size = Math.min(chunkSize, buffer.byteLength - offset);
        const chunk = buffer.slice(offset, offset + size);
        chunked.push(chunk);
        offset += size;
    }
    return chunked;
}
/**
 * Join multiple ArrayBuffers in a single one
 * @param buffers the Buffers to join
 * @returns the joined ArrayBuffer
 */
function joinArrayBuffers(buffers: ArrayBuffer[]) {
    const size = buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
    const finalBuffer = new ArrayBuffer(size);
    const array = new Uint8Array(finalBuffer);
    let offset = 0;
    for (const buffer of buffers) {
        array.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }
    return finalBuffer;
}

Deno.serve(async (req) => {
    if (req.method.toLowerCase() === "options") return autoResponse({ body: "", status: 204 }); // Request sent by the browser for CORS. There's no need to continue.
    let url = req.url.substring(req.url.lastIndexOf("/") + 1);
    if (url.indexOf("?") !== -1) url = url.substring(0, url.indexOf("?"));
    switch (url) {
        case "getId": { // Get a random ID that'll be used for identifying the uploaded images
            const ids = crypto.randomUUID();
            await kv.set(["availableIds", ids], Date.now());
            kv.enqueue(ids, { delay: 600000 }); // Delete everything after 10 minutes
            return autoResponse({ status: 200, body: JSON.stringify({ id: ids }) });
        }
        case "upload": { // Upload image to the server
            if (req.method !== "POST") return autoResponse({ body: "Endpoint available only with POST request.", status: 405 });
            const params = new URLSearchParams(req.url.substring(req.url.indexOf("?") + 1));
            const getPosition = params.get("position");
            const getId = params.get("id");
            if (getPosition && getId && !isNaN(+getPosition) && +getPosition > 0 && getPosition.indexOf(".") === -1) { // getPosition must be a positive integer, since this is the way we'll keep track of images
                if (!(await kv.get(["availableIds", getId])).value) return autoResponse({ body: "Request expired.", status: 403 });
                const previousPosition = (await kv.get(["availableImages", getId])).value as number ?? 0;
                const buffer = chunkArrayBuffer(await new Response(req.body).arrayBuffer(), 50 * 1024); // Divide the buffers with a maximum size of 50kb so that they can be stored in Deno KV.
                await kv.set(["availableImages", getId, getPosition], buffer.length);
                for (let i = 0; i < buffer.length; i++) await kv.set(["availableImages", getId, getPosition, i], buffer[i]);
                await kv.set(["availableImages", getId], Math.max(previousPosition, +getPosition));
                return autoResponse({ body: "OK", status: 200 });
            }
            return autoResponse({ body: "Missing fields", status: 400 })
        }
        case "fetch": { // Get the image content
            const params = new URLSearchParams(req.url.substring(req.url.indexOf("?") + 1));
            const getPosition = params.get("position");
            const getId = params.get("id");
            if (getPosition && getId) {
                const generalInfo = await kv.get(["availableImages", getId, getPosition]);
                if (typeof generalInfo.value === "number") { // There are some ArrayBuffers of the image
                    const mergedArr: ArrayBuffer[] = [];
                    for (let i = 0; i < generalInfo.value; i++) { // Get each ArrayBuffer and merge them
                        const output = await kv.get(["availableImages", getId, getPosition, i]);
                        output.value instanceof ArrayBuffer && mergedArr.push(output.value);
                    }
                    const outputBuffer = joinArrayBuffers(mergedArr);
                    return autoResponse({ body: outputBuffer as ArrayBuffer, status: 200 });
                } else return autoResponse({ body: "Not found", status: 404 });
            } else return autoResponse({ body: "Missing fields", status: 400 });
        }
        case "auth": { // Start the authentication process using OAuth
            const state = new URLSearchParams(req.url.substring(req.url.indexOf("?") + 1)).get("state");
            if (!state) return autoResponse({ body: "Missing fields", status: 40 })
            return autoResponse({ body: `<!DOCTYPE html><body><script>window.location.href = "https://www.tiktok.com/v2/auth/authorize?client_key=${Deno.env.get("clientKey")}&redirect_uri=${encodeURIComponent(Deno.env.get("oauthLocation"))}&state=${encodeURIComponent(state)}&response_type=code&scope=${encodeURIComponent("video.publish,video.upload,user.info.basic,user.info.basic")}"</script></body>`, type: "text/html" })
        }
        case "post": { // Send the request to post the content to TikTok servers
            if (req.method !== "POST") return autoResponse({ body: "Endpoint available only with POST request.", status: 405 });
            const json = await new Response(req.body).json() as PostRequest;
            if (typeof json.description === "string" && typeof json.code === "string" && typeof json.id === "string" && typeof json.title === "string" && typeof json.thumbnail === "number") {
                const tokenRequest = await fetch(`https://open.tiktokapis.com/v2/oauth/token/`, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    body: `client_key=${Deno.env.get("clientKey")}&client_secret=${Deno.env.get("clientSecret")}&code=${json.code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(Deno.env.get("oauthLocation"))}`
                });
                const tokenJson = await tokenRequest.json();
                if (tokenRequest.status === 200) {
                    const buildImageUrl = (await kv.get(["availableImages", json.id])).value;
                    if (!buildImageUrl) return autoResponse({ body: "Non-existent ID", status: 401 });
                    const finalBuild = Math.min(buildImageUrl as number, 35);
                    const finalArr = [];
                    for (let i = 1; i < finalBuild + 1; i++) finalArr.push(`${Deno.env.get("denoUrl")}/fetch?id=${json.id}&position=${i}`);
                    const imageRequest = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
                        headers: {
                            Authorization: `Bearer ${tokenJson.access_token}`,
                            "Content-Type": `application/json; charset=UTF-8`
                        },
                        method: "POST",
                        body: JSON.stringify({
                            media_type: "PHOTO",
                            post_mode: "DIRECT_POST",
                            post_info: {
                                title: json.title,
                                description: json.description,
                                privacy_level: "SELF_ONLY",
                            },
                            source_info: {
                                source: "PULL_FROM_URL",
                                photo_images: finalArr,
                                photo_cover_index: json.thumbnail
                            }
                        })
                    })
                    if (imageRequest.status === 200) return autoResponse({ body: "", status: 200 }); else return autoResponse({ body: "Error while uploading images", status: 500 });
                };
                return autoResponse({ body: "Error while fetching token", status: 500 });
            } else return autoResponse({ body: "Missing fields" })
        }
        case Deno.env.get("tiktokVerificationFileName"): { // The file that TikTok requires to keep in the server to verify ownership
            return autoResponse({ body: Deno.env.get("tiktokVerificationFileContent") });
        }
    }
    return autoResponse({ body: "Not found", status: 400 })
})
