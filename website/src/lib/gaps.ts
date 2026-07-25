/**
 * Critical Gaps: live from GitHub issues (label:gap).
 * Build-time fetch; public repo, no token required for read.
 * See docs/gaps-system/SKILL.md
 */

export const GITHUB_OWNER = 'identity-engineering';
export const GITHUB_REPO = 'framework';
export const GITHUB_ISSUES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues`;
export const PROPOSE_GAP_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new?template=gap.yml`;

export interface GapIssue {
	number: number;
	title: string;
	htmlUrl: string;
	state: 'open' | 'closed';
	body: string;
	description: string;
	impact: string;
	mitigation: string;
	labels: string[];
	area: string | null;
	priority: string | null;
	status: string | null;
	type: string | null;
	scope: string | null;
	pages: string[];
	updatedAt: string;
	createdAt: string;
}

interface GhLabel {
	name: string;
}

interface GhIssue {
	number: number;
	title: string;
	html_url: string;
	state: string;
	body: string | null;
	labels: (GhLabel | string)[];
	updated_at: string;
	created_at: string;
	pull_request?: unknown;
}

function labelNames(labels: (GhLabel | string)[]): string[] {
	return labels.map((l) => (typeof l === 'string' ? l : l.name));
}

function pickPrefixed(names: string[], prefix: string): string | null {
	const hit = names.find((n) => n.startsWith(prefix));
	return hit ? hit.slice(prefix.length) : null;
}

function pickAllPrefixed(names: string[], prefix: string): string[] {
	return names.filter((n) => n.startsWith(prefix)).map((n) => n.slice(prefix.length));
}

/**
 * Extract a markdown section. Supports ## and ### (GitHub issue forms use ###).
 */
function section(body: string, heading: string): string {
	const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const re = new RegExp(
		`#{2,6}\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n#{2,6}\\s+|$)`,
		'i',
	);
	const m = body.match(re);
	return m ? m[1].trim() : '';
}

/** Strip light markdown so issue bodies do not leak `**bold**` into public HTML. */
function plainText(md: string): string {
	return md
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1$2')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

/** First paragraph or short lead for card previews when sections are missing. */
function leadSnippet(body: string, max = 280): string {
	const text = body
		.replace(/^#{1,6}\s+.*$/gm, '')
		.replace(/\r\n/g, '\n')
		.trim();
	const para = text.split(/\n\s*\n/)[0] ?? text;
	const flat = plainText(para);
	if (flat.length <= max) return flat;
	return flat.slice(0, max - 1).trimEnd() + '…';
}

function normalizeIssue(raw: GhIssue): GapIssue | null {
	if (raw.pull_request) return null;
	const names = labelNames(raw.labels);
	if (!names.includes('gap')) return null;

	const body = raw.body ?? '';
	const description = plainText(section(body, 'Description') || leadSnippet(body));
	return {
		number: raw.number,
		title: raw.title.replace(/^\[Gap\]\s*/i, ''),
		htmlUrl: raw.html_url,
		state: raw.state === 'closed' ? 'closed' : 'open',
		body,
		description,
		impact: plainText(section(body, 'Impact')),
		mitigation: plainText(
			section(body, 'Mitigation / path forward') || section(body, 'Mitigation'),
		),
		labels: names,
		area: pickPrefixed(names, 'area:'),
		priority: pickPrefixed(names, 'priority:'),
		status: pickPrefixed(names, 'status:'),
		type: pickPrefixed(names, 'type:'),
		scope: pickPrefixed(names, 'scope:'),
		pages: pickAllPrefixed(names, 'page:'),
		updatedAt: raw.updated_at,
		createdAt: raw.created_at,
	};
}

/**
 * Fetch all gap issues (open + closed). Sorted: open first, then priority, then number.
 */
export async function fetchGapIssues(): Promise<GapIssue[]> {
	const url =
		`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues` +
		`?state=all&labels=gap&per_page=100&sort=created&direction=asc`;

	try {
		const res = await fetch(url, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'identity-engineering-website',
			},
		});
		if (!res.ok) {
			console.error(`[gaps] GitHub API ${res.status}`);
			return [];
		}
		const data = (await res.json()) as GhIssue[];
		const gaps = data.map(normalizeIssue).filter((g): g is GapIssue => g !== null);

		const pri = (p: string | null) =>
			p === 'high' ? 0 : p === 'medium' ? 1 : p === 'low' ? 2 : 3;

		gaps.sort((a, b) => {
			if (a.state !== b.state) return a.state === 'open' ? -1 : 1;
			const pd = pri(a.priority) - pri(b.priority);
			if (pd !== 0) return pd;
			return a.number - b.number;
		});

		return gaps;
	} catch (e) {
		console.error('[gaps] fetch failed', e);
		return [];
	}
}

export function gapsForPage(gaps: GapIssue[], pageSlug: string): GapIssue[] {
	return gaps.filter((g) => g.state === 'open' && g.pages.includes(pageSlug));
}

export function bigGaps(gaps: GapIssue[]): GapIssue[] {
	return gaps.filter((g) => g.type === 'big-gap');
}

export function openGaps(gaps: GapIssue[]): GapIssue[] {
	return gaps.filter((g) => g.state === 'open');
}

/**
 * Public website lists: exclude chore / internal tracker issues.
 * Title prefix "chore:" is the stable filter (no hard-coded issue numbers).
 */
export function publicGaps(gaps: GapIssue[]): GapIssue[] {
	return gaps.filter((g) => !g.title.toLowerCase().startsWith('chore:'));
}
