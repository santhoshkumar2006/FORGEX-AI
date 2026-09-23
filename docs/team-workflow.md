# SafeReplay Team Ownership & Git Workflow

To ensure high development velocity and safe code integration across our 3-member engineering team:

---

## 1. Member Ownership Matrix

| Member | Feature Branch | Scope & Folders | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Member 1** | `feature/demo-app-db` | `demo-app/`, database migrations, server database logic | Shopping UI, Cart & Checkout calculations, Customer details & Payment APIs |
| **Member 2** | `feature/replay-sdk-privacy` | `replay-sdk/`, privacy masking, browser event capture | Input masking, password stripping, observers, safe fetch wrapper, privacy reports |
| **Member 3** | `feature/dashboard-ai` | `dashboard/`, `server/src/ai/`, sessions & analysis routes | Developer studio UI, Timeline player, AI root cause engine, Fix verification runner |

---

## 2. Git Branching Rules

- Feature branches: `feature/demo-app-db`, `feature/replay-sdk-privacy`, `feature/dashboard-ai`.
- Direct pushes or commits to `main` without verification are strictly prohibited.
- Shared data contract changes in `shared/` must maintain backwards compatibility and have tests passing before merging into `main`.
