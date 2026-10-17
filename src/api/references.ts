// src/api/references.ts
import type {
  Beer,
  BeerBrandUpdate,
  BeerBrandWithBeers,
  CountryCreate,
  CountryUpdate,
  CountryWithBeers,
} from "../types";
import { client } from "./client";

export const getCountries = async (): Promise<CountryWithBeers[]> => {
  const response = await client.get<CountryWithBeers[]>("/countries/");
  return response.data;
};

export const createCountry = async (
  data: CountryCreate,
): Promise<CountryWithBeers> => {
  const response = await client.post<CountryWithBeers>("/countries/", data);
  return response.data;
};

export const updateCountry = async (
  id: number,
  data: CountryUpdate,
): Promise<CountryWithBeers> => {
  const response = await client.patch<CountryWithBeers>(
    `/countries/${id}/`,
    data,
  );
  return response.data;
};

export const deleteCountry = async (id: number): Promise<void> => {
  await client.delete(`/countries/${id}/`);
};

export const getBrands = async (): Promise<BeerBrandWithBeers[]> => {
  const response = await client.get<BeerBrandWithBeers[]>("/beer_brands/");
  return response.data;
};

export const createBrand = async (
  name: string,
): Promise<BeerBrandWithBeers> => {
  const response = await client.post<BeerBrandWithBeers>("/beer_brands/", {
    name,
  });
  return response.data;
};

export const updateBrand = async (
  id: number,
  data: BeerBrandUpdate,
): Promise<BeerBrandWithBeers> => {
  const response = await client.patch<BeerBrandWithBeers>(
    `/beer_brands/${id}/`,
    data,
  );
  return response.data;
};

export const deleteBrand = async (id: number): Promise<void> => {
  await client.delete(`/beer_brands/${id}/`);
};

export const getBeers = async (): Promise<Beer[]> => {
  const response = await client.get<Beer[]>("/beers/", {
    params: {
      include_beer_brand: true,
      include_caps: true,
      include_country: true,
    },
  });
  return response.data;
};

export const deleteBeer = async (id: number): Promise<void> => {
  await client.delete(`/beers/${id}/`);
};

/** Folds a duplicate into another entry; the duplicate is deleted. */
const merge = async (kind: string, id: number, intoId: number) => {
  await client.post(`/${kind}/${id}/merge/`, { into_id: intoId });
};

/** Moves the beer's caps to `intoId`, then deletes the beer. */
export const mergeBeer = (id: number, intoId: number) =>
  merge("beers", id, intoId);

/** Moves the brand's beers to `intoId` (joining same-named beers). */
export const mergeBrand = (id: number, intoId: number) =>
  merge("beer_brands", id, intoId);

/** Moves the country's beers to `intoId`, then deletes the country. */
export const mergeCountry = (id: number, intoId: number) =>
  merge("countries", id, intoId);
