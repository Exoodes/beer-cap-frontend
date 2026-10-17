import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../api/admin";

/** Whether the backend runs with image matching (ENABLE_MATCHING). */
export function useMatchingEnabled(): boolean {
  const { data } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  return data?.matching.enabled ?? false;
}
