export interface Document { id: string; name: string; type: string; size: number; url: string; uploadedBy: string; uploadedAt: string; }
export interface DocumentCategory { id: string; name: string; documents: Document[]; }
