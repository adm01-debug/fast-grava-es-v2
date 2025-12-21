export const qrcodeService = {
  generate: async (data: string) => `data:image/png;base64,${data}`,
  scan: async (image: Blob) => ({ data: '' }),
};
