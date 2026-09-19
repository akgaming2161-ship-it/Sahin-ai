export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const messages = Array.isArray(body.messages)
      ? body.messages
      : [];

    if (!messages.length) {
      return new Response(
        JSON.stringify({
          error: "No messages provided."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const apiKey = context.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "OPENAI_API_KEY is not configured."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
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

          messages: messages
            .slice(-20)
            .map((message) => ({
              role:
                message.role === "assistant"
                  ? "assistant"
                  : "user",

              content:
                String(message.content || "")
            }))
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error:
            data?.error?.message ||
            "OpenAI request failed."
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const text =
      data?.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({
        text: text
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        error: "Server error."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
