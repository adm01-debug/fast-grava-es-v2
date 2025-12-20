export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abc_activities: {
        Row: {
          cost_driver: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          technique_id: string | null
          updated_at: string
        }
        Insert: {
          cost_driver: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          technique_id?: string | null
          updated_at?: string
        }
        Update: {
          cost_driver?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          technique_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abc_activities_technique_id_fkey"
            columns: ["technique_id"]
            isOneToOne: false
            referencedRelation: "techniques"
            referencedColumns: ["id"]
          },
        ]
      }
      abc_activity_rates: {
        Row: {
          activity_id: string
          cost_pool_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          rate_per_unit: number
          updated_at: string
        }
        Insert: {
          activity_id: string
          cost_pool_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          rate_per_unit?: number
          updated_at?: string
        }
        Update: {
          activity_id?: string
          cost_pool_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          rate_per_unit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abc_activity_rates_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "abc_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abc_activity_rates_cost_pool_id_fkey"
            columns: ["cost_pool_id"]
            isOneToOne: false
            referencedRelation: "abc_cost_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      abc_cost_pools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          monthly_budget: number
          name: string
          pool_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_budget?: number
          name: string
          pool_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          monthly_budget?: number
          name?: string
          pool_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      abc_job_costs: {
        Row: {
          activity_id: string
          calculated_at: string
          cost_pool_id: string
          created_at: string
          driver_quantity: number
          id: string
          job_id: string
          total_cost: number
          unit_rate: number
        }
        Insert: {
          activity_id: string
          calculated_at?: string
          cost_pool_id: string
          created_at?: string
          driver_quantity?: number
          id?: string
          job_id: string
          total_cost?: number
          unit_rate?: number
        }
        Update: {
          activity_id?: string
          calculated_at?: string
          cost_pool_id?: string
          created_at?: string
          driver_quantity?: number
          id?: string
          job_id?: string
          total_cost?: number
          unit_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "abc_job_costs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "abc_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abc_job_costs_cost_pool_id_fkey"
            columns: ["cost_pool_id"]
            isOneToOne: false
            referencedRelation: "abc_cost_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abc_job_costs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      bitrix24_field_mappings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          mapping_type: string
          priority: number
          source_key: string
          target_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          mapping_type: string
          priority?: number
          source_key: string
          target_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          mapping_type?: string
          priority?: number
          source_key?: string
          target_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      bitrix24_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      bitrix24_sync_history: {
        Row: {
          completed_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          jobs_failed: number | null
          jobs_synced: number | null
          started_at: string
          status: string
          sync_type: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          jobs_failed?: number | null
          jobs_synced?: number | null
          started_at?: string
          status: string
          sync_type: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          jobs_failed?: number | null
          jobs_synced?: number | null
          started_at?: string
          status?: string
          sync_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      daily_summaries: {
        Row: {
          created_at: string
          data: Json
          date: string
          id: string
          summary_type: string
        }
        Insert: {
          created_at?: string
          data?: Json
          date: string
          id?: string
          summary_type: string
        }
        Update: {
          created_at?: string
          data?: Json
          date?: string
          id?: string
          summary_type?: string
        }
        Relationships: []
      }
      efficiency_alert_history: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          detected_at: string
          id: string
          machine_id: string | null
          metadata: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          technique_id: string | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          detected_at?: string
          id?: string
          machine_id?: string | null
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          technique_id?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          detected_at?: string
          id?: string
          machine_id?: string | null
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          technique_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "efficiency_alert_history_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          client: string
          created_at: string
          end_time: string | null
          estimated_duration: number
          gravure_color: string | null
          id: string
          lost_pieces: number | null
          machine_id: string | null
          notes: string | null
          order_number: string
          priority: string
          produced_quantity: number | null
          product: string
          production_photos: string[] | null
          quantity: number
          scheduled_date: string | null
          start_time: string | null
          status: string
          technique_id: string
          updated_at: string
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          client: string
          created_at?: string
          end_time?: string | null
          estimated_duration?: number
          gravure_color?: string | null
          id?: string
          lost_pieces?: number | null
          machine_id?: string | null
          notes?: string | null
          order_number: string
          priority?: string
          produced_quantity?: number | null
          product: string
          production_photos?: string[] | null
          quantity: number
          scheduled_date?: string | null
          start_time?: string | null
          status?: string
          technique_id: string
          updated_at?: string
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          client?: string
          created_at?: string
          end_time?: string | null
          estimated_duration?: number
          gravure_color?: string | null
          id?: string
          lost_pieces?: number | null
          machine_id?: string | null
          notes?: string | null
          order_number?: string
          priority?: string
          produced_quantity?: number | null
          product?: string
          production_photos?: string[] | null
          quantity?: number
          scheduled_date?: string | null
          start_time?: string | null
          status?: string
          technique_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technique_id_fkey"
            columns: ["technique_id"]
            isOneToOne: false
            referencedRelation: "techniques"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_components: {
        Row: {
          batch_number: string | null
          component_lot_id: string | null
          component_name: string
          created_at: string
          id: string
          lot_id: string
          material_id: string | null
          notes: string | null
          quantity_used: number
          supplier: string | null
          unit: string | null
        }
        Insert: {
          batch_number?: string | null
          component_lot_id?: string | null
          component_name: string
          created_at?: string
          id?: string
          lot_id: string
          material_id?: string | null
          notes?: string | null
          quantity_used?: number
          supplier?: string | null
          unit?: string | null
        }
        Update: {
          batch_number?: string | null
          component_lot_id?: string | null
          component_name?: string
          created_at?: string
          id?: string
          lot_id?: string
          material_id?: string | null
          notes?: string | null
          quantity_used?: number
          supplier?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_components_component_lot_id_fkey"
            columns: ["component_lot_id"]
            isOneToOne: false
            referencedRelation: "production_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_components_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "production_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_components_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_movements: {
        Row: {
          created_at: string
          from_location: string | null
          id: string
          job_id: string | null
          lot_id: string
          movement_type: string
          performed_by: string | null
          performed_by_name: string | null
          quantity: number
          reason: string | null
          to_location: string | null
        }
        Insert: {
          created_at?: string
          from_location?: string | null
          id?: string
          job_id?: string | null
          lot_id: string
          movement_type: string
          performed_by?: string | null
          performed_by_name?: string | null
          quantity: number
          reason?: string | null
          to_location?: string | null
        }
        Update: {
          created_at?: string
          from_location?: string | null
          id?: string
          job_id?: string | null
          lot_id?: string
          movement_type?: string
          performed_by?: string | null
          performed_by_name?: string | null
          quantity?: number
          reason?: string | null
          to_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_movements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "production_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_quality_inspections: {
        Row: {
          created_at: string
          defects_found: number | null
          id: string
          inspected_at: string
          inspection_type: string
          inspector_id: string | null
          inspector_name: string | null
          lot_id: string
          notes: string | null
          photos: string[] | null
          result: string
          sample_size: number | null
        }
        Insert: {
          created_at?: string
          defects_found?: number | null
          id?: string
          inspected_at?: string
          inspection_type: string
          inspector_id?: string | null
          inspector_name?: string | null
          lot_id: string
          notes?: string | null
          photos?: string[] | null
          result: string
          sample_size?: number | null
        }
        Update: {
          created_at?: string
          defects_found?: number | null
          id?: string
          inspected_at?: string
          inspection_type?: string
          inspector_id?: string | null
          inspector_name?: string | null
          lot_id?: string
          notes?: string | null
          photos?: string[] | null
          result?: string
          sample_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_quality_inspections_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "production_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_health_metrics: {
        Row: {
          avg_repair_time: number | null
          avg_time_between_failures: number | null
          calculated_at: string
          corrective_maintenance_count: number
          id: string
          machine_id: string
          maintenance_count: number
          oee_score: number | null
          period_end: string
          period_start: string
          total_jobs: number
          total_losses: number
          total_produced: number
          total_production_hours: number
        }
        Insert: {
          avg_repair_time?: number | null
          avg_time_between_failures?: number | null
          calculated_at?: string
          corrective_maintenance_count?: number
          id?: string
          machine_id: string
          maintenance_count?: number
          oee_score?: number | null
          period_end: string
          period_start: string
          total_jobs?: number
          total_losses?: number
          total_produced?: number
          total_production_hours?: number
        }
        Update: {
          avg_repair_time?: number | null
          avg_time_between_failures?: number | null
          calculated_at?: string
          corrective_maintenance_count?: number
          id?: string
          machine_id?: string
          maintenance_count?: number
          oee_score?: number | null
          period_end?: string
          period_start?: string
          total_jobs?: number
          total_losses?: number
          total_produced?: number
          total_production_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "machine_health_metrics_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_predictions: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          confidence: number
          created_at: string
          expires_at: string
          factors: Json
          id: string
          is_active: boolean
          machine_id: string
          model_version: string
          predicted_failure_date: string | null
          prediction_type: string
          recommendations: string[] | null
          risk_score: number
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          confidence: number
          created_at?: string
          expires_at?: string
          factors?: Json
          id?: string
          is_active?: boolean
          machine_id: string
          model_version?: string
          predicted_failure_date?: string | null
          prediction_type: string
          recommendations?: string[] | null
          risk_score: number
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          confidence?: number
          created_at?: string
          expires_at?: string
          factors?: Json
          id?: string
          is_active?: boolean
          machine_id?: string
          model_version?: string
          predicted_failure_date?: string | null
          prediction_type?: string
          recommendations?: string[] | null
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "machine_predictions_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          technique_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          technique_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          technique_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "machines_technique_id_fkey"
            columns: ["technique_id"]
            isOneToOne: false
            referencedRelation: "techniques"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_read: boolean
          is_resolved: boolean
          machine_id: string
          message: string
          resolved_at: string | null
          resolved_by: string | null
          schedule_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          machine_id: string
          message: string
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          machine_id?: string
          message?: string
          resolved_at?: string | null
          resolved_by?: string | null
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_alerts_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_alerts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_checklist_items: {
        Row: {
          checklist_id: string
          created_at: string
          description: string
          id: string
          is_critical: boolean
          item_order: number
          max_value: number | null
          measurement_unit: string | null
          min_value: number | null
          requires_measurement: boolean
          requires_photo: boolean
        }
        Insert: {
          checklist_id: string
          created_at?: string
          description: string
          id?: string
          is_critical?: boolean
          item_order?: number
          max_value?: number | null
          measurement_unit?: string | null
          min_value?: number | null
          requires_measurement?: boolean
          requires_photo?: boolean
        }
        Update: {
          checklist_id?: string
          created_at?: string
          description?: string
          id?: string
          is_critical?: boolean
          item_order?: number
          max_value?: number | null
          measurement_unit?: string | null
          min_value?: number | null
          requires_measurement?: boolean
          requires_photo?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "maintenance_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_checklists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          maintenance_type_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          maintenance_type_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          maintenance_type_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_checklists_maintenance_type_id_fkey"
            columns: ["maintenance_type_id"]
            isOneToOne: false
            referencedRelation: "maintenance_types"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_item_responses: {
        Row: {
          checklist_item_id: string
          id: string
          is_checked: boolean
          measurement_value: number | null
          notes: string | null
          photo_url: string | null
          record_id: string
          responded_at: string
        }
        Insert: {
          checklist_item_id: string
          id?: string
          is_checked?: boolean
          measurement_value?: number | null
          notes?: string | null
          photo_url?: string | null
          record_id: string
          responded_at?: string
        }
        Update: {
          checklist_item_id?: string
          id?: string
          is_checked?: boolean
          measurement_value?: number | null
          notes?: string | null
          photo_url?: string | null
          record_id?: string
          responded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_item_responses_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "maintenance_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_item_responses_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          completed_at: string | null
          created_at: string
          downtime_minutes: number | null
          id: string
          machine_id: string
          maintenance_type_id: string
          notes: string | null
          performed_by: string | null
          performed_by_name: string | null
          photos: string[] | null
          schedule_id: string
          started_at: string
          status: string
          total_cost: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          downtime_minutes?: number | null
          id?: string
          machine_id: string
          maintenance_type_id: string
          notes?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          photos?: string[] | null
          schedule_id: string
          started_at?: string
          status?: string
          total_cost?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          downtime_minutes?: number | null
          id?: string
          machine_id?: string
          maintenance_type_id?: string
          notes?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          photos?: string[] | null
          schedule_id?: string
          started_at?: string
          status?: string
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_maintenance_type_id_fkey"
            columns: ["maintenance_type_id"]
            isOneToOne: false
            referencedRelation: "maintenance_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          estimated_duration_minutes: number
          id: string
          interval_days: number
          is_active: boolean
          last_completed_at: string | null
          machine_id: string
          maintenance_type_id: string
          name: string
          next_due_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration_minutes?: number
          id?: string
          interval_days?: number
          is_active?: boolean
          last_completed_at?: string | null
          machine_id: string
          maintenance_type_id: string
          name: string
          next_due_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration_minutes?: number
          id?: string
          interval_days?: number
          is_active?: boolean
          last_completed_at?: string | null
          machine_id?: string
          maintenance_type_id?: string
          name?: string
          next_due_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_maintenance_type_id_fkey"
            columns: ["maintenance_type_id"]
            isOneToOne: false
            referencedRelation: "maintenance_types"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_types: {
        Row: {
          color: string
          created_at: string
          default_interval_days: number
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          default_interval_days?: number
          description?: string | null
          id: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          default_interval_days?: number
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      operator_goals: {
        Row: {
          created_at: string
          created_by: string | null
          goal_type: string
          id: string
          operator_id: string
          period_end: string
          period_start: string
          target_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          goal_type: string
          id?: string
          operator_id: string
          period_end: string
          period_start: string
          target_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          goal_type?: string
          id?: string
          operator_id?: string
          period_end?: string
          period_start?: string
          target_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      operator_machines: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          machine_id: string
          operator_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          machine_id: string
          operator_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          machine_id?: string
          operator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operator_machines_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_status_audit: {
        Row: {
          action: string
          created_at: string
          id: string
          operator_id: string
          operator_name: string | null
          performed_by: string
          performed_by_name: string | null
          reason: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          operator_id: string
          operator_name?: string | null
          performed_by: string
          performed_by_name?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          operator_id?: string
          operator_name?: string | null
          performed_by?: string
          performed_by_name?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      prediction_history: {
        Row: {
          accuracy_notes: string | null
          actual_failure_date: string | null
          created_at: string
          id: string
          machine_id: string
          predicted_failure_date: string | null
          predicted_risk_score: number
          prediction_id: string
          resolved_at: string | null
          was_accurate: boolean | null
        }
        Insert: {
          accuracy_notes?: string | null
          actual_failure_date?: string | null
          created_at?: string
          id?: string
          machine_id: string
          predicted_failure_date?: string | null
          predicted_risk_score: number
          prediction_id: string
          resolved_at?: string | null
          was_accurate?: boolean | null
        }
        Update: {
          accuracy_notes?: string | null
          actual_failure_date?: string | null
          created_at?: string
          id?: string
          machine_id?: string
          predicted_failure_date?: string | null
          predicted_risk_score?: number
          prediction_id?: string
          resolved_at?: string | null
          was_accurate?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_history_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_history_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "machine_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      production_lots: {
        Row: {
          created_at: string
          expiration_date: string | null
          id: string
          job_id: string | null
          lot_number: string
          notes: string | null
          produced_quantity: number
          product_name: string
          production_date: string
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expiration_date?: string | null
          id?: string
          job_id?: string | null
          lot_number: string
          notes?: string | null
          produced_quantity?: number
          product_name: string
          production_date?: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expiration_date?: string | null
          id?: string
          job_id?: string | null
          lot_number?: string
          notes?: string | null
          produced_quantity?: number
          product_name?: string
          production_date?: string
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_lots_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      qr_scan_history: {
        Row: {
          action: string
          device_info: string | null
          id: string
          job_id: string
          notes: string | null
          operator_id: string
          scanned_at: string
        }
        Insert: {
          action: string
          device_info?: string | null
          id?: string
          job_id: string
          notes?: string | null
          operator_id: string
          scanned_at?: string
        }
        Update: {
          action?: string
          device_info?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          operator_id?: string
          scanned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_checklist_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          items: Json
          machine_id: string | null
          name: string
          technique_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          items?: Json
          machine_id?: string | null
          name: string
          technique_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          items?: Json
          machine_id?: string | null
          name?: string
          technique_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_checklist_templates_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_handover_checklist: {
        Row: {
          checked_at: string | null
          created_at: string
          handover_id: string
          id: string
          is_checked: boolean
          item_description: string
          item_order: number
          notes: string | null
        }
        Insert: {
          checked_at?: string | null
          created_at?: string
          handover_id: string
          id?: string
          is_checked?: boolean
          item_description: string
          item_order?: number
          notes?: string | null
        }
        Update: {
          checked_at?: string | null
          created_at?: string
          handover_id?: string
          id?: string
          is_checked?: boolean
          item_description?: string
          item_order?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_handover_checklist_handover_id_fkey"
            columns: ["handover_id"]
            isOneToOne: false
            referencedRelation: "shift_handovers"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_handovers: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          created_at: string
          general_notes: string | null
          id: string
          incoming_operator_id: string | null
          machine_id: string | null
          outgoing_operator_id: string
          shift_date: string
          shift_type: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          general_notes?: string | null
          id?: string
          incoming_operator_id?: string | null
          machine_id?: string | null
          outgoing_operator_id: string
          shift_date?: string
          shift_type: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          created_at?: string
          general_notes?: string | null
          id?: string
          incoming_operator_id?: string | null
          machine_id?: string | null
          outgoing_operator_id?: string
          shift_date?: string
          shift_type?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_handovers_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_occurrences: {
        Row: {
          created_at: string
          description: string
          handover_id: string
          id: string
          job_id: string | null
          machine_id: string | null
          occurred_at: string
          occurrence_type: string
          photos: string[] | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          handover_id: string
          id?: string
          job_id?: string | null
          machine_id?: string | null
          occurred_at?: string
          occurrence_type: string
          photos?: string[] | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          handover_id?: string
          id?: string
          job_id?: string | null
          machine_id?: string | null
          occurred_at?: string
          occurrence_type?: string
          photos?: string[] | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_occurrences_handover_id_fkey"
            columns: ["handover_id"]
            isOneToOne: false
            referencedRelation: "shift_handovers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_occurrences_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_occurrences_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_pending_tasks: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          handover_id: string
          id: string
          job_id: string | null
          machine_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          handover_id: string
          id?: string
          job_id?: string | null
          machine_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          handover_id?: string
          id?: string
          job_id?: string | null
          machine_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_pending_tasks_handover_id_fkey"
            columns: ["handover_id"]
            isOneToOne: false
            referencedRelation: "shift_handovers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_pending_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_pending_tasks_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      spc_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          description: string
          id: string
          is_acknowledged: boolean
          measurement_id: string | null
          parameter_id: string
          resolution: string | null
          resolved_at: string | null
          severity: string
          title: string
          value: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          description: string
          id?: string
          is_acknowledged?: boolean
          measurement_id?: string | null
          parameter_id: string
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          title: string
          value?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          description?: string
          id?: string
          is_acknowledged?: boolean
          measurement_id?: string | null
          parameter_id?: string
          resolution?: string | null
          resolved_at?: string | null
          severity?: string
          title?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spc_alerts_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "spc_measurements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spc_alerts_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "spc_control_parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      spc_capability_history: {
        Row: {
          calculated_at: string
          cp: number | null
          cpk: number | null
          id: string
          mean: number
          parameter_id: string
          period_end: string
          period_start: string
          pp: number | null
          ppk: number | null
          sample_count: number
          std_deviation: number
        }
        Insert: {
          calculated_at?: string
          cp?: number | null
          cpk?: number | null
          id?: string
          mean: number
          parameter_id: string
          period_end: string
          period_start: string
          pp?: number | null
          ppk?: number | null
          sample_count: number
          std_deviation: number
        }
        Update: {
          calculated_at?: string
          cp?: number | null
          cpk?: number | null
          id?: string
          mean?: number
          parameter_id?: string
          period_end?: string
          period_start?: string
          pp?: number | null
          ppk?: number | null
          sample_count?: number
          std_deviation?: number
        }
        Relationships: [
          {
            foreignKeyName: "spc_capability_history_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "spc_control_parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      spc_control_parameters: {
        Row: {
          created_at: string
          frequency_minutes: number
          id: string
          is_active: boolean
          lower_control_limit: number | null
          lower_spec_limit: number
          machine_id: string | null
          measurement_type: string
          name: string
          product_name: string | null
          sample_size: number
          target_value: number
          technique_id: string | null
          unit: string
          updated_at: string
          upper_control_limit: number | null
          upper_spec_limit: number
        }
        Insert: {
          created_at?: string
          frequency_minutes?: number
          id?: string
          is_active?: boolean
          lower_control_limit?: number | null
          lower_spec_limit: number
          machine_id?: string | null
          measurement_type: string
          name: string
          product_name?: string | null
          sample_size?: number
          target_value: number
          technique_id?: string | null
          unit?: string
          updated_at?: string
          upper_control_limit?: number | null
          upper_spec_limit: number
        }
        Update: {
          created_at?: string
          frequency_minutes?: number
          id?: string
          is_active?: boolean
          lower_control_limit?: number | null
          lower_spec_limit?: number
          machine_id?: string | null
          measurement_type?: string
          name?: string
          product_name?: string | null
          sample_size?: number
          target_value?: number
          technique_id?: string | null
          unit?: string
          updated_at?: string
          upper_control_limit?: number | null
          upper_spec_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "spc_control_parameters_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      spc_measurements: {
        Row: {
          created_at: string
          id: string
          is_in_control: boolean
          job_id: string | null
          lot_id: string | null
          mean_value: number
          measured_at: string
          notes: string | null
          operator_id: string | null
          operator_name: string | null
          out_of_control_type: string | null
          parameter_id: string
          range_value: number
          sample_number: number
          std_deviation: number | null
          values: number[]
        }
        Insert: {
          created_at?: string
          id?: string
          is_in_control?: boolean
          job_id?: string | null
          lot_id?: string | null
          mean_value: number
          measured_at?: string
          notes?: string | null
          operator_id?: string | null
          operator_name?: string | null
          out_of_control_type?: string | null
          parameter_id: string
          range_value: number
          sample_number: number
          std_deviation?: number | null
          values: number[]
        }
        Update: {
          created_at?: string
          id?: string
          is_in_control?: boolean
          job_id?: string | null
          lot_id?: string | null
          mean_value?: number
          measured_at?: string
          notes?: string | null
          operator_id?: string | null
          operator_name?: string | null
          out_of_control_type?: string | null
          parameter_id?: string
          range_value?: number
          sample_number?: number
          std_deviation?: number | null
          values?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "spc_measurements_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spc_measurements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "production_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spc_measurements_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "spc_control_parameters"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      technical_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "technical_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_sheet_materials: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          quantity: string | null
          specification: string | null
          technical_sheet_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          quantity?: string | null
          specification?: string | null
          technical_sheet_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          quantity?: string | null
          specification?: string | null
          technical_sheet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_sheet_materials_technical_sheet_id_fkey"
            columns: ["technical_sheet_id"]
            isOneToOne: false
            referencedRelation: "technical_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_sheet_steps: {
        Row: {
          created_at: string
          description: string
          id: string
          step_number: number
          technical_sheet_id: string
          tips: string | null
          title: string
          warnings: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          step_number: number
          technical_sheet_id: string
          tips?: string | null
          title: string
          warnings?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          step_number?: number
          technical_sheet_id?: string
          tips?: string | null
          title?: string
          warnings?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_sheet_steps_technical_sheet_id_fkey"
            columns: ["technical_sheet_id"]
            isOneToOne: false
            referencedRelation: "technical_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_sheet_tips: {
        Row: {
          content: string
          created_at: string
          id: string
          technical_sheet_id: string
          tip_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          technical_sheet_id: string
          tip_type?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          technical_sheet_id?: string
          tip_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_sheet_tips_technical_sheet_id_fkey"
            columns: ["technical_sheet_id"]
            isOneToOne: false
            referencedRelation: "technical_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_sheets: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          estimated_time_minutes: number | null
          id: string
          is_active: boolean
          material_id: string | null
          product_category_id: string | null
          recommended_machine_id: string | null
          technique_id: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean
          material_id?: string | null
          product_category_id?: string | null
          recommended_machine_id?: string | null
          technique_id: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_time_minutes?: number | null
          id?: string
          is_active?: boolean
          material_id?: string | null
          product_category_id?: string | null
          recommended_machine_id?: string | null
          technique_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_sheets_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_sheets_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_sheets_recommended_machine_id_fkey"
            columns: ["recommended_machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technical_sheets_technique_id_fkey"
            columns: ["technique_id"]
            isOneToOne: false
            referencedRelation: "techniques"
            referencedColumns: ["id"]
          },
        ]
      }
      techniques: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          setup_time: number
          short_name: string
        }
        Insert: {
          color: string
          created_at?: string
          id: string
          name: string
          setup_time?: number
          short_name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          setup_time?: number
          short_name?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          favorites: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorites?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorites?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "coordinator" | "operator" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["coordinator", "operator", "manager"],
    },
  },
} as const
