export async function onRequest(context) {
    const originalRequest = context.request;
    const updatedRequest = new Request("https://umami.pitkley.dev/script.js", originalRequest);
    const response = await fetch(updatedRequest);
    return response;
}
