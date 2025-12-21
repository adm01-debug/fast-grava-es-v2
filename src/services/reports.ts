import { api } from './api';
export const reportsService = {
  generate: async (type: string, params: any) => ({ type, params }),
  exportPDF: async (data: any) => new Blob(),
  exportExcel: async (data: any) => new Blob(),
};
