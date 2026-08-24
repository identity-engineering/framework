# 07 – Message Envelope & Payload Schema (v0.1)

**Status:** Draft (Phase 2)

## Design rules

- **Envelope** is visible to the Messaging Service (routing, Recognition, damping, receipts).
- **Payload** is under Ownership control of sender and receiver; may be inline or referenced.
- Server stores Envelope + reference metadata; Payload bytes stay local / encrypted / external unless both parties opt in.

## Envelope Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://identity-engineering.org/schemas/message-envelope-v0.1.json",
  "title": "MessageEnvelope",
  "type": "object",
  "required": [
    "messageId",
    "from",
    "to",
    "createdAt",
    "signal",
    "payload"
  ],
  "properties": {
    "messageId": {
      "type": "string",
      "description": "UUID v7",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    "from": {
      "type": "string",
      "description": "Sender identityId"
    },
    "to": {
      "oneOf": [
        { "type": "string", "description": "Single target identityId" },
        {
          "type": "object",
          "required": ["collectiveId"],
          "properties": {
            "collectiveId": { "type": "string" },
            "routingHint": {
              "type": "string",
              "enum": ["fan-out", "specialist", "central"]
            }
          }
        }
      ]
    },
    "inReplyTo": {
      "type": "string",
      "description": "Optional parent messageId"
    },
    "threadId": {
      "type": "string",
      "description": "Optional conversation / coupling thread"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "signal": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "signal-only",
            "message",
            "task",
            "receipt",
            "consent-request",
            "consent-grant",
            "consent-deny"
          ]
        },
        "priority": {
          "type": "string",
          "enum": ["low", "normal", "high"],
          "default": "normal"
        },
        "frequency": {
          "type": "string",
          "description": "Declared frequency class of this message"
        }
      },
      "additionalProperties": false
    },
    "payload": {
      "$ref": "#/$defs/Payload"
    },
    "ownership": {
      "type": "object",
      "properties": {
        "holder": {
          "type": "string",
          "description": "identityId that currently holds primary ownership of the Payload"
        },
        "visibility": {
          "type": "string",
          "enum": ["sender-receiver", "thread", "collective", "public"],
          "default": "sender-receiver"
        }
      }
    },
    "impactHints": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["informational", "mass-altering", "stem-altering"]
      },
      "description": "Sender-declared impact class; service uses for consent gating"
    },
    "signature": {
      "type": "object",
      "properties": {
        "alg": { "type": "string" },
        "keyId": { "type": "string" },
        "value": { "type": "string" }
      }
    }
  },
  "$defs": {
    "Payload": {
      "type": "object",
      "required": ["contentType"],
      "properties": {
        "contentType": {
          "type": "string",
          "enum": [
            "text/plain",
            "text/markdown",
            "application/json",
            "application/a2a-task+json",
            "application/octet-stream"
          ]
        },
        "inline": {
          "type": "string",
          "description": "Base64 or plain text when small"
        },
        "reference": {
          "type": "object",
          "required": ["uri"],
          "properties": {
            "uri": { "type": "string", "format": "uri" },
            "hash": {
              "type": "string",
              "description": "sha256:... integrity check"
            },
            "sizeBytes": { "type": "integer", "minimum": 0 }
          }
        }
      },
      "oneOf": [
        { "required": ["inline"] },
        { "required": ["reference"] }
      ],
      "additionalProperties": false
    }
  },
  "additionalProperties": false
}
```

## Receipt Schema (lightweight)

```json
{
  "messageId": "…",
  "receiptType": "delivered | recognized | rejected | metabolized | consent-granted | consent-denied",
  "from": "receiving identityId",
  "to": "original sender identityId",
  "createdAt": "…",
  "reason": "optional human-readable or machine code",
  "inReplyTo": "original messageId"
}
```

Receipts are themselves Envelopes with `signal.type = "receipt"` and a minimal Payload.

## Example – simple text message

```json
{
  "messageId": "018f3a2c-1a2b-7c3d-8e4f-5a6b7c8d9e0f",
  "from": "018f3a2b-7c9e-7d01-8a2b-000000000001",
  "to": "018f3a2b-7c9e-7d01-8a2b-3c4d5e6f7890",
  "createdAt": "2026-08-24T18:05:00Z",
  "signal": {
    "type": "message",
    "priority": "normal",
    "frequency": "async"
  },
  "payload": {
    "contentType": "text/markdown",
    "inline": "Can you review the PR on the messaging branch?"
  },
  "impactHints": ["informational"],
  "ownership": {
    "holder": "018f3a2b-7c9e-7d01-8a2b-000000000001",
    "visibility": "sender-receiver"
  }
}
```

## Decision-layer evaluation order (runtime)

1. Transport reachable?
2. Recognition policy of `to` accepts `from` + signal type?
3. Ownership / visibility rules satisfied?
4. If `impactHints` contains `mass-altering` or `stem-altering` → consent gate
5. Frequency fit against target Card
6. Deliver + emit Receipt
