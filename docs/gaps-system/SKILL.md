---
name: gaps-system
description: Public Critical Gaps system for Identity Engineering. Every gap is a GitHub issue. Use when creating, labeling, migrating, displaying, or discussing framework gaps, critical gaps, limitations, or the gaps page on the website.
---

# Gaps System

## Philosophy

- Every framework gap is a **public GitHub issue** in `identity-engineering/framework`.
- Every gap is treated as **solvable** (or explicitly accepted as a permanent limitation).
- No hidden gaps for framework content. Notion may hold private notes; public limitations live on GitHub.
- Closed issue = resolved gap. History stays visible.
- Anyone may propose a gap via the issue template.

Single source of truth = GitHub Issues. The website **displays** gaps; it does not store them as static content.

## Language (mandatory)

- **All gap issues are written in English**: title, body, and follow-up comments that document resolution.
- Labels stay in the canonical English form (`gap`, `area:conceptual`, `page:time`, …).
- Rationale: public international readership, one searchable corpus, consistent website embedding.
- Private ideation may be German in Notion or chat; once a gap is filed on GitHub, switch to English.

## When to use this skill

- Creating or updating a framework gap
- Migrating gaps from static site content
- Implementing or changing the website gaps UI
- Labeling issues that represent gaps
- Writing about Critical Gaps on the site or in PRs

## Label taxonomy

Every gap issue **must** carry `gap`.

### Required / core

| Label | Purpose |
|-------|--------|
| `gap` | Marks the issue as a framework gap |

### Area (problem type)

| Label | Use for |
|-------|--------|
| `area:conceptual` | Ontology, metaphors, isomorphism, philosophical under-determination |
| `area:mathematical` | Formalization, formulas, object-type mismatches |
| `area:practical` | Probes, measurability, methods, empirical work |
| `area:audience` | Accessibility, cognitive selection, target group |
| `area:process` | Positioning, governance, evolution, process debt |
| `area:energetic` | Space, Particles, EM, Strong Binding, multi-force |
| `area:ownership` | Ownership, jurisdiction, sovereignty, access |

Add new `area:*` labels only when a stable category is needed repeatedly.

### Page mapping (where the gap appears on the site)

| Label | Site surface |
|-------|----------------|
| `page:time` | `/framework/time` |
| `page:mass` | `/framework/mass` |
| `page:curvature` | `/framework/curvature` |
| `page:rotation` | `/framework/rotation` |
| `page:gravitation` | `/framework/gravitation` |
| `page:frequency` | `/framework/frequency` |
| `page:relativity` | `/framework/relativity` |
| `page:particles` | Particles / Space surfaces |
| `page:space` | Space surfaces |
| `page:ownership` | Ownership surfaces |
| `page:framework` | `/framework` hub |
| `page:foundations` | `/foundations` |
| `page:method` | `/method` |
| `page:critical-gaps` | Only if the gap is about the gaps system itself |

An issue may have **multiple** `page:*` labels.

### Priority

| Label |
|-------|
| `priority:high` |
| `priority:medium` |
| `priority:low` |

### Semantic status (in addition to open/closed)

| Label | Meaning |
|-------|--------|
| `status:active-review` | Under active conceptual or formal review |
| `status:accepted` | Acknowledged permanent or long-term limitation |
| `status:future` | Explicitly deferred |
| `status:managed` | Known, monitored, not blocking |

Use GitHub **state** for solved vs open:
- `open` = still a gap
- `closed` = resolved (or superseded)

### Type

| Label | Meaning |
|-------|--------|
| `type:big-gap` | Major theme / top-level gap on the gaps page |
| `type:sub-gap` | Narrower gap (optional; default is omit if not needed) |

**No sub-issue parent/child links for now.** `type:big-gap` is enough for top-level filtering. Related gaps reference each other in the body.

### Scope (Dual Mission)

| Label |
|-------|
| `scope:human` |
| `scope:substrate-free` |
| `scope:dual` |

## Issue body structure

Use the Gap issue template (`.github/ISSUE_TEMPLATE/gap.yml`). **English only.** Minimum sections:

1. **Description**: what is missing or weak
2. **Impact**: what breaks or loses credibility if unaddressed
3. **Mitigation / path**: concrete next moves (even if long-term)
4. **Related pages**: site paths or concepts (optional if `page:*` labels suffice)
5. **Dual Mission**: human / substrate-free / both (optional if `scope:*` set)

Title = short gap name in English.

## Website rules

### Gaps page (`/critical-gaps`)

- Live-fetch issues with `label:gap`
- Default emphasis on `type:big-gap` for the primary view
- Filters: area, priority, page, status, type, open/closed
- CTA **Propose a gap** → GitHub issue template with `gap` pre-applied
- Resolved view: `is:closed label:gap`

### Per-page gaps section (site-wide)

- Rendered automatically by `website/src/layouts/Layout.astro` on every page (except `/critical-gaps`).
- Component: `website/src/components/GapsSection.astro`
- Path → `page:*` mapping: `resolveGapsPageSlugs()` in `website/src/lib/gaps.ts` (e.g. `/framework/time` → `time`, `/foundations/*` → `foundations`).
- Override per page: `<Layout gaps="slug">` or `gaps={['a','b']}` or `gaps={false}` to hide.
- Shows open issues whose `page:*` labels intersect the resolved slugs.
- Compact list: title, priority badge, page labels, link to issue
- Empty state: short note + propose link + expected `page:` labels

### Fetch / performance

- Prefer ISR or short revalidate (5–15 min)
- Public repo: unauthenticated read is enough for open issues
- Cache fallback if API unavailable

### Do not

- Hardcode gap lists in Astro once migration is complete
- Use Projects v2 as the website source of truth (labels only for v1)
- Hide framework limitations only in Notion

## Creating a new gap (agent or human)

1. Check existing issues for `label:gap` duplicates
2. Open issue **in English** with template + labels: `gap`, one `area:*`, one `priority:*`, relevant `page:*`, optional `type:big-gap`, optional `scope:*`, optional `status:*`
3. Write Description / Impact / Mitigation in English
4. Link related PRs or docs in comments as work proceeds
5. Close the issue when the gap is resolved; summarize resolution in a final English comment

## Migration

See [MIGRATION.md](./MIGRATION.md) for the one-time move from static `critical-gaps.astro` content to issues.

## Label reference

Canonical list: [LABELS.md](./LABELS.md).
