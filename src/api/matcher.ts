import { client } from "./client";

export interface QueryResultResponse {
  mean_similarity: number;
  min_similarity: number;
  max_similarity: number;
  match_count: number;
}

export interface BeerCapWithQueryResult {
  id: number;
  variant_name?: string;
  collected_date?: string;
  presigned_url: string;
  query_result: QueryResultResponse;
}

export const findSimilarCaps = async (
  imageFile: File,
  topK = 5
): Promise<BeerCapWithQueryResult[]> => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await client.post<BeerCapWithQueryResult[]>(
    "/similarity/query-image",
    formData,
    {
      params: { top_k: topK },
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};