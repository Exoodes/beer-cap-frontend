import type { Beer, BeerBrand, Country } from "../types";
import { client } from "./client";

export const getCountries = async (): Promise<Country[]> => {
  const response = await client.get<Country[]>("/countries/");
  return response.data;
};

export const getBrands = async (): Promise<BeerBrand[]> => {
  const response = await client.get<BeerBrand[]>("/beer_brands/");
  return response.data;
};

export const getBeers = async (): Promise<Beer[]> => {
  const response = await client.get<Beer[]>("/beers/", {
    params: { 
      include_beer_brand: true,
    }
  });
  return response.data;
};
