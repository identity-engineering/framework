# 06 – Identity Card Schema (v0.1)

**Status:** Draft (Phase 2)  
**Extends:** A2A Agent Card (compatible, additive)

An Identity Card is the public, signed declaration of an Identity that the Messaging Service and other Identities use for discovery, Recognition, and routing.

## JSON Schema (draft-07 style)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://identity-engineering.org/schemas/identity-card-v0.1.json",
  "title": "IdentityCard",
  "type": "object",
  "required": ["identityId", "name", "type", "version", "endpoints"],
  "properties": {
    "identityId": {
      "type": "string",
      "description": "Primary opaque UUID v7",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
    },
    "did": {
      "type": "string",
      "description": "Optional secondary DID",
      "pattern": "^did:[a-z0-9]+:.+$
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 128
    },
    "type": {
      "type": "string",
      "enum": ["human", "agent", "collective", "hybrid"]
    },
    "version": {
      "type": "string",
      "const": "0.1"
    },
    "description": {
      "type": "string",
      "maxLength": 1024
    },
    "ownerIdentityId": {
      "type": "string",
      "description": "For agent / hybrid: the owning human or collective Identity"
    },
    "scope": {
      "type": "string",
      "enum": ["personal", "project", "team", "org", "collective"],
      "description": "Primary operational scope of this Identity"
    },
    "endpoints": {
      "type": "object",
      "required": ["messaging"],
      "properties": {
        "messaging": {
          "type": "string",
          "format": "uri",
          "description": "Primary messaging endpoint (local or managed)"
        },
        "a2a": {
          "type": "string",
          "format": "uri",
          "description": "Optional A2A Agent Card / endpoint URL"
        },
        "mcp": {
          "type": "string",
          "format": "uri"
        }
      },
      "additionalProperties": false
    },
    "frequencySignature": {
      "type": "object",
      "properties": {
        "preferred": {
          "type": "array",
          "items": { "type": "string" }
        },
        "accepted": {
          "type": "array",
          "items": { "type": "string" }
        },
        "rejected": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "additionalProperties": false
    },
    "causalEntropyConstraints": {
      "type": "object",
      "properties": {
        "requireExplicitConsentFor": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["mass-altering", "stem-altering"]
          }
        },
        "maxAutomaticImpact": {
          "type": "string",
          "enum": ["none", "low", "medium"]
        }
      },
      "additionalProperties": false
    },
    "recognitionPolicy": {
      "type": "object",
      "description": "High-level public policy hints (full policy stays private)",
      "properties": {
        "default": {
          "type": "string",
          "enum": ["accept-known", "accept-all", "reject-unknown", "manual"]
        },
        "allowlist": {
          "type": "array",
          "items": { "type": "string" },
          "description": "identityIds or DIDs"
        },
        "blocklist": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "additionalProperties": false
    },
    "regulation": {
      "type": "object",
      "description": "Only for type=collective",
      "properties": {
        "routing": {
          "type": "string",
          "enum": ["fan-out", "specialist", "central"]
        },
        "specialists": {
          "type": "array",
          "items": { "type": "string" }
        },
        "damping": {
          "type": "object",
          "properties": {
            "maxMessagesPerWindow": { "type": "integer", "minimum": 1 },
            "windowSeconds": { "type": "integer", "minimum": 1 }
          }
        }
      },
      "additionalProperties": false
    },
    "capabilities": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "contentTypes": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      },
      "description": "Optional capability advertisement (A2A-compatible)"
    },
    "signature": {
      "type": "object",
      "description": "Optional cryptographic signature over the card",
      "properties": {
        "alg": { "type": "string" },
        "keyId": { "type": "string" },
        "value": { "type": "string" }
      }
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "additionalProperties": false
}
```

## Compatibility notes

- An existing A2A Agent Card can be wrapped: map `name`, `url` → `endpoints.a2a`, keep A2A fields in a parallel store or under `capabilities`.
- IE Messaging never requires an A2A endpoint; `endpoints.messaging` is sufficient.
- Local Spaces may omit `signature` and `did`.

## Example (minimal agent)

```json
{
  "identityId": "018f3a2b-7c9e-7d01-8a2b-3c4d5e6f7890",
  "name": "coding-agent-jonas-01",
  "type": "agent",
  "version": "0.1",
  "ownerIdentityId": "018f3a2b-7c9e-7d01-8a2b-000000000001",
  "scope": "personal",
  "endpoints": {
    "messaging": "http://127.0.0.1:7420/messaging"
  },
  "frequencySignature": {
    "preferred": ["async", "task"],
    "accepted": ["async", "task", "signal-only"],
    "rejected": ["sync-blocking"]
  },
  "causalEntropyConstraints": {
    "requireExplicitConsentFor": ["mass-altering", "stem-altering"],
    "maxAutomaticImpact": "low"
  },
  "recognitionPolicy": {
    "default": "accept-known"
  },
  "updatedAt": "2026-08-24T18:00:00Z"
}
```
