# 05 – Open Questions (Phase 1)

**Status:** Draft – decision proposals  
Goal: resolve these so Phase 2 (Data Model) can start with stable primitives.

---

## 1. Identity ID scheme

**Question:** What identifier does an Identity Card use?

**Proposal:**
- Primary: opaque UUID v7 (time-ordered) for local and managed Spaces.
- Optional secondary: DID (`did:ie:<method>:<id>`) when decentralized verification is required.
- A2A Agent Cards keep their existing `url` / endpoint; the IE `identityId` is an additional field, not a replacement.

**Rationale:** UUID is simple, local-first friendly, and does not force a DID infrastructure. DID remains available for inter-org / high-trust cases.

---

## 2. Frequency Signature

**Question:** How is `frequencySignature` declared or computed?

**Proposal (v1 – declaration only):**
```json
"frequencySignature": {
  "preferred": ["async", "task"],
  "accepted": ["async", "task", "signal-only"],
  "rejected": ["sync-blocking"]
}
```
No automatic computation in Phase 1. Later phases may derive hints from recent interaction history (resonance vs drift).

**Rationale:** Keeps Phase 1 simple. Computation can be added once real traffic exists.

---

## 3. Causal-Entropy Constraints (minimal set)

**Question:** What is the smallest useful set of constraints?

**Proposal (v1):**
```json
"causalEntropyConstraints": {
  "requireExplicitConsentFor": ["mass-altering", "stem-altering"],
  "maxAutomaticImpact": "low"
}
```
- `mass-altering` / `stem-altering` always need explicit consent from the receiving Identity (or its owner).
- Everything else defaults to `maxAutomaticImpact: "low"` (informational / non-geometry-changing).

**Rationale:** Protects the two most identity-critical operations without over-engineering a full impact model yet.

---

## 4. Payload content types & storage

**Question:** Inline vs reference? Which content types?

**Proposal:**
- Required content types in v1: `text/plain`, `text/markdown`, `application/json`, `application/a2a-task+json`.
- Payload may be **inline** (small) or a **reference** (`uri` + `contentType` + optional hash).
- Server stores only Envelope + reference metadata by default; actual Payload bytes are Ownership-controlled (local file, encrypted blob, or external URI).

**Rationale:** Matches “server as router” principle and keeps large payloads out of the messaging core.

---

## 5. Minimal Regulation language for Collectives

**Question:** What does Regulation need to express in v1?

**Proposal (minimal):**
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
- `fan-out`: deliver to all members (subject to each member’s Recognition).
- `specialist`: route to one or more listed specialists.
- `central`: Collective Identity metabolizes itself.

**Rationale:** Enough to make Multicellularity + Specialization + Regulation executable without a full policy language.

---

## 6. Boundary between Messaging Service and Identity metabolization

**Question:** What does the Messaging Service own vs what the receiving Identity owns?

**Proposal:**
- **Messaging Service owns:** transport, Envelope, Recognition check against Card, delivery/receipts, basic damping counters, addressing.
- **Receiving Identity owns:** metabolization (State Differential / Vision Gradient updates), deeper Causal-Entropy decisions, any geometry change, emission of follow-up messages.

The service delivers; the Identity decides what the message *means* for its own geometry.

---

## Decision log

| # | Topic | Status |
|---|-------|--------|
| 1 | Identity ID scheme | Proposal ready |
| 2 | Frequency Signature | Proposal ready |
| 3 | Causal-Entropy constraints | Proposal ready |
| 4 | Payload content types | Proposal ready |
| 5 | Regulation language | Proposal ready |
| 6 | Service vs Identity boundary | Proposal ready |

Once these are accepted (or revised), Phase 2 (concrete data schemas) can begin.
