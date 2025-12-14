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
