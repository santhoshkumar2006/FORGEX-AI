# SafeReplay — Privacy-Preserving AI-Assisted Web Debugging Platform

> **“Reproduce the bug. Protect user privacy. Verify the fix.”**

SafeReplay is an end-to-end web debugging platform that connects user actions, DOM session replay, API requests, atomic database transactions, runtime errors, source-code inspection, AI root-cause analysis, and sandbox fix verification.

---

## 🌟 Key Features

1. **🛡️ 100% Pre-Upload Privacy Engine**:
   - Zero personal data or tokens ever leave the user's browser.
   - Input and textarea fields automatically masked (`[MASKED]`, `***`).
   - Block private areas via `[data-private]` and `[data-replay-block]`.
   - Headers and query parameters stripped of auth tokens, keys, and cookies.
   - Verified Privacy Report generated with `sensitiveValuesUploaded: 0`.

2. **🛍️ Interactive Shopping Demo App (`http://localhost:3000`)**:
   - Polished e-commerce store with synthetic hardware catalogue.
   - Cart calculations (subtotal, shipping rules, taxes).
   - Synthetic checkout submission triggering a controlled database rollback at `CustomerDetailsService.ts:48`.

3. **📊 Developer Studio & Replay Dashboard (`http://localhost:3001`)**:
   - **Chronological Timeline Player**: Play, Pause, Speed control (1x, 2x, 4x), Jump to Error.
   - **Visual State Replay**: Interactive reproduction of the user journey with masked inputs.
   - **Network & Database Inspector**: Intercepted HTTP status codes and database transaction rollback causes.
   - **Source Code Viewer**: Allowlist-guarded file inspector highlighting faulty Line 48 in red.
   - **AI Root-Cause Diagnosis**: Context-aware AI explanation with confidence score and review warnings.
   - **Fix Verification Runner**: Sandbox test execution validating that the corrected code resolves the error (`"Passed for the captured reproduction scenario."`).

---

## 🏗️ Monorepo Architecture

```
safereplay/
├── shared/          # Shared Zod schemas & TypeScript data contracts
├── replay-sdk/      # Privacy-preserving browser capture & masking SDK
├── demo-app/        # React + Vite shopping store application
├── dashboard/       # Developer debugging dashboard & timeline studio
├── server/          # Node.js + Express backend with database and AI providers
├── database/        # Migrations & seed data
├── docs/            # Architecture, privacy, demo scenario & API specs
├── docker-compose.yml
└── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v20/v24)
- npm v9+

### 1. Install Dependencies
```bash
npm install --ignore-scripts
```

### 2. Environment Configuration (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(By default, SafeReplay works out-of-the-box using the built-in Mock database and Mock AI analyzer without requiring any API keys or external services).*

### 3. Start Development Servers
Run the full stack concurrently:
- **Backend API**: `npm run dev:server` (Port `5000`)
- **Demo Store**: `npm run dev:demo` (Port `3000`)
- **Developer Dashboard**: `npm run dev:dashboard` (Port `3001`)

Or start all services via:
```bash
npm run dev
```

---

## 🧪 Testing

Run all automated test suites across all workspaces:
```bash
npm run test
```

Workspace-specific test commands:
```bash
npm run test:shared      # Shared schema validation
npm run test:sdk         # Privacy masking & SDK engine
npm run test:server      # Backend routes, database & AI analysis
npm run test:demo        # Demo app calculations & validations
npm run test:dashboard   # Dashboard logic & compliance
```

---

## 👥 Team Member Ownership

| Member | Branch | Scope |
| :--- | :--- | :--- |
| **Member 1** | `feature/demo-app-db` | `demo-app/`, database migrations, checkout & customer details API |
| **Member 2** | `feature/replay-sdk-privacy` | `replay-sdk/`, privacy masking engine, browser observers, safe fetch wrapper |
| **Member 3** | `feature/dashboard-ai` | `dashboard/`, `server/src/ai/`, sessions & AI analysis routes |

---

## 📚 Documentation Links

- [System Architecture](file:///f:/REPLAY/docs/architecture.md)
- [Controlled Demo Scenario](file:///f:/REPLAY/docs/demo-scenario.md)
- [Privacy Engine Specification](file:///f:/REPLAY/docs/privacy.md)
- [API Reference](file:///f:/REPLAY/docs/api.md)
- [Team Ownership & Git Workflow](file:///f:/REPLAY/docs/team-workflow.md)
- [Final Verification Report](file:///f:/REPLAY/docs/final-verification.md)
