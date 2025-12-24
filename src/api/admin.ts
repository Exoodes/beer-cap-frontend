import { client } from "./client";

export interface StatusResponse {
  success: boolean;
  message: string;
}

export const generateAllAugmentations = async (count: number): Promise<StatusResponse> => {
  const response = await client.post<StatusResponse>("/augmented_caps/generate_all/", null, {
    params: { augmentations_per_image: count },
  });
  return response.data;
};

export const generateEmbeddings = async (): Promise<StatusResponse> => {
  const response = await client.post<StatusResponse>("/augmented_caps/generate_embeddings/");
  return response.data;
};

export const generateIndex = async (): Promise<StatusResponse> => {
  const response = await client.post<StatusResponse>("/augmented_caps/generate_index/");
  return response.data;
};

export const deleteAllAugmentedCaps = async (): Promise<StatusResponse> => {
  const response = await client.delete<StatusResponse>("/augmented_caps/all/");
  return response.data;
};