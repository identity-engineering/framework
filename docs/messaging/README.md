# Identity-Native Messaging Layer

**Status:** Phase 2 – Data Model (in progress)  
**Related Gap:** [#102](https://github.com/identity-engineering/framework/issues/102)  
**OS Tracking:** [identity-engineering/os#107](https://github.com/identity-engineering/os/issues/107)

This directory holds the conceptual and data-model specifications for the Identity-Native Messaging Layer.

## Framework alignment (current)

- **Three scales only:** Single · Interactive · Collective
- **Two lenses:** Physics (geometry) and Biology (living form)

Biology concepts used by this layer:

- Interactive: Signal → Recognition → Coupling
- Single: Metabolism (information pathway)
- Collective: Multicellularity → Specialization → Regulation

## Documents

| File | Content | Phase |
|------|---------|-------|
| [01-identity-card.md](./01-identity-card.md) | Identity Card concept | 1 |
| [02-message-model.md](./02-message-model.md) | Signal / Payload, Envelope, Addressing | 1 |
| [03-decision-and-metabolization.md](./03-decision-and-metabolization.md) | Decision layers, Metabolism | 1 |
| [04-biology-operationalization.md](./04-biology-operationalization.md) | Biology lens operationalized | 1 |
| [05-open-questions.md](./05-open-questions.md) | Open questions → **Accepted** | 1 |
| [06-identity-card-schema.md](./06-identity-card-schema.md) | Identity Card JSON Schema v0.1 | 2 |
| [07-message-envelope-schema.md](./07-message-envelope-schema.md) | Envelope + Payload + Receipt Schema v0.1 | 2 |

## Design Principles (binding for all phases)

1. **Build on existing standards** – A2A, MCP, and production agent runtimes are not replaced. IE sits on top.
2. **Server as router** – Envelope is visible for routing and policy; Payload is under Ownership control.
3. **Local-first + Managed** – Every capability must work in a pure local Space; Managed Space is optional federation.
4. **Causal Entropic Forces** – No message may silently reduce the future freedom of any participating Identity.
5. **Feature-branch + explicit approval** – Nothing merges to `main` without explicit user approval.

## Phase status

- **Phase 1** (Conceptual Primitives) – complete
- **Phase 2** (Data Model & Protocol Extension) – in progress (schemas v0.1 drafted)
- **Phase 3** (Local Messaging Service) – next
