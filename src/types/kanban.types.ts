export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  jobs: KanbanJob[];
}

export interface KanbanJob {
  id: string;
  order_number: string;
  client: string;
  priority: string;
  position: number;
}
