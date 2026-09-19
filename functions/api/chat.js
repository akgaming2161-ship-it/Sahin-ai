export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const messages = Array.isArray(body?.messages)
      ? body.messages
      : [];

    if (messages.length === 0) {
      return json(
        { error: "No messages provided." },
        400
      );
    }

    // API key must be stored as a Cloudflare secret.
    const apiKey = context.env.OPENAI_API_KEY;

    if (!apiKey) {
      return json(
        { error: "OPENAI_API_KEY is not configured." },
        500
      );
    }

    // Keep only valid chat messages.
    const cleanMessages = messages
      .slice(-20)
      .map((message) => {
        const role =
          message?.role === "assistant"
            ? "assistant"
            : "user";

        return {
          role,
          content: String(message?.content ?? "")
        };
      })
      .filter(
        (message) =>
          message.content.trim().length > 0
      );

    if (cleanMessages.length === 0) {
      return json(
        { error: "No valid messages provided." },
        400
      );
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: cleanMessages,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return json(
        {
          error:
            data?.error?.message ||
            "OpenAI request failed."
        },
        response.status
      );
    }

    const text =
      data?.choices?.[0]?.message?.content;

    if (!text) {
      return json(
        { error: "No AI response received." },
        502
      );
    }

    return json({
      text: text
    });

  } catch (error) {

    console.error("Sahin AI API error:", error);

    return json(
      {
        error:
          error?.message ||
          "Server error."
      },
      500
    );
  }
}


/* =========================
   JSON RESPONSE
========================= */

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}
