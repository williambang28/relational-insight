import { Engine } from 'json-rules-engine';

// Initialize the rules engine
const engine = new Engine();

function preProcess(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/&nbsp;/g, ' ')
    .replace(/[^a-z0-9 ]/gi, '')
    .split(/\s+/) // split into words
    .filter(Boolean); // remove empty strings
}

function addRule(userInput: string, responseMessage: string) {
  const rule = {
    conditions: {
      any: [
        {
          fact: 'userMessage',
          operator: 'in',
          value: userInput.toLowerCase(),
        },
      ],
    },
    event: {
      type: 'response',
      params: {
        message: responseMessage,
      },
    },
  };

  engine.addRule(rule);
}

const rules = [
  {
    keywords: ['hello', 'hi', 'hey'],
    response: 'Hi there! How can I assist you today?',
    priority: 2,
  },
  {
    keywords: ['bye', 'goodbye', 'see you'],
    response: 'Goodbye! Have a great day!',
    priority: 2,
  },
  {
    keywords: ['thanks', 'thank you'],
    response: 'You’re welcome! Let me know if you need anything else.',
    priority: 1,
  },
];

function getBestResponses(words: string[]): string[] {
  const matched = rules
    .map(rule => {
      const matched = rule.keywords.some(word => words.includes(word));
      return matched ? { response: rule.response, priority: rule.priority } : null;
    })
    .filter(Boolean) as { response: string, priority: number }[];

  if (matched.length === 0) return [];

  const highestPriority = Math.min(...matched.map(m => m.priority));
  return matched
    .filter(m => m.priority === highestPriority)
    .map(m => m.response);
}


export async function POST(request: Request) {
  try {

    const { messages }: { messages: Array<{ content: string }> } = await request.json();

    const userMessage = preProcess(messages?.[0]?.content || '');
    console.log(userMessage);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const matchedResponses = getBestResponses(userMessage);

    // Define facts based on user message
    const facts = { userMessage };

    if (matchedResponses.length > 0) {
      return new Response(JSON.stringify({ message: matchedResponses.join(' ') }), {
        status: 200,
      });
    }

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