import { onRequestPost } from "../functions/api/chat.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return onRequestPost({
        request,
        env,
        ctx,
        waitUntil: (promise) => ctx.waitUntil(promise),
      });
    }

    return new Response("Sahin AI is running!", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
      },
    });
  },
};
