export const bitrix24Service = {
  sync: async () => ({ success: true, synced: 0 }),
  getDeals: async () => [],
  createDeal: async (data: any) => ({ id: '1' }),
};
