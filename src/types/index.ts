export interface Country {
  id: number;
  name: string;
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
}

export interface BeerCap {
  id: number;
  variant_name?: string;
  collected_date?: string;
  presigned_url: string;
  beer: Beer;
}