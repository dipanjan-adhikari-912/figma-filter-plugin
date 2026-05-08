export const FILTER_CATEGORIES = [
  "Color & Tone",
  "Noise & Distort",
  "Sharpen",
  "Blur",
  "Water",
  "Stylize",
  "Retro",
  "Geometry",
  "Utility"
] as const;

export type FilterCategory = (typeof FILTER_CATEGORIES)[number];

export type FilterId = string;

export interface FilterDescriptor {
  id: FilterId;
  name: string;
  category: FilterCategory;
  description: string;
  premium?: boolean;
}
