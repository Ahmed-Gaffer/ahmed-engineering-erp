import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

type ApiService = {
  list: (params: ListParams) => Promise<{ data: PaginatedResponse<unknown> | unknown[] }>;
  get?: (id: number) => Promise<{ data: unknown }>;
  create?: (data: unknown) => Promise<{ data: unknown }>;
  update?: (id: number, data: unknown) => Promise<{ data: unknown }>;
  delete?: (id: number) => Promise<{ data: unknown }>;
};

function createQueryService(path: string): ApiService {
  return {
    list: (params) => api.get(`/${path}/`, { params }),
    get: (id) => api.get(`/${path}/${id}`),
    create: (data) => api.post(`/${path}/`, data),
    update: (id, data) => api.put(`/${path}/${id}`, data),
    delete: (id) => api.delete(`/${path}/${id}`),
  };
}

export function useList<T>(key: string[], service: ApiService, params: ListParams = {}) {
  return useQuery<T[]>({
    queryKey: [...key, params],
    queryFn: async () => {
      const res = await service.list(params);
      const data = res.data;
      if (Array.isArray(data)) return data as T[];
      if (data && 'items' in data) return (data as PaginatedResponse<T>).items;
      return [];
    },
  });
}

export function useGet<T>(key: string[], id: number | null, service: ApiService) {
  return useQuery<T | null>({
    queryKey: [...key, id],
    queryFn: async () => {
      if (!id || !service.get) return null;
      const res = await service.get(id);
      return res.data as T;
    },
    enabled: !!id && !!service.get,
  });
}

export function useCreate<T>(key: string[], service: ApiService) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: T) => {
      if (!service.create) throw new Error('create not implemented');
      const res = await service.create(data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); },
  });
}

export function useUpdate<T>(key: string[], service: ApiService) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<T> }) => {
      if (!service.update) throw new Error('update not implemented');
      const res = await service.update(id, data);
      return res.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); },
  });
}

export function useDelete(key: string[], service: ApiService) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!service.delete) throw new Error('delete not implemented');
      await service.delete(id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); },
  });
}

export function createCrudService(path: string) {
  const svc = createQueryService(path);
  return { svc, key: [path] };
}
