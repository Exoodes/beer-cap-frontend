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

export const updateCap = async (
  id: number,
  data: { 
    variant_name?: string; 
    collected_date?: string | null;
    beer_id?: number; // 👈 Add this
  }
): Promise<BeerCap> => {
  const response = await client.patch<BeerCap>(`/beer_caps/${id}/`, data);
  return response.data;
};

export const updateBeer = async (
  beerId: number,
  capId: number,
  data: { rating?: number; name?: string }
): Promise<void> => {
  await client.patch(`/beers/${beerId}/`, data, {
    params: { beer_cap_id: capId }, // This sends ?beer_cap_id=9
  });
};