import { api } from './api';
export const operatorsService = {
  getAll: () => api.get('operators'),
  getById: (id: string) => api.get('operators'),
  create: (data: any) => api.create('operators', data),
  update: (id: string, data: any) => api.update('operators', id, data),
};
