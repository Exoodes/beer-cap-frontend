import type { BeerCap, BeerCapUpdate, BeerUpdate } from "../types";
import { client } from "./client";

export const getAllCaps = async (): Promise<BeerCap[]> => {
  const response = await client.get<BeerCap[]>("/beer_caps/");
  return response.data;
};

export const getCapById = async (id: number): Promise<BeerCap> => {
  const response = await client.get<BeerCap>(`/beer_caps/${id}/`);
  return response.data;
};

export const getCapsByBeerId = async (beerId: number): Promise<BeerCap[]> => {
  const response = await client.get<BeerCap[]>(`/beer_caps/by-beer/${beerId}/`);
  return response.data;
};

export const deleteCap = async (id: number): Promise<void> => {
  await client.delete(`/beer_caps/${id}/`);
};

/** Multipart upload: the image file plus the form fields of the new cap. */
export const createCap = async (formData: FormData): Promise<BeerCap> => {
  const response = await client.post<BeerCap>("/beer_caps/", formData);
  return response.data;
};

/** Gives a cap a new photo (and thumbnail). */
export const replaceCapImage = async (
  id: number,
  file: File,
): Promise<BeerCap> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await client.put<BeerCap>(
    `/beer_caps/${id}/image/`,
    formData,
  );
  return response.data;
};

/** Omitted fields are kept; `null` clears a nullable field. */
export const updateCap = async (
  id: number,
  data: BeerCapUpdate,
): Promise<BeerCap> => {
  const response = await client.patch<BeerCap>(`/beer_caps/${id}/`, data);
  return response.data;
};

/** Omitted fields are kept; `null` clears `country_id`. */
export const updateBeer = async (
  beerId: number,
  data: BeerUpdate,
): Promise<void> => {
  await client.patch(`/beers/${beerId}/`, data);
};
