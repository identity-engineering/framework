/**
 * Biology-lens Core Concepts (2026-08-03).
 * Same three scales as physics: Single · Interactive · Collective.
 * Science-first names; pedagogical order within each scale.
 */
import type { ConceptScene } from './concepts';

export type BiologyLayer = 'single' | 'interactive' | 'collective';

export interface BiologyConceptMeta {
	id: string;
	slug: string;
	href: string;
	title: string;
	layer: BiologyLayer;
	layerLabel: string;
	tag: string;
	blurb: string;
	scene?: ConceptScene;
}

export const biologyConcepts: BiologyConceptMeta[] = [
	{
		id: 'gene',
		slug: 'gene',
		href: '/framework/gene',
		title: 'Gene',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Genetics',
		blurb:
			'Heritable founding configuration passed to a new Identity. Not the Identity Stem.',
		scene: 'gene',
	},
	{
		id: 'boundary',
		slug: 'boundary',
		href: '/framework/boundary',
		title: 'Boundary',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Membrane',
		blurb:
			'Membrane condition: maintained interior under selective exchange. Prerequisite of Cell.',
	},
	{
		id: 'cell',
		slug: 'cell',
		href: '/framework/cell',
		title: 'Cell',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Living unit',
		blurb:
			'The living unit that integrates Gene and Boundary and exists as its own form.',
	},
	{
		id: 'metabolism',
		slug: 'metabolism',
		href: '/framework/metabolism',
		title: 'Metabolism',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Process',
		blurb:
			'Process of the Cell: sustain, transform, prepare exchange with other units.',
	},
	{
		id: 'signal',
		slug: 'signal',
		href: '/framework/signal',
		title: 'Signal',
		layer: 'interactive',
		layerLabel: 'Interactive Identity',
		tag: 'Exchange',
		blurb:
			'Elementary exchange event between living units across boundaries.',
	},
	{
		id: 'recognition',
		slug: 'recognition',
		href: '/framework/recognition',
		title: 'Recognition',
		layer: 'interactive',
		layerLabel: 'Interactive Identity',
		tag: 'Discrimination',
		blurb:
			'Classify and admit or refuse at the boundary. Interactive face of membrane policy.',
	},
	{
		id: 'coupling',
		slug: 'coupling',
		href: '/framework/coupling',
		title: 'Coupling',
		layer: 'interactive',
		layerLabel: 'Interactive Identity',
		tag: 'Relation',
		blurb:
			'Sustained structural or functional link between units. Bridge to Collective.',
	},
	{
		id: 'multicellularity',
		slug: 'multicellularity',
		href: '/framework/multicellularity',
		title: 'Multicellularity',
		layer: 'collective',
		layerLabel: 'Collective Identity',
		tag: 'Higher-order form',
		blurb:
			'Higher-order living system from organized, coupled Cells. Not a pile of pairs.',
	},
	{
		id: 'specialization',
		slug: 'specialization',
		href: '/framework/specialization',
		title: 'Specialization',
		layer: 'collective',
		layerLabel: 'Collective Identity',
		tag: 'Division of labor',
		blurb:
			'Member Cells take distinct roles for the whole without leaving the collective form.',
	},
	{
		id: 'regulation',
		slug: 'regulation',
		href: '/framework/regulation',
		title: 'Regulation',
		layer: 'collective',
		layerLabel: 'Collective Identity',
		tag: 'Coordination',
		blurb:
			'Multi-speed coordination and damping of the specialized whole without erasing members.',
	},
];

export function biologyByLayer(layer: BiologyLayer): BiologyConceptMeta[] {
	return biologyConcepts.filter((c) => c.layer === layer);
}
