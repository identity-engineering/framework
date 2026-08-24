# 05 – Open Questions (Phase 1)

**Status:** Accepted (2026-08-24)  
Goal: resolve these so Phase 2 (Data Model) can start with stable primitives.

---

## 1. Identity ID scheme

**Decision:**
- Primary: opaque UUID v7 (time-ordered) for local and managed Spaces.
- Optional secondary: DID (`did:ie:<method>:<id>`) when decentralized verification is required.
- A2A Agent Cards keep their existing `url` / endpoint; the IE `identityId` is an additional field, not a replacement.

---

## 2. Frequency Signature

**Decision (v1 – declaration only):**
```json
"frequencySignature": {
  "preferred": ["async", "task"],
  "accepted": ["async", "task", "signal-only"],
  "rejected": ["sync-blocking"]
}
```
No automatic computation in Phase 1. Later phases may derive hints from recent interaction history.

---

## 3. Causal-Entropy Constraints (minimal set)

**Decision (v1):**
```json
"causalEntropyConstraints": {
  "requireExplicitConsentFor": ["mass-altering", "stem-altering"],
  "maxAutomaticImpact": "low"
}
```
- `mass-altering` / `stem-altering` always need explicit consent from the receiving Identity (or its owner).
- Everything else defaults to `maxAutomaticImpact: "low"`.

---

## 4. Payload content types & storage

**Decision:**
- Required content types in v1: `text/plain`, `text/markdown`, `application/json`, `application/a2a-task+json`.
- Payload may be **inline** (small) or a **reference** (`uri` + `contentType` + optional hash).
- Server stores only Envelope + reference metadata by default; actual Payload bytes are Ownership-controlled.

---

## 5. Minimal Regulation language for Collectives

**Decision (minimal):**
```json
"regulation": {
  "routing": "fan-out | specialist | central",
  "specialists": ["identityId", "..."],
  "damping": {
    "maxMessagesPerWindow": 50,
    "windowSeconds": 60
  }
}
```

---

## 6. Boundary between Messaging Service and Identity metabolization

**Decision:**
- **Messaging Service owns:** transport, Envelope, Recognition check against Card, delivery/receipts, basic damping counters, addressing.
- **Receiving Identity owns:** metabolization (State Differential / Vision Gradient updates), deeper Causal-Entropy decisions, any geometry change, emission of follow-up messages.

The service delivers; the Identity decides what the message *means* for its own geometry.

---

## Decision log

| # | Topic | Status |
|---|-------|--------|
| 1 | Identity ID scheme | **Accepted** |
| 2 | Frequency Signature | **Accepted** |
| 3 | Causal-Entropy constraints | **Accepted** |
| 4 | Payload content types | **Accepted** |
| 5 | Regulation language | **Accepted** |
| 6 | Service vs Identity boundary | **Accepted** |
