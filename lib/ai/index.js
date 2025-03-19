const { Engine } = require('json-rules-engine');

// Initialize the rules engine
const engine = new Engine();

// Add rules
engine.addRule({
  conditions: {
    any: [
      {
        fact: 'age',
        operator: 'greaterThanInclusive',
        value: 18,
      },
      {
        fact: 'hasPermission',
        operator: 'equal',
        value: true,
      },
    ],
  },
  event: {
    type: 'allowed-access',
    params: {
      message: 'Access granted!',
    },
  },
});

// Function to evaluate rules
async function evaluateRules(facts) {
  try {
    const results = await engine.run(facts);
    return results.events.map((event) => event.params.message);
  } catch (error) {
    console.error('Error evaluating rules:', error);
    return [];
  }
}

module.exports = {
  evaluateRules,
};
