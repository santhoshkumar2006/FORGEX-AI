# SafeReplay API Reference

Base URL: `http://localhost:5000/api`

---

## 1. Health Endpoints

### `GET /api/health`
Returns system status, service name, and uptime.
- **Response**: `200 OK`
```json
{
  "status": "ok",
  "service": "SafeReplay Backend",
  "version": "1.0.0",
  "timestamp": "2026-09-22T12:00:00.000Z",
  "uptime": 124.5
}
```

---

## 2. Product Endpoints

### `GET /api/products`
Returns synthetic hardware & accessories product catalogue.

### `GET /api/products/:id`
Returns a single product by ID.

---

## 3. Customer Details & Checkout

### `POST /api/customer-details`
Submits customer checkout information.
- **Request Body**:
```json
{
  "name": "Alex Developer",
  "email": "alex@example.synthetic",
  "phone": "555-0199",
  "address": "100 Silicon Valley Way",
  "sessionId": "SR-1042"
}
```
- **Failure Response (Controlled Demo Error, Status 500)**:
```json
{
  "saved": false,
  "message": "Details were not stored.",
  "reason": "Database transaction rolled back: address postalCode normalization error",
  "operation": "customer_details_insert"
}
```

---

## 4. Session & Replay Endpoints

### `POST /api/sessions/events`
Ingests pre-sanitized event batch from Replay SDK.
- **Request Body**:
```json
{
  "sessionId": "SR-1042",
  "events": [...],
  "privacyReport": {
    "sessionId": "SR-1042",
    "inputFieldsDetected": 4,
    "fieldsMasked": 4,
    "privateAreasBlocked": 1,
    "sensitiveValuesUploaded": 0,
    "tokensUploaded": 0,
    "status": "SAFE"
  }
}
```

### `GET /api/sessions`
Returns list of all recorded sessions.

### `GET /api/sessions/:sessionId`
Returns complete session details, aggregated timeline, runtime errors, network calls, and database results.

### `DELETE /api/sessions/:sessionId`
Deletes a session and its associated events for privacy retention cleanup.

---

## 5. AI Analysis & Fix Verification

### `POST /api/analyze-error`
Triggers AI root-cause diagnosis.
- **Request Body**: `{ "sessionId": "SR-1042", "file": "CustomerDetailsService.ts", "line": 48 }`
- **Response**: Validated `AIResult` object.

### `POST /api/verify-fix`
Runs sandbox fix verification against the captured reproduction scenario.
- **Response**:
```json
{
  "success": true,
  "verification": {
    "sessionId": "SR-1042",
    "verificationMessage": "Passed for the captured reproduction scenario.",
    "correctedScenario": {
      "appliedFix": "customer.address?.postalCode?.toUpperCase() ?? 'N/A'",
      "testStatus": "passed",
      "recordId": "REC-1042",
      "errorReproduced": false
    }
  }
}
```

---

## 6. Source File Inspector (Allowlisted)

### `GET /api/source/:file`
Returns content and lines of an allowlisted source file (`CustomerDetailsService.ts`, `CheckoutService.ts`, `Checkout.tsx`). Returns `403 Forbidden` for any other file path.
