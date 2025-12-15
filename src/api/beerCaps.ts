import type { BeerCap } from "../types";
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

// We use FormData because we are uploading a file
export const createCap = async (formData: FormData): Promise<BeerCap> => {
  const response = await client.post<BeerCap>("/beer_caps/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// For updates, we send standard JSON
export const updateCap = async (
  id: number,
  data: { variant_name?: string; rating?: number; collected_date?: string },
): Promise<BeerCap> => {
  const response = await client.patch<BeerCap>(`/beer_caps/${id}/`, data);
  return response.data;
};
