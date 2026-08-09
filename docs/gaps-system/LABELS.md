# Gap label reference

Canonical labels for framework gaps in `identity-engineering/framework`.

Create these labels in the repo (color suggestions optional).

## Core

| Name | Color hint | Description |
|------|------------|-------------|
| `gap` | `#0E8A16` | Framework critical gap / limitation |

## Area

| Name | Description |
|------|-------------|
| `area:conceptual` | Conceptual and ontological gaps |
| `area:mathematical` | Mathematical and formal gaps |
| `area:practical` | Practical and operationalization gaps |
| `area:audience` | Accessibility and audience gaps |
| `area:process` | Structural and process gaps |
| `area:energetic` | Space, particles, forces, energy forms |
| `area:ownership` | Ownership, jurisdiction, sovereignty |

## Page

**One unique `page:*` label per site URL.** Do not reuse a parent hub label for every child page. If a gap is relevant to several pages, put **multiple** `page:*` labels on the same issue.

Slug = unique path leaf (or hub name). Website mapping: `resolveGapsPageSlug()` in `website/src/lib/gaps.ts`.

| Name | Site URL |
|------|----------|
| `page:home` | `/` |
| `page:framework` | `/framework` |
| `page:time` | `/framework/time` |
| `page:mass` | `/framework/mass` |
| `page:curvature` | `/framework/curvature` |
| `page:rotation` | `/framework/rotation` |
| `page:gravitation` | `/framework/gravitation` |
| `page:frequency` | `/framework/frequency` |
| `page:relativity` | `/framework/relativity` |
| `page:emergent` | `/framework/emergent` |
| `page:damping` | `/framework/damping` |
| `page:foundations` | `/foundations` (hub only) |
| `page:locke-personal-identity` | `/foundations/locke-personal-identity` (example leaf) |
| `page:ontology` | `/ontology` |
| `page:os` | `/os` (canonical OS public face) |
| `page:method` | legacy alias for `/method` → redirects to `/os`; prefer `page:os` on new issues |
| `page:blog` | `/blog` |
| `page:particles-of-identity` | `/blog/particles-of-identity` |
| `page:ownership-as-relative-jurisdiction` | `/blog/ownership-as-relative-jurisdiction` |
| `page:energy-forms-of-identity` | `/blog/energy-forms-of-identity` |
| `page:big-questions` | `/big-questions` |
| `page:identity-stem` | `/identity-stem` |
| `page:critical-gaps` | About the gaps system itself |

Create additional `page:<leaf-slug>` labels as new public pages ship. Prefer the path leaf over a shared parent label.

Legacy short labels still in use on some issues (`page:ownership`, `page:particles`, `page:space`): migrate to path-unique slugs when touching those issues, or dual-label during transition.

## Priority

| Name |
|------|
| `priority:high` |
| `priority:medium` |
| `priority:low` |

## Status

| Name | Description |
|------|-------------|
| `status:active-review` | Under active review |
| `status:accepted` | Accepted limitation |
| `status:future` | Deferred / future work |
| `status:managed` | Monitored living issue |

## Type

| Name | Description |
|------|-------------|
| `type:big-gap` | Major theme on the gaps page |
| `type:sub-gap` | Narrower gap (optional) |

## Scope

| Name |
|------|
| `scope:human` |
| `scope:substrate-free` |
| `scope:dual` |

## Rules

- Every gap issue must include `gap`.
- Prefer one `area:*` and one `priority:*`.
- Add all relevant `page:*` labels so per-page sections stay accurate.
- Do not encode long status narratives in labels; use the issue body and comments.
