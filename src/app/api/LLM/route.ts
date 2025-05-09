import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages }: { messages: Array<{ content: string }> } = await request.json();
    const userMessage = messages?.[0]?.content;

    if (!userMessage) {
      return new Response("No user message found", { status: 400 });
    }

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4.1", // or "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content: "",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
    });

    const reply = chatResponse.choices[0]?.message?.content || "I'm not sure how to respond to that.";

    return new Response(JSON.stringify({ message: reply }), {
      status: 200,
    });
  } catch (error) {
    console.error("LLM API Error:", error);
    return new Response("An error occurred while processing the request", {
      status: 500,
    });
  }
}
