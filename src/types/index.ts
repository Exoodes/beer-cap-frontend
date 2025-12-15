export interface BeerBrand {
  id: number;
  name: string;
}

export interface Country {
  id: number;
  name: string;
  description: string | null;
}

export interface Beer {
  id: number;
  name: string;
  rating: number | null;
  country: Country | null;
}

export interface BeerCap {
  id: number;
  variant_name: string | null;
  collected_date: string | null;

  presigned_url: string;
  beer: Beer;
}