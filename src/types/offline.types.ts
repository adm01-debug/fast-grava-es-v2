export interface OfflineQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, any>;
  timestamp: string;
  retries: number;
}
