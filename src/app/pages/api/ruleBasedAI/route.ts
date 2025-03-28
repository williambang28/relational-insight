import { Engine } from 'json-rules-engine';

// Initialize the rules engine
const engine = new Engine();

// Define a sample rule for greeting
const rule = {
  conditions: {
    any: [
      {
        fact: 'userMessage',
        operator: 'equal',
        value: 'greet',
      },
    ],
  },
  event: {
    type: 'greeting-response',
    params: {
      message: 'Hello! How can I assist you today?',
    },
  },
};

// Add the rule to the engine
engine.addRule(rule);

export async function POST(request: Request) {
  try {

    const { messages }: { messages: Array<{ content: string }> } = await request.json();

    const userMessage = messages?.[0]?.content;

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // Define facts based on user message
    const facts = { userMessage };

    // Run the rules engine
    const results = await engine.run(facts);
    const output = results.events
      .map((event) => event.params?.message) // Safely access params and message
      .filter((message) => message !== undefined); // Filter out undefined messages

    console.log('Rules engine results:', output);

    // Return the response (you can adjust this as per your needs)
    return new Response(JSON.stringify({ message: output[0] || "Sorry, I didn't understand that." }), { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', { status: 500 });
  }
}