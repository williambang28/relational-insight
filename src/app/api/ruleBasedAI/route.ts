import { Engine } from 'json-rules-engine';
import fs from 'fs';
import path from 'path';

// Initialize the rules engine
const engine = new Engine();

function preProcess(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/&nbsp;/g, ' ') // replace HTML non-breaking space
    .replace(/[^a-z0-9 ]/gi, '') // remove any non-alphanumeric characters
    .replace(/\b(don't|dont)\b/g, 'do not') // Replace "don't" or "do not" with "do not"
    .replace(/\b(can't|cant)\b/g, 'cannot') 
    .split(/\s+/) // Split into words
    .filter(Boolean); // Remove empty strings
}

// function addRule(userInput: string, responseMessage: string) {
//   const rule = {
//     conditions: {
//       any: [
//         {
//           fact: 'userMessage',
//           operator: 'in',
//           value: userInput.toLowerCase(),
//         },
//       ],
//     },
//     event: {
//       type: 'response',
//       params: {
//         message: responseMessage,
//       },
//     },
//   };

//   engine.addRule(rule);
// }

function loadRulesFromFile(filePath: string) {
  try {
    const rulesFilePath = path.resolve(process.cwd(), filePath);
    const fileContent = fs.readFileSync(rulesFilePath, 'utf-8');
    const rules = JSON.parse(fileContent);  // Parse as JSON if it's a JSON file
    return rules;
  } catch (error) {
    console.error('Error reading prompts file:', error);
    return [];
  }
}

const rules = loadRulesFromFile('public/prompts.json');

function getBestResponses(message: string): string[] {
  const matched = rules
    .map((rule: { keywords: string[]; response: String; priority: Number; }) => {
      if (rule) {
        const matched = rule.keywords.some(phrase => {
          return message.includes(phrase);
        });
        return matched ? { response: rule.response, priority: rule.priority } : null;
      }
    })
    .filter(Boolean) as { response: string, priority: number }[];

  if (matched.length === 0) return [];

  const highestPriority = Math.min(...matched.map(m => m.priority));

  const bestMatch = matched
    .filter(m => m.priority === highestPriority)
    .slice(0, 1) // Take only the first match
    .map(m => m.response);

  return bestMatch;
}

export async function POST(request: Request) {
  try {
    const { messages }: { messages: Array<{ content: string }> } = await request.json();
    const userMessage = messages?.[0]?.content || '';

    console.log('User message:', userMessage);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // Preprocess the user message before matching
    const preProcessedMessage = preProcess(userMessage);

    const matchedResponses = getBestResponses(preProcessedMessage.join(' '));

    if (matchedResponses.length > 0) {
      return new Response(JSON.stringify({ message: matchedResponses.join(' ') }), {
        status: 200,
      });
    }

    const facts = { userMessage };
    const results = await engine.run(facts);
    const output = results.events
      .map((event) => event.params?.message)
      .filter((message) => message !== undefined);

    console.log('Rules engine results:', output);

    return new Response(
      JSON.stringify({ message: output[0] || "Sorry, I didn't understand that. I specialise in avoidance." }),
      { status: 200 }
    );
  } catch (error) {
    return new Response('An error occurred while processing your request', { status: 500 });
  }
}
