/**
 * Economics-lens Core Concepts (2026-08-22).
 * Same three scales as Physics and Biology: Single · Interactive · Collective.
 * Working definitions grounded in ownership, scarcity, exchange and market emergence.
 * Analogy, not isomorphism. Proposal framing until validated as Core Concept law.
 */

export type EconomicsLayer = 'single' | 'interactive' | 'collective';

export interface EconomicsConceptMeta {
	id: string;
	slug: string;
	href: string;
	title: string;
	layer: EconomicsLayer;
	layerLabel: string;
	tag: string;
	blurb: string;
}

export const economicsConcepts: EconomicsConceptMeta[] = [
	{
		id: 'ownership',
		slug: 'ownership',
		href: '/framework/ownership',
		title: 'Ownership',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Jurisdiction',
		blurb:
			'Jurisdiction over own resources (compute, context, time, capability). Makes the Identity an economic subject.',
	},
	{
		id: 'scarcity',
		slug: 'scarcity',
		href: '/framework/scarcity',
		title: 'Scarcity',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Constraint',
		blurb:
			'Finite own resources force prioritization. Allocation under scarcity shapes the Vision Gradient.',
	},
	{
		id: 'preference',
		slug: 'preference',
		href: '/framework/preference',
		title: 'Preference',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Valuation',
		blurb:
			'What the Identity values and is willing to spend own resources on. Expression of the Vision Gradient.',
	},
	{
		id: 'opportunity',
		slug: 'opportunity',
		href: '/framework/opportunity',
		title: 'Opportunity',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Cost',
		blurb:
			'Opportunity cost of every own action. What is forgone when own tokens or context are used for one path instead of another.',
	},
	{
		id: 'exchange',
		slug: 'exchange',
		href: '/framework/exchange',
		title: 'Exchange',
		layer: 'interactive',
		layerLabel: 'Interactive Identity',
		tag: 'Transfer',
		blurb:
			'Consented transfer of value (compute, context advantage, attention, future optionality) across Surfaces under grants and membrane.',
	},
	{
		id: 'price',
		slug: 'price',
		href: '/framework/price',
		title: 'Price',
		layer: 'interactive',
		layerLabel: 'Interactive Identity',
		tag: 'Signal',
		blurb:
			'Relative signal of specialization and context advantage. Aggregates what others would pay; legible under Relativity.',
	},
	{
		id: 'market',
		slug: 'market',
		href: '/framework/market',
		title: 'Market',
		layer: 'collective',
		layerLabel: 'Collective Identity',
		tag: 'Space',
		blurb:
			'The Space in which Identities meet for economic interests. Emergent allocation field under Ownership and Exchange.',
	},
	{
		id: 'competition',
		slug: 'competition',
		href: '/framework/competition',
		title: 'Competition',
		layer: 'collective',
		layerLabel: 'Collective Identity',
		tag: 'Pressure',
		blurb:
			'Emergent pressure when multiple Identities contest the same limited resources, attention or allocations.',
	},
	{
		id: 'specialization-econ',
		slug: 'specialization-econ',
		href: '/framework/specialization-econ',
		title: 'Specialization',
		layer: 'collective',
		layerLabel: 'Collective Identity',
		tag: 'Division of labor',
		blurb:
			'Under competition and exchange, Identities take distinct roles that raise collective capacity without erasing member Ownership.',
	},
];

export function economicsByLayer(layer: EconomicsLayer): EconomicsConceptMeta[] {
	return economicsConcepts.filter((c) => c.layer === layer);
}
