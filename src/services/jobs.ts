import { api } from './api';
export const jobsService = {
  getAll: () => api.get('jobs'),
  getById: (id: string) => api.get('jobs'),
  create: (data: any) => api.create('jobs', data),
  update: (id: string, data: any) => api.update('jobs', id, data),
};
