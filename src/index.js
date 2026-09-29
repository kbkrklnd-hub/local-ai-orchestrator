// index.js
import readline from 'readline';
import { AssistantOrchestrator } from './assistant.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const assistant = new AssistantOrchestrator();

async function startCLI() {
  console.log('\n==================================================');
  console.log('🤖 Local Multi-Agent Task Router & Governance Online');
  console.log('Type your request below, or type "exit" to quit.');
  console.log('==================================================\n');

  rl.question('You: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    try {
      const response = await assistant.processUserRequest(input);
      console.log(`\nAssistant:\n${response}\n`);
    } catch (error) {
      console.error('Execution Error:', error);
    }

    startCLI();
  });
}

startCLI();