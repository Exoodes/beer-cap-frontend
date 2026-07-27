import { client } from "./client";

export interface BackupItem {
  name: string;
  is_dir: boolean;
  size: number;
  created_at: string;
}

export const getBackups = async (): Promise<BackupItem[]> => {
  const response = await client.get<BackupItem[]>("/backups/");
  return response.data;
};

export const createBackup = async (): Promise<void> => {
  await client.post("/backups/");
};

export const deleteBackup = async (name: string): Promise<void> => {
  await client.delete(`/backups/${name}`);
};
