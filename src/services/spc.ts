export const spcService = {
  calculateLimits: (data: number[]) => ({ ucl: 0, lcl: 0, cl: 0 }),
  detectOutOfControl: (data: number[], limits: any) => [],
};
