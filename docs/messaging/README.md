# Identity-Native Messaging Layer

**Status:** Phase 1 – Conceptual Primitives (in progress)  
**Related Gap:** [#102](https://github.com/identity-engineering/framework/issues/102)  
**OS Tracking:** [identity-engineering/os#107](https://github.com/identity-engineering/os/issues/107)

This directory holds the conceptual and data-model specifications for the Identity-Native Messaging Layer.

## Framework alignment (current)

- Three scales: **Single · Interactive · Collective**
- Two lenses: **Physics** (geometry) and **Biology** (living form)
- **Living Identity** = operational scaffold under both lenses (metabolizes geometry through Interaction; hub to OS)

Biology concepts used by this layer:

- Interactive: Signal → Recognition → Coupling
- Single: Metabolism (information pathway)
- Collective: Multicellularity → Specialization → Regulation

## Documents

| File | Content |
|------|---------|
| [01-identity-card.md](./01-identity-card.md) | Identity Card (extension of A2A Agent Card) |
| [02-message-model.md](./02-message-model.md) | Signal / Payload, Envelope, Addressing, Receipts |
| [03-decision-and-metabolization.md](./03-decision-and-metabolization.md) | Decision layers, Operating Cycle hooks, Metabolism |
| [04-living-operationalization.md](./04-living-operationalization.md) | Biology lens + Living scaffold operationalized for messaging |

## Design Principles (binding for all phases)

1. **Build on existing standards** – A2A, MCP, and production agent runtimes are not replaced. IE sits on top.
2. **Server as router** – Envelope is visible for routing and policy; Payload is under Ownership control.
3. **Local-first + Managed** – Every capability must work in a pure local Space; Managed Space is optional federation.
4. **Causal Entropic Forces** – No message may silently reduce the future freedom of any participating Identity.
5. **Feature-branch + explicit approval** – Nothing merges to `main` without explicit user approval.

## Current Phase Goal

Produce the minimal set of primitives so that Phase 2 (Data Model & Protocol Extension) and Phase 3 (Local Messaging Service) can start with a stable conceptual foundation.
