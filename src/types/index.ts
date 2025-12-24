// src/types/index.ts
export interface Country {
  id: number;
  name: string;
  description?: string; // Added to fix 'description' property error
}

export interface BeerBrand {
  id: number;
  name: string;
}

export interface Beer {
  id: number;
  name: string;
  rating: number;
  country: Country | null;
  beer_brand?: BeerBrand | null;
  brand?: BeerBrand | null;
  caps?: { id: number }[]; // Added to help find a cap ID for beer updates
}

export interface BeerCap {
  id: number;
  variant_name?: string;
  collected_date?: string;
  presigned_url: string;
  beer: Beer;
}