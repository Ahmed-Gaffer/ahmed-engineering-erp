import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

export function useEntity<T>(
  fetchById: (id: number | string) => Promise<AxiosResponse<T>>,
  id: string | undefined,
): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: ['entity-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('Entity ID is required');
      const res = await fetchById(id);
      return res.data;
    },
    enabled: !!id,
    retry: 1,
    staleTime: 30_000,
  });
}
