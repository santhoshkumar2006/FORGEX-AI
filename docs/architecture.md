# SafeReplay Architecture & Technical Design

SafeReplay is architected as a modular TypeScript monorepo connecting client-side replay observation, privacy redaction, backend telemetry ingestion, database state tracing, allowlisted source inspection, AI root-cause analysis, and sandbox fix verification.

---

## 1. Monorepo Workspaces

```
safereplay/
├── shared/          # Shared Zod schemas and TypeScript data contracts
├── replay-sdk/      # Privacy-preserving browser capture SDK
├── demo-app/        # React + Vite shopping store application
├── dashboard/       # Developer debugging dashboard with Timeline & AI analysis
├── server/          # Node.js + Express backend with database and AI providers
└── database/        # Migrations and seed scripts
```

---

## 2. Component Interactions & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Demo as Demo App (Port 3000)
    participant SDK as SafeReplay SDK
    participant API as Express Server (Port 5000)
    participant DB as Database Layer
    participant AI as AI Provider (Mock / LLM)
    participant Dash as Developer Dashboard (Port 3001)

    User->>Demo: Add Product & Submit Checkout
    Demo->>SDK: Capture safe click, route & form submit
    Demo->>API: POST /api/customer-details
    API->>DB: CustomerDetailsService (save)
    Note over API,DB: Unhandled postalCode access throws TypeError at Line 48
    DB-->>API: Transaction Rollback (status: failed)
    API-->>Demo: 500 Internal Error (Details were not stored)
    SDK->>SDK: Mask PII & strip sensitive headers
    SDK->>API: POST /api/sessions/events (Batched Safe Events)
    Dash->>API: GET /api/sessions/SR-1042
    API-->>Dash: Session Details, Timeline, Errors, DB Results
    Dash->>API: POST /api/analyze-error
    API->>AI: Generate root cause diagnosis
    AI-->>Dash: Validated AIResult (Suggested Fix + Confidence)
    Dash->>API: POST /api/verify-fix
    API-->>Dash: "Passed for the captured reproduction scenario."
```
