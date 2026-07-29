# Migration plan: static Critical Gaps → GitHub Issues

Status: planned (feature branch `feature/gaps-as-github-issues`)

## Goal

Replace the hardcoded gap list in `website/src/pages/critical-gaps.astro` with live GitHub issues (`label:gap`), without losing content or public transparency.

## Principles

1. **Content parity first**: every current static gap becomes an issue before the page goes live on issues-only data.
2. **Labels before UI**: taxonomy and template exist before bulk creation.
3. **No sub-issues**: use `type:big-gap` for major themes; link related issues in the body.
4. **One-way cutover**: after verification, remove static gap arrays from the Astro page.

## Phase 0: Prep (this PR)

- [x] Document system in `docs/gaps-system/SKILL.md`
- [x] Canonical labels in `docs/gaps-system/LABELS.md`
- [x] Issue template `.github/ISSUE_TEMPLATE/gap.yml`
- [x] This migration plan
- [ ] Create all labels in the GitHub repo UI (or API)
- [ ] Confirm CONTRIBUTING.md points to gap template

## Phase 1: Create labels in GitHub

Create every label listed in `LABELS.md`.

Suggested order: `gap` → areas → priorities → statuses → types → scopes → pages.

## Phase 2: Map static gaps → issues

Source: `website/src/pages/critical-gaps.astro` (groups array).

For each static gap, open one issue with:

- Title = static `title`
- Body = Description / Impact / Mitigation (from static fields)
- Labels mapped as follows

### Group → area

| Static group id | `area:*` |
|-----------------|----------|
| conceptual | `area:conceptual` |
| mathematical | `area:mathematical` |
| practical | `area:practical` |
| accessibility | `area:audience` |
| structural | `area:process` |

### Status string → labels

| Static status / tone | Labels |
|----------------------|--------|
| Open · High Priority / tone high | `priority:high` |
| Open · Medium Priority / tone medium | `priority:medium` |
| Open · Active Review / Active Work / tone active | `priority:high` or `priority:medium` + `status:active-review` |
| Acknowledged · Future Work / tone future | `priority:low` + `status:future` |
| Accepted · Made Transparent / tone accepted | `status:accepted` |
| Managed · Living Framework / tone managed | `status:managed` |

### Big gaps

Mark thematic, high-impact items as `type:big-gap`. Initial candidates:

- Category error via physics metaphors
- Representation and definition of ownership in the framework
- Lack of concrete engineering practice & measurability
- Dependency on a single contested scientific foundation (Wissner-Gross)
- Imprecise formalization
- Embodied identity as unmodeled dimension

(Adjust after a single pass; prefer fewer big gaps over many.)

### Page labels (initial heuristic)

| Gap theme | Suggested `page:*` |
|-----------|---------------------|
| Ownership definition | `page:ownership`, `page:time`, `page:framework` |
| Physics metaphors / isomorphism | `page:framework`, `page:foundations` |
| Formalization / force-object mismatch | `page:time`, `page:framework` |
| Probes / method maturity | `page:method`, `page:practical` if exists: use `page:method` |
| Embodiment | `page:framework`, `page:foundations` |
| Relational / collective | `page:gravitation`, `page:framework` |
| Wissner-Gross dependency | `page:foundations`, `page:framework` |

Refine page labels when per-page sections ship.

### Scope

Default `scope:dual` unless clearly human-only or substrate-only.

## Phase 3: Inventory checklist

After creation, verify:

- [ ] Issue count ≥ number of static gaps in `critical-gaps.astro`
- [ ] Every issue has `gap` + `area:*` + `priority:*`
- [ ] Big-gap set reviewed
- [ ] No duplicate titles
- [ ] Links from issue bodies to relevant PRs/docs where known (Ownership blog PR, Particles PR, etc.)

Export a simple table (issue number → old title) into a comment on a tracking issue titled `chore: gaps migration tracker` with labels `gap` + `page:critical-gaps` + `status:managed`.

## Phase 4: Website fetch layer

1. Add a small module to list issues by label (GitHub REST Search or list issues).
2. Rebuild `/critical-gaps` to render from issues (open by default; filters client or server side).
3. Add `<GapsSection page="…" />` component.
4. Mount sections on framework concept pages (start with Time, Mass, Framework hub).
5. Add **Propose a gap** CTA (URL to template).

Keep static content as fallback behind a flag until Phase 5.

## Phase 5: Cutover

1. Compare side-by-side static vs live for one release candidate.
2. Remove `groups` array and static gap UI from `critical-gaps.astro`.
3. Document in CHANGELOG / site note: "Critical Gaps are now tracked as GitHub issues."
4. Close the migration tracker issue with a summary.

## Phase 6: Hygiene (ongoing)

- New gaps only via template
- Close issues when resolved; short resolution comment required
- Periodically review `status:accepted` and `status:managed`
- Do not reintroduce hardcoded gap lists

## Out of scope for this migration

- GitHub sub-issues / parent-child trees
- Projects v2 as website backend
- Automatic Notion sync
- Private gaps (none for public framework limitations)

## Success criteria

- [ ] All former static gaps exist as issues
- [ ] `/critical-gaps` is issue-driven
- [ ] At least one per-page gaps section live
- [ ] Public can open a gap without maintainer pre-edit of site code
- [ ] `docs/gaps-system/SKILL.md` is the agent/human operating guide
