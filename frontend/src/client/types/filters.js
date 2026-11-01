/** @typedef {{value: string, label: string, count: number}} FilterOption */
/** @typedef {{value: string, label: string, hex: string, count: number}} ColorOption */
/** @typedef {{min: number, max: number}} PriceFacet */
/** @typedef {{gender: FilterOption[], categories: FilterOption[], price: PriceFacet, sizes: (FilterOption & {group: string})[], colors: ColorOption[], ratings: {min: number, count: number}[], discounts: {min: number, count: number}[], fabrics: FilterOption[], inStock: {count: number}} Facets */
/** @typedef {{gender?: string[], category?: string[], size?: string[], color?: string[], price?: [number, number], rating?: number, discount?: number, fabric?: string[], inStock?: boolean, sort?: string, page?: number, q?: string}} Filters */

export {};