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


export const deleteBeer = async (id: number): Promise<void> => {
  await client.delete(`/beers/${id}/`);
};

export const deleteBrand = async (id: number): Promise<void> => {
  await client.delete(`/beer_brands/${id}/`);
};

export const deleteCountry = async (id: number): Promise<void> => {
  await client.delete(`/countries/${id}/`);
};

export const createBrand = async (name: string): Promise<BeerBrand> => {
  const formData = new FormData();
  formData.append("name", name);
  const response = await client.post<BeerBrand>("/beer_brands/", formData);
  return response.data;
};

export const createCountry = async (name: string, description: string): Promise<Country> => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  const response = await client.post<Country>("/countries/", formData);
  return response.data;
};