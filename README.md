# Local Multi-Agent AI Orchestrator

A production-grade, resource-aware local AI orchestration engine built in Node.js. Designed to run advanced multi-agent workflows entirely on local hardware via Ollama, optimizing for strict VRAM constraints and zero-bloat state management.

## 🚀 Key Architectural Features

* **Semantic Model Routing:** Dynamically queries local Ollama endpoints on boot, automatically mapping specialized models (Heavy Coders, Lightweight Critics, Conversational Assistants) based on intent and task domain.
* **Bare-Metal Resource Monitoring:** Integrates Node.js native `os` module to poll real-time system RAM pressure, automatically triggering defensive throttles when free memory drops below safe operating thresholds.
* **Dynamic KV Cache Throttling:** Programmatically adjusts Ollama's `num_ctx` payload parameter on the fly, preventing VRAM overflow from spilling into system RAM and causing CPU bottlenecks.
* **Virtual Paging Architecture:** Eliminates context window bloat by decoupling memory from the active prompt. The orchestrator writes active working states to a local disk file (`active_draft.md`) and passes only a compressed tail of historical governance logs to secondary agents.
* **Hardened JSON Governance:** Enforces strict, schema-validated outputs for automated review pipelines, paired with a localized Refactor Agent to parse rejections and modify code state independently.

## 🛠️ Tech Stack & Prerequisites
* **Runtime:** Node.js 14 or higher, `node-fetch`
* **Inference Engine:** Ollama (Local LLM Server)
* **Hardware Target:** Optimized for AMD Radeon RX 7900 XTX (24GB VRAM) & Ryzen 7600X
* **Version Control:** Git

## Getting Started

### Prerequisites

- Node.js 14 or higher
- Git

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/kbkrklnd-hub/local-ai-orchestrator.git
   cd local-ai-orchestrator
   ```

2. Install the required dependencies:
   ```sh
   npm install
   ```

### Configuration

The configuration for the application is managed in the `config.js` file. You can modify the settings as needed.

### Running the Application

To run the application, execute the following command:
```sh
node src/index.js
```

## Agents

* **Coding Agent**: Handles coding tasks, code generation, and complex refactoring.
* **Writer Agent**: Handles writing tasks and content generation.
* **Analysis Agent**: Performs data analysis and reporting.
* **Legal Critic**: Evaluates outputs from a legal perspective.
* **Security Critic**: Evaluates outputs from a security perspective.
* **Social Critic**: Evaluates outputs from a social and ethical perspective.
* **Optimization Critic**: Evaluates outputs from an optimization perspective.
* **UX Critic**: Evaluates outputs from a user experience perspective.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.