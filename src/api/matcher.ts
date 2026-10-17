import type { BeerCapWithQueryResult } from "../types";
import { client } from "./client";

export const findSimilarCaps = async (
  imageFile: File,
  topK = 5,
): Promise<BeerCapWithQueryResult[]> => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await client.post<BeerCapWithQueryResult[]>(
    "/similarity/query-image",
    formData,
    { params: { top_k: topK } },
  );

  return response.data;
};
