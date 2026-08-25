/**
 * Economics-lens Core Concepts (2026-08-22).
 * Same three scales as Physics and Biology: Single · Interactive · Collective.
 * Single order: Scarcity → Ownership → Preference → Opportunity.
 * Scarcity is relative finitude weighted by Mass; Ownership clarifies whose scarcity.
 * Analogy, not isomorphism.
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
		id: 'scarcity',
		slug: 'scarcity',
		href: '/framework/scarcity',
		title: 'Scarcity',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Constraint',
		blurb:
			'Relative finitude of degrees of freedom and causal options, weighted by Mass. What makes allocation and value possible.',
	},
	{
		id: 'ownership',
		slug: 'ownership',
		href: '/framework/ownership',
		title: 'Ownership',
		layer: 'single',
		layerLabel: 'Single Identity',
		tag: 'Jurisdiction',
		blurb:
			'Relative jurisdiction that clarifies whose scarcity. Makes the Identity an economic subject under constraint.',
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
			'What the Identity values and is willing to allocate under scarcity. Expression of the Vision Gradient.',
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
			'Opportunity cost of every allocation under scarcity. What is forgone when degrees of freedom are committed to one path.',
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
			'Emergent pressure when multiple Identities contest the same limited degrees of freedom, attention or allocations.',
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
