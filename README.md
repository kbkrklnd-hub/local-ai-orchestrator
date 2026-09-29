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

### Installation

1. Clone the repository:
   ```sh
   git clone [https://github.com/yourusername/your-repo.git](https://github.com/yourusername/your-repo.git)
   cd your-repo