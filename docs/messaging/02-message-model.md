# 02 – Message Model

**Status:** Draft (Phase 1)

## Core Separation: Signal vs Payload

| Layer | Purpose | Visibility | Required |
|-------|---------|------------|----------|
| **Signal** | Meta-exchange (intent, type, scope, frequency hint) | Always visible to router & Recognition | Yes |
| **Payload** | Actual content / task / data | Only after Recognition succeeds and Ownership allows | Optional |

This mirrors the biology-lens **Signal** concept and keeps the server able to route without reading content.

## Envelope

Every message is wrapped in an Envelope:

```json
{
  "id": "msg-uuid",
  "correlationId": "optional-thread-or-task-id",
  "timestamp": "ISO-8601",
  "from": {
    "identityId": "...",
    "cardUrl": "...",
    "scope": "personal | project:xyz | ..."
  },
  "to": {
    "identityId": "...",
    "scope": "..."
  },
  "signal": {
    "type": "notify | request | task | broadcast | metabolize",
    "frequency": "async | sync | fire-and-forget",
    "priority": "low | normal | high",
    "intentSummary": "short human-readable hint (optional)"
  },
  "payload": {
    "contentType": "text/markdown | application/json | a2a-task | ...",
    "body": "... or reference",
    "encryption": "none | identity-owned | e2e"
  },
  "receiptRequested": true
}
```

## Addressing

- Primary address = Identity ID + optional Scope.
- Broadcast = list of target Identities or a Scope (with Frequency and Ownership filters).
- Collective addresses resolve to the emergent Identity first; specialization decides internal routing.

## Receipts & Feedback

- Delivery Receipt (transport-level)
- Recognition Receipt (accepted / rejected + reason)
- Metabolization Receipt (optional, after Operating Cycle has processed the message)

Receipts themselves are lightweight Signals.

## Compatibility with A2A

An A2A Task can be embedded as Payload of type `a2a-task`.  
The Envelope still carries the IE Signal and Ownership context so that Recognition and Causal-Entropy checks can run before the Task is handed to the A2A endpoint.

## Open questions

- Exact content-type registry
- Whether Payload can be a reference (URI) vs inline
- Minimum Receipt fields for auditability
