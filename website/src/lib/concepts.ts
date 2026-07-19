/**
 * Official Framework structure (Notion Core Concepts, 2026-07-18).
 * Single Identity → Interactive Identity.
 */
export type ConceptScene =
	| 'stem'
	| 'mass'
	| 'curvature'
	| 'rotation'
	| 'gravitation'
	| 'probes';

export type ConceptId =
	| 'time'
	| 'mass'
	| 'curvature'
	| 'rotation'
	| 'gravitation'
	| 'relativity';

export interface ConceptMeta {
	id: ConceptId;
	slug: string;
	href: string;
	title: string;
	shortTitle: string;
	layer: 'single' | 'interactive';
	layerLabel: string;
	tag: string;
	scene: ConceptScene;
	blurb: string;
	scrollHint: string;
}

export const concepts: ConceptMeta[] = [
	{
		id: 'time',
		slug: 'time',
		href: '/framework/time',
		title: 'Time: Identity Stem',
		shortTitle: 'Time',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Foundational',
		scene: 'stem',
		blurb:
			'The Identity Stem only exists through State Differential (past to present) and Vision Gradient (present to future). Time is the foundation that makes the stem possible.',
		scrollHint: 'Scroll: fibers rise past → present → future.',
	},
	{
		id: 'mass',
		slug: 'mass',
		href: '/framework/mass',
		title: 'Mass',
		shortTitle: 'Mass',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Geometry',
		scene: 'mass',
		blurb:
			'Substance and depth built around the stem. Not volume: density and weight. The stake you own.',
		scrollHint: 'Scroll to densify. Rest potential becomes agency under coherent velocity.',
	},
	{
		id: 'curvature',
		slug: 'curvature',
		href: '/framework/curvature',
		title: 'Curvature',
		shortTitle: 'Curvature',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Geometry',
		scene: 'curvature',
		blurb:
			'How stem, mass, and coherent vision warp possibility space: what looks near, far, inevitable, or impossible.',
		scrollHint: 'Scroll to deepen the well. Shape of distortion, not yet the pull of others.',
	},
	{
		id: 'rotation',
		slug: 'rotation',
		href: '/framework/rotation',
		title: 'Rotation',
		shortTitle: 'Rotation',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Dynamics',
		scene: 'rotation',
		blurb:
			'Gyroscopic stability of the stem. Habits act as tangential force: structure and substance without destabilizing the axis.',
		scrollHint: 'Scroll: slow spin wobbles; faster spin locks the axis.',
	},
	{
		id: 'gravitation',
		slug: 'gravitation',
		href: '/framework/gravitation',
		title: 'Gravitation',
		shortTitle: 'Gravitation',
		layer: 'interactive',
		layerLabel: 'Interactive Identity',
		tag: 'Force',
		scene: 'gravitation',
		blurb:
			'Attraction from the curvature of a high-mass vision. The first force between two or more identities.',
		scrollHint: 'Scroll to increase pull. Curvature is the bend; Gravitation is what is pulled in.',
	},
	{
		id: 'relativity',
		slug: 'relativity',
		href: '/framework/relativity',
		title: 'Relativity',
		shortTitle: 'Relativity',
		layer: 'interactive',
		layerLabel: 'Interactive Identity',
		tag: 'Relation',
		scene: 'probes',
		blurb:
			'Identity exists only in relation to another observing identity. This is the bridge from single to interactive.',
		scrollHint: 'Scroll: measurement state. Continuity is observed through change.',
	},
];

export function getConcept(id: ConceptId): ConceptMeta {
	const c = concepts.find((x) => x.id === id);
	if (!c) throw new Error(`Unknown concept: ${id}`);
	return c;
}

export function neighbors(id: ConceptId): { prev: ConceptMeta | null; next: ConceptMeta | null } {
	const i = concepts.findIndex((x) => x.id === id);
	return {
		prev: i > 0 ? concepts[i - 1] : null,
		next: i >= 0 && i < concepts.length - 1 ? concepts[i + 1] : null,
	};
}
