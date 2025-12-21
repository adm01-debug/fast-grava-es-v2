export interface Bitrix24Config {
  webhookUrl: string;
  syncEnabled: boolean;
  lastSync?: string;
  fieldMappings: FieldMapping[];
}

export interface FieldMapping {
  bitrixField: string;
  localField: string;
  transform?: string;
}
