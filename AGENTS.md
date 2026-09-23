# SafeReplay Agent & Engineering Rules

## 1. Core Mission
SafeReplay is a privacy-preserving AI-assisted web debugging platform.
Core principle: "Reproduce the bug. Protect user privacy. Verify the fix."

## 2. Invariants
- Zero PII: No real user credentials, raw passwords, CVVs, or unmasked personal data may ever be uploaded.
- Pre-Upload Masking: Client-side Replay SDK sanitizes input values, DOM nodes, headers, and query params before queueing.
- Atomic Database Operations: Controlled demo failures trigger atomic rollbacks with clean database status records.
- Fix Verification: Automated sandbox test runner must verify the reproduction scenario and display: "Passed for the captured reproduction scenario."
- Developer Review Warning: All AI suggestions must state "AI-generated suggestion — developer review required."
- UI Protection: The approved demo application UI layout and styling must be preserved.
- Dashboard Design: Professional, clean developer aesthetic using thin-line icons (Lucide React) and no unnecessary emojis.

## 3. Monorepo Workspaces
- `shared/`: Shared TypeScript data schemas and Zod validators.
- `replay-sdk/`: Browser capture, DOM MutationObserver, PerformanceObserver, Privacy Engine.
- `server/`: Express + TypeScript API, database adapter, source file reader, mock/external AI providers.
- `demo-app/`: React + Vite shopping store demonstration application.
- `dashboard/`: React + Vite Developer Debugging Studio.
- `database/`: SQL schema migrations and seed scripts.
- `docs/`: Technical specifications and audit reports.
- `tests/`: End-to-end integration tests.
