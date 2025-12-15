import type { BeerCap } from "../types";
import { client } from "./client";

export interface MatchResult {
  cap: BeerCap;
  score: number;
}

export const findSimilarCaps = async (imageFile: File): Promise<BeerCap[]> => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await client.post<BeerCap[]>("/similarity/query", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
