export interface TechnicalSheet {
  id: string;
  technique_id: string;
  product_category_id: string | null;
  material_id: string | null;
  title: string;
  description: string | null;
  estimated_time_minutes: number | null;
  recommended_machine_id: string | null;
  machine_settings: Record<string, any> | null;
  settings_ranges: Record<string, { min: string; max: string }> | null;
  ink_specifications: string | null;
  tooling_specifications: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  gap_specifications?: string | null;
  challenges_notes?: string | null;
  failure_scenarios?: string | null;
  quality_requirements?: string | null;
  techniques?: { id: string; name: string; color: string; short_name: string };
  product_categories?: { id: string; name: string };
  materials?: { id: string; name: string };
  machines?: { id: string; name: string; code: string };
}

export interface TechnicalSheetStep {
  id: string;
  technical_sheet_id: string;
  step_number: number;
  title: string;
  description: string;
  tips: string | null;
  warnings: string | null;
}

export interface TechnicalSheetMaterial {
  id: string;
  technical_sheet_id: string;
  name: string;
  specification: string | null;
  quantity: string | null;
  notes: string | null;
}

export interface TechnicalSheetTip {
  id: string;
  technical_sheet_id: string;
  tip_type: 'tip' | 'warning' | 'important';
  content: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
}

export const SHEETS_ERROR_CONTEXT = {
  sheets: { entity: 'technical_sheets', operation: 'fetch' },
  sheetDetails: { entity: 'technical_sheets', operation: 'fetch_details' },
  categories: { entity: 'product_categories', operation: 'fetch' },
  materials: { entity: 'materials', operation: 'fetch' },
  steps: { entity: 'technical_sheet_steps', operation: 'fetch' },
  tips: { entity: 'technical_sheet_tips', operation: 'fetch' },
};
