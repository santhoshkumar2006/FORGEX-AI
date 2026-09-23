# SafeReplay Demo Scenario: Reproduce, Protect & Verify

This document specifies the primary controlled demo error, reproduction workflow, expected results, and verification flow for the SafeReplay Hackathon Prototype.

---

## 1. Controlled Error Overview

| Property | Value |
| :--- | :--- |
| **Bug Location** | `server/src/services/CustomerDetailsService.ts:48` |
| **Trigger Action** | User submits the synthetic checkout form |
| **Error Type** | `TypeError: Cannot read properties of undefined (reading 'toUpperCase')` |
| **Database Effect** | Transaction Rollback (`database_result` status: `failed`) |
| **HTTP Response** | `500 Internal Server Error` |
| **Security Impact** | **None** (Safe, isolated, synthetic payload reproduction) |

---

## 2. Steps to Reproduce

1. Open the Shopping Demo Store at `http://localhost:3000`.
2. Browse the hardware catalog (e.g. *Aura Pro ANC Headphones*, *Curved 34" Monitor*).
3. Click **"Add to Cart"**.
4. Open the cart drawer and click **"Proceed to Checkout"**.
5. The form is pre-filled with synthetic customer values (`Alex Developer`, `alex.developer@example.synthetic`, `100 Silicon Valley Way`).
6. Click **"Pay Now"** / **"Submit Order"**.
7. Observe the controlled error modal informing the user that the order was not stored due to a database transaction rollback.
8. Click **"Inspect in SafeReplay Dashboard"** to jump to the developer studio.

---

## 3. Expected Results Across Components

### A. Demo App Result
- Shows a styled failure dialog explaining that the database transaction failed cleanly.
- Displays the synthetic session ID (`SR-1042`).
- Offers a **"Retry Checkout"** and **"Inspect in SafeReplay Dashboard"** option.
- **Never** exposes raw server stack traces or internal secrets to the end user.

### B. SafeReplay Replay SDK Result
- Intercepts all DOM interactions, clicks, and form submissions.
- **Masks all input fields** (`Name: [MASKED]`, `Email: [MASKED_EMAIL]`, `Address: [MASKED_ADDRESS]`, `CVV: ***`).
- Blocks private payment blocks marked with `data-replay-block`.
- Intercepts the HTTP 500 network response and captures response metadata without leaking personal credentials.
- Generates a `PrivacyReport` with `status: "SAFE"`, `sensitiveValuesUploaded: 0`, `tokensUploaded: 0`.
- Batches events and securely uploads them to `POST /api/sessions/events`.

### C. Backend Result
- `CustomerDetailsService.ts:48` catches the unhandled postalCode access.
- Executes transaction rollback: `TRANSACTION_ROLLBACK`.
- Stores `database_result` as `failed` with reason `"Database transaction rolled back: address postalCode normalization error"`.
- Stores `runtime_error` with `line: 48` and sanitized stack.

### D. Developer Dashboard Result
- **Session List**: Displays `SR-1042` with red `🔴 Database save failed` and `🔴 Rolled Back` badges.
- **Timeline Player**: Shows ordered steps from page open to error occurrence.
- **State Replay**: Renders the exact visual UI state at each timeline step.
- **Source Code Viewer**: Displays `CustomerDetailsService.ts` with Line 48 highlighted in red.
- **AI Analysis**: Explains that `customer.address.postalCode` threw a TypeError because of unsafe property navigation.
- **Fix Verification**: Running **"Test Fix"** executes the captured scenario with `customer.address?.postalCode?.toUpperCase() ?? 'N/A'`, commits cleanly (`REC-1042`), and outputs:
  > **"Passed for the captured reproduction scenario."**
