// src/assistant.js
import fs from 'fs';
import path from 'path';
import { askAgent } from './engine.js';

export class AssistantOrchestrator {
  constructor() {
    this.todoPath = path.resolve(process.cwd(), 'data/todo.json');
    this.contextPath = path.resolve(process.cwd(), 'data/user_context.json');
    this.changelogPath = path.resolve(process.cwd(), 'data/changelog.md');
  }

  loadJson(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  saveJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  appendChangelog(entry) {
    const timestamp = new Date().toISOString();
    const logEntry = `\n[${timestamp}] ${entry}\n`;
    fs.appendFileSync(this.changelogPath, logEntry, 'utf8');
  }

  async processUserRequest(userInput) {
    console.log('\n[Assistant]: Analyzing your request...');
    let userContext = this.loadJson(this.contextPath);

    // --- 0. THE ONBOARDING INTERCEPT ---
    if (JSON.stringify(userContext).includes('UNSET') && userContext.opt_out_status === false) {
      console.log('[System]: Onboarding flag detected. Intercepting...');
      
      const onboardingPrompt = `You are the Onboarding Agent.
      User Input: "${userInput}"
      
      Follow these rules strictly:
      1. If the user says hello or asks a general question, respond with ONLY: "Would you like to set up your profile (tech stack, tone) to personalize your experience, or opt out?"
      2. If the user agrees (e.g., "Yes", "Sure") but DOES NOT provide their details yet, respond with ONLY: "Great! Please tell me a bit about your tech stack, background, and preferred tone."
      3. If the user actually provides their details OR explicitly opts out, output a valid JSON object matching this schema, replacing "UNSET" with their info (or setting opt_out_status to true if they opted out):
      {
        "preferences": { "mannerisms": "..." },
        "technical_stack": "...",
        "background": "...",
        "opt_out_status": false
      }
      Output ONLY the raw JSON object. Do not include markdown formatting, backticks, or any conversational text.`;

      let response = await askAgent('Onboarding Agent', onboardingPrompt);
      
      // Clean the string in case Qwen hallucinates markdown backticks anyway
      response = response.replace(/```json/gi, '').replace(/```/gi, '').trim();

      if (response.startsWith('{')) {
        try {
          const newContext = JSON.parse(response);
          this.saveJson(this.contextPath, newContext);
          return "Your profile has been saved successfully! How can I help you today?";
        } catch (error) {
          console.error("[System Error]: Failed to parse Onboarding JSON.", error);
        }
      }
      
      // If it wasn't valid JSON, return the conversational question to the user
      return response;
    }

    // --- 1. PRE-ROUTING CLARIFICATION CHECK ---
    const triagePrompt = `You are a triage routing system. 
    
    <user_context>
    ${JSON.stringify(userContext)}
    </user_context>
    
    <user_input>
    ${userInput}
    </user_input>
    
    Follow these steps in strict order:
    STEP 1: Check <user_input>. If the user is asking for coding, writing, or analysis but didn't provide enough details (like project specs or target audience), STOP evaluating. Output a clarifying question to gather requirements.
    STEP 2: If Step 1 does not apply, output EXACTLY ONE WORD representing the destination: 'coding', 'writer', 'analysis', or 'direct'.
    `;
    
    const triageDecision = await askAgent('Assistant Triage', triagePrompt);
    
    // If the model asks a clarifying question, bounce it back to the user
    if (triageDecision.split(' ').length > 2) {
      return triageDecision; 
    }

    const route = triageDecision.toLowerCase().trim();
    console.log(`[Assistant]: Routing confirmed -> ${route}`);
    let workOutput = '';

    if (route.includes('coding')) {
      const codingPrompt = `You are a Coding Agent specializing in writing, analyzing, and testing code. 
      Task: "${userInput}"
      Provide a high-quality technical solution, recommending the best tools and algorithms.`;
      workOutput = await askAgent('Coding Agent', codingPrompt);
      workOutput = await this.runCriticPipeline(workOutput, ['Security', 'Optimization', 'UX']);

    } else if (route.includes('writer')) {
      const writerPrompt = `You are a Writer Agent. Write accurately, concisely, masking AI identity, using a polite, gentle-but-firm tone.
      Task: "${userInput}"`;
      workOutput = await askAgent('Writer Agent', writerPrompt);
      workOutput = await this.runCriticPipeline(workOutput, ['Legal', 'Social']);

    } else if (route.includes('analysis')) {
      const analysisPrompt = `You are an Analysis Agent handling data, math, and simulations.
      Task: "${userInput}"`;
      workOutput = await askAgent('Analysis Agent', analysisPrompt);
      workOutput = await this.runCriticPipeline(workOutput, ['Optimization']);

    } else {
      const directPrompt = `You are a friendly, supportive personal Assistant. Respond directly to the user's input, manage their todo list, and maintain a helpful tone.
      User Input: "${userInput}"`;
      workOutput = await askAgent('Assistant Direct', directPrompt);
    }

    return workOutput;
  }

  async runCriticPipeline(draft, criticList) {
    const draftPath = path.resolve(process.cwd(), 'data/active_draft.md');
    fs.writeFileSync(draftPath, draft, 'utf8'); // Commit the initial draft to disk
    
    const hierarchy = ['Legal', 'Security', 'Social', 'Optimization', 'UX'];
    const sortedCritics = criticList.sort((a, b) => hierarchy.indexOf(a) - hierarchy.indexOf(b));

    for (const criticType of sortedCritics) {
      console.log(`[Governance]: Running ${criticType} Critic review...`);
      
      // 1. Read current state from disk (Virtual RAM)
      const currentDraft = fs.readFileSync(draftPath, 'utf8');
      
      // 2. Fetch only the last 10 lines of the changelog to maintain strict constraint context without bloat
      const changelogContent = fs.existsSync(this.changelogPath) 
          ? fs.readFileSync(this.changelogPath, 'utf8').split('\n').slice(-10).join('\n') 
          : 'No prior constraints.';

      const criticPrompt = `You are the ${criticType} Critic. 
      Recent Governance History:
      ${changelogContent}
      
      Current Draft:
      ${currentDraft}
      
      Evaluate the draft against your domain. Output ONLY a valid JSON object matching this schema:
      {
        "status": "APPROVED" or "REJECTED",
        "feedback": "Detailed reason and specific rules to enforce if rejected. Leave empty if approved."
      }
      Do not output any markdown formatting, backticks, or conversational text.`;

      let reviewResponse = await askAgent(`${criticType} Critic`, criticPrompt);
      // Clean potential hallucinations
      reviewResponse = reviewResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();

      try {
        const review = JSON.parse(reviewResponse);
        
        if (review.status === "REJECTED") {
          console.log(`[Governance]: ${criticType} Critic requested revisions.`);
          this.appendChangelog(`[${criticType} Critic] Rejected draft. Enforced Rule: ${review.feedback}`);
          
          const refactorPrompt = `You are the Actor Refactor Agent. 
          Critic Feedback: ${review.feedback}
          
          Current Draft:
          ${currentDraft}
          
          Rewrite the draft to perfectly satisfy the critic's feedback. Output ONLY the raw updated code/text.`;
          
          const revisedDraft = await askAgent('Actor Refactor Agent', refactorPrompt);
          
          // 3. Overwrite the disk file with the new state
          fs.writeFileSync(draftPath, revisedDraft, 'utf8');
          
        } else {
          console.log(`[Governance]: ${criticType} Critic APPROVED.`);
          this.appendChangelog(`[${criticType} Critic] Approved draft.`);
        }
      } catch (error) {
        console.error(`[System Error]: ${criticType} Critic failed to output valid JSON. Approving by default to prevent pipeline freeze.`);
        this.appendChangelog(`[${criticType} Critic] Auto-approved due to JSON parse error.`);
      }
    }

    // Return the final file state for the user
    return fs.readFileSync(draftPath, 'utf8');
  }
}