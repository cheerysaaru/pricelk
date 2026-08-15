import type { AttributeDef } from "@/lib/types";

export interface CategoryDef {
  slug: string;
  name: string;
  description: string;
  /** Category-aware attribute filters (brand + price are universal). */
  filters: AttributeDef[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "phones",
    name: "Phones",
    description: "Smartphones from verified Sri Lankan retailers.",
    filters: [
      { key: "ram", label: "RAM", options: [] },
      { key: "storage", label: "Storage", options: [] },
      { key: "colour", label: "Colour", options: [] },
    ],
  },
  {
    slug: "laptops",
    name: "Laptops",
    description: "Laptops and notebooks.",
    filters: [
      { key: "ram", label: "RAM", options: [] },
      { key: "storage", label: "Storage", options: [] },
      { key: "processor", label: "Processor", options: [] },
      { key: "gpu", label: "GPU", options: [] },
      { key: "screen", label: "Screen", options: [] },
      { key: "os", label: "Operating System", options: [] },
    ],
  },
  {
    slug: "tvs",
    name: "TVs",
    description: "Televisions of every size and panel type.",
    filters: [
      { key: "screen", label: "Screen Size", options: [] },
      { key: "resolution", label: "Resolution", options: [] },
    ],
  },
  {
    slug: "headphones",
    name: "Headphones",
    description: "Wireless and wired audio.",
    filters: [
      { key: "type", label: "Type", options: [] },
      { key: "connectivity", label: "Connectivity", options: [] },
    ],
  },
  {
    slug: "appliances",
    name: "Home Appliances",
    description: "Washing machines, refrigerators and kitchen appliances.",
    filters: [
      { key: "capacity", label: "Capacity", options: [] },
      { key: "type", label: "Type", options: [] },
    ],
  },
  {
    slug: "milk-powder",
    name: "Milk Powder",
    description: "Everyday milk powder from Sri Lankan stores.",
    filters: [
      { key: "weight", label: "Weight", options: [] },
      { key: "type", label: "Type", options: [] },
      { key: "pack", label: "Pack", options: [] },
    ],
  },
  {
    slug: "rice",
    name: "Rice",
    description: "Rice by the kilo from Sri Lankan retailers.",
    filters: [
      { key: "weight", label: "Weight", options: [] },
      { key: "type", label: "Type", options: [] },
    ],
  },
  {
    slug: "shoes",
    name: "Shoes",
    description: "Sneakers and footwear.",
    filters: [
      { key: "size", label: "Size", options: [] },
      { key: "colour", label: "Colour", options: [] },
      { key: "gender", label: "Gender", options: [] },
    ],
  },
];

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.name === name);
}
