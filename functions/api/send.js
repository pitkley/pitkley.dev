export async function onRequest(context) {
    const originalRequest = context.request;
    const updatedRequest = new Request("https://umami.pitkley.dev/api/send", originalRequest);
    const response = await fetch(updatedRequest);
    return response;
}
