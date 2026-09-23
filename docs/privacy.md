# SafeReplay Privacy & Security Engine Specification

The core principle of SafeReplay is:
> **"Reproduce the bug. Protect user privacy. Verify the fix."**

This document outlines the strict multi-layered privacy transformations applied by the SafeReplay SDK **before** any event leaves the user's browser.

---

## 1. Zero-PII Invariant

The SafeReplay SDK enforces that:
- `sensitiveValuesUploaded === 0`
- `tokensUploaded === 0`
- `status === "SAFE"`

Any payload violating these constraints is rejected by both the client-side queue and the backend schema validator.

---

## 2. Privacy Layer Architecture

```
[User Action / DOM Mutation / Fetch Call]
                │
                ▼
      [ PrivacyMasker Engine ]
  ├── 1. Mask Input Values (*** / [MASKED])
  ├── 2. Strip Password & CVV elements
  ├── 3. Redact [data-private] & [data-replay-block]
  ├── 4. Scrub Regex (Emails, Phone, Credit Cards)
  ├── 5. Strip Authorization & Cookie Headers
  └── 6. Strip URL Query Tokens & Secrets
                │
                ▼
      [ Sanitized Event Queue ]
                │
                ▼
      [ Batch Uploader (POST /api/sessions/events) ]
```

---

## 3. Privacy Rules & Enforcements

1. **Input & Form Field Masking**:
   - All standard `<input>` and `<textarea>` elements are masked as `[MASKED]` or `***`.
   - Raw keystrokes and values are never stored in memory or transmitted.
2. **Password & Credential Protection**:
   - `<input type="password">` values and key events are completely dropped.
3. **Data Attributes**:
   - `[data-private]`: Masks inner text and attribute contents with `[PRIVATE CONTENT]`.
   - `[data-replay-block]`: Completely replaces the DOM element with `[BLOCKED BY PRIVACY POLICY]`.
4. **Header Sanitization**:
   - Strips `Authorization`, `Cookie`, `Set-Cookie`, `X-API-Key`, `Proxy-Authorization`.
5. **URL Sanitization**:
   - Strips sensitive parameters matching `token`, `password`, `key`, `secret`, `auth`, `access_token`.
6. **Synthetic Data Policy**:
   - Only synthetic demo data is used for all tests and seed fixtures (`alex@example.synthetic`, `555-0199`).
