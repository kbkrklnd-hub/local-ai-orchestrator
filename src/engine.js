// src/engine.js
import fetch from 'node-fetch';
import os from 'os';

let activeModels = null;

async function detectModels() {
  if (activeModels) return activeModels;

  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    
    if (!data.models || data.models.length === 0) {
      console.warn("[Warning]: No Ollama models detected!");
      return { coding: null, assistant: null, critic: null };
    }

    const modelNames = data.models.map(m => m.name);
    
    // Default fallback
    activeModels = { coding: modelNames[0], assistant: modelNames[0], critic: modelNames[0] };

    if (modelNames.length > 1) {
      const codingModel = modelNames.find(m => m.includes('coder') || m.includes('qwen'));
      if (codingModel) activeModels.coding = codingModel;

      const assistantModel = modelNames.find(m => m.includes('llama') || m.includes('mistral') || m.includes('gemma'));
      if (assistantModel) activeModels.assistant = assistantModel;

      const criticModel = modelNames.find(m => m.includes('7b') || m.includes('8b')) || modelNames[1];
      if (criticModel) activeModels.critic = criticModel;
    }
    
    console.log(`[System]: Semantic Routing Active -> Coding: '${activeModels.coding}', Assistant: '${activeModels.assistant}', Critics: '${activeModels.critic}'`);
    return activeModels;

  } catch (error) {
    console.error("[System Error]: Failed to connect to Ollama.", error.message);
    return { coding: null, assistant: null, critic: null };
  }
}

function checkSystemPressure() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const freeRatio = freeMem / totalMem;
  
  return {
    freeRamGb: (freeMem / (1024 ** 3)).toFixed(1),
    isThrottled: freeRatio < 0.15
  };
}

export async function askAgent(agentRole, prompt) {
  const models = await detectModels();
  
  if (!models.coding) {
    return "ERROR: No local models found. Please start Ollama.";
  }

  // 1. Semantic Model Selection
  let targetModel = models.assistant; 
  const roleLower = agentRole.toLowerCase();
  
  if (roleLower.includes('coding') || roleLower.includes('analysis') || roleLower.includes('refactor')) {
    targetModel = models.coding;
  } else if (roleLower.includes('critic')) {
    targetModel = models.critic;
  }

  // 2. Dynamic KV Cache Throttling
  const pressure = checkSystemPressure();
  let contextSize = 8192; 

  if (pressure.isThrottled) {
    console.log(`[Resource Monitor]: RAM low (${pressure.freeRamGb}GB free). Throttling context window to 2048.`);
    contextSize = 2048; 
  }

  const payload = {
    model: targetModel,
    prompt: prompt,
    stream: false,
    options: {
      num_ctx: contextSize 
    }
  };

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error(`[Engine Error - ${agentRole}]:`, error.message);
    return "ERROR_GENERATING_RESPONSE";
  }
}