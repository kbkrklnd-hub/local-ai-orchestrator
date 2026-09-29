# Changelog

## Version 1.0.0 - Initial Release
- **Date**: 2023-10-01
- **Changes**:
  - Initial implementation of Coding Agent.
  - Added basic security doctrine guidelines.
  - Created versioning guide.
  - Implemented user context data structure.
  - Initialized todo list for future tasks.
  - Created glossary of terms for clarity.

## Version 1.0.1 - Minor Improvements
- **Date**: 2023-10-05
- **Changes**:
  - Added detailed descriptions for each task in the todo list.
  - Expanded the glossary with additional terms.
  - Improved the formatting of the security doctrine and versioning guide.

## Version 1.0.2 - Bug Fixes
- **Date**: 2023-10-10
- **Changes**:
  - Fixed minor issues in user context data.
  - Corrected typos in the changelog.
  - Updated the versioning guide with best practices.
  
[2026-09-29T18:45:15.289Z] [Security Critic] Rejected draft. Feedback: REJECTED

The provided draft does not adhere to the Security Doctrine principles specified. Specifically, it fails to address input validation, saniti...

[2026-09-29T18:46:48.953Z] [Optimization Critic] Approved draft.

[2026-09-29T18:47:07.287Z] [UX Critic] Approved draft.

[2026-09-29T18:54:59.489Z] [Security Critic] Rejected draft. Feedback: REJECTED

The draft contains several areas that violate the established Security Doctrine and MANDATORY UPSTREAM CONSTRAINTS. Here are the specific is...

[2026-09-29T18:58:24.213Z] [Optimization Critic] Approved draft.

[2026-09-29T18:59:03.734Z] [UX Critic] Rejected draft. Feedback: **APPROVED**

The revised draft adheres to the MANDATORY UPSTREAM CONSTRAINTS and the Security Doctrine. Here are the key points that confirm complian...

## v1.2.0 - Resource-Aware Orchestration & Virtual Paging

Semantic Model Routing: Rebuilt engine.js to dynamically poll local Ollama endpoints (/api/tags) on boot. The orchestrator now automatically maps installed models to specific agent roles (e.g., Heavy Coders for generation, Lightweight 7B/8B for Critics, Conversational for UI) based on intent string matching.

Bare-Metal Resource Monitoring: Integrated Node's native os module to monitor system RAM in real-time. If available memory drops below a 15% safety threshold, the system automatically triggers a defensive posture.

Dynamic KV Cache Throttling: Implemented a pressure valve in the Ollama payload. When system RAM is low, num_ctx dynamically shrinks from 8192 to 2048 to prevent VRAM overflow from spilling into the CPU and thermal throttling the machine.

Virtual Paging Architecture: Rewrote the runCriticPipeline in assistant.js to eliminate string-concatenation bloat. The system now writes the active draft to a local disk file (active_draft.md) and only passes the last 10 lines of the governance history to the Critics to keep the active context window highly compressed.

Hardened JSON Governance: Enforced strict schema outputs for the Critic tier (requiring only status and feedback fields) and added a localized Refactor Agent to parse rejections and modify the file state independently.

Onboarding Intercept Resolved: Patched the initialization loop by restoring the saveJson method and successfully mapping the user context payload to permanently bypass the UNSET flag.## 
