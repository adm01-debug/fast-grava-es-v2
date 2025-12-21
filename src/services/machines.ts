import { api } from './api';
export const machinesService = {
  getAll: () => api.get('machines'),
  getById: (id: string) => api.get('machines'),
  create: (data: any) => api.create('machines', data),
};
