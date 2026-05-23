export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          activa: boolean
          color: string
          created_at: string
          descripcion: string | null
          icono_url: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activa?: boolean
          color?: string
          created_at?: string
          descripcion?: string | null
          icono_url?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activa?: boolean
          color?: string
          created_at?: string
          descripcion?: string | null
          icono_url?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
          nextsis_code: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          nextsis_code: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          nextsis_code?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      configuracion_visual: {
        Row: {
          configuracion: Json
          created_at: string
          estilo_visual: string
          id: string
          tema: string
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          configuracion?: Json
          created_at?: string
          estilo_visual?: string
          id?: string
          tema?: string
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          configuracion?: Json
          created_at?: string
          estilo_visual?: string
          id?: string
          tema?: string
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      conformidades_servicio: {
        Row: {
          area: string
          conformidad: boolean
          descripcion_servicio: string
          fecha_conformidad: string
          firma: string | null
          id_correlativo: string
          nro_centro_costo: string
          nro_factura: string
          nro_of: string
          nro_orden_servicio: string
          observaciones: string
          proveedor: string
          responsable: string
          ruc: string
          solicitante: string
          usuario_id: string
        }
        Insert: {
          area: string
          conformidad?: boolean
          descripcion_servicio: string
          fecha_conformidad: string
          firma?: string | null
          id_correlativo: string
          nro_centro_costo: string
          nro_factura: string
          nro_of: string
          nro_orden_servicio: string
          observaciones: string
          proveedor: string
          responsable: string
          ruc: string
          solicitante: string
          usuario_id: string
        }
        Update: {
          area?: string
          conformidad?: boolean
          descripcion_servicio?: string
          fecha_conformidad?: string
          firma?: string | null
          id_correlativo?: string
          nro_centro_costo?: string
          nro_factura?: string
          nro_of?: string
          nro_orden_servicio?: string
          observaciones?: string
          proveedor?: string
          responsable?: string
          ruc?: string
          solicitante?: string
          usuario_id?: string
        }
        Relationships: []
      }
      empresa: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo: string | null
          name: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo?: string | null
          name: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      escalas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          scale_ranges: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          scale_ranges?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          scale_ranges?: Json
          updated_at?: string
        }
        Relationships: []
      }
      evaluaciones: {
        Row: {
          classification: string
          created_at: string
          criteria_scores: Json
          evaluated_by: string | null
          evaluation_system_id: string
          evaluation_system_name: string
          evaluator_id: string | null
          id: string
          notes: string | null
          service_id: string
          total_score: number
          updated_at: string
        }
        Insert: {
          classification?: string
          created_at?: string
          criteria_scores?: Json
          evaluated_by?: string | null
          evaluation_system_id: string
          evaluation_system_name: string
          evaluator_id?: string | null
          id?: string
          notes?: string | null
          service_id: string
          total_score?: number
          updated_at?: string
        }
        Update: {
          classification?: string
          created_at?: string
          criteria_scores?: Json
          evaluated_by?: string | null
          evaluation_system_id?: string
          evaluation_system_name?: string
          evaluator_id?: string | null
          id?: string
          notes?: string | null
          service_id?: string
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "evaluadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluaciones_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "registros"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluadores: {
        Row: {
          cargo: string
          created_at: string
          firma_url: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          cargo: string
          created_at?: string
          firma_url?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          cargo?: string
          created_at?: string
          firma_url?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      importaciones: {
        Row: {
          created_at: string
          error_details: Json | null
          failed_records: number
          file_path: string
          filename: string
          id: string
          status: string
          successful_records: number
          total_records: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          failed_records?: number
          file_path: string
          filename: string
          id?: string
          status?: string
          successful_records?: number
          total_records?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          failed_records?: number
          file_path?: string
          filename?: string
          id?: string
          status?: string
          successful_records?: number
          total_records?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      pdf_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          layout_data: Json
          name: string
          pdf_config: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_data?: Json
          name: string
          pdf_config?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          layout_data?: Json
          name?: string
          pdf_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      periodo_evaluacion: {
        Row: {
          created_at: string
          estado: string
          evaluator_id: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          nombre: string
          periodo: string
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estado?: string
          evaluator_id?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          nombre: string
          periodo: string
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estado?: string
          evaluator_id?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          nombre?: string
          periodo?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_periodo_evaluacion_periodo"
            columns: ["periodo"]
            isOneToOne: false
            referencedRelation: "periodos_disponibles"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "periodo_evaluacion_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "evaluadores"
            referencedColumns: ["id"]
          },
        ]
      }
      periodos_disponibles: {
        Row: {
          codigo: string
          created_at: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          codigo: string
          created_at?: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          codigo?: string
          created_at?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          firma_url: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          firma_url?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          firma_url?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      registros: {
        Row: {
          cargo_contacto: string | null
          class_id: string | null
          created_at: string
          description: string
          direccion: string | null
          doc_id_contacto: string | null
          email: string | null
          es_whatsapp: boolean | null
          id: string
          nextsis_code: string
          nombre_contacto: string | null
          notes: string | null
          razon_social: string | null
          ruc: string | null
          subclass_id: string | null
          telefono: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          cargo_contacto?: string | null
          class_id?: string | null
          created_at?: string
          description: string
          direccion?: string | null
          doc_id_contacto?: string | null
          email?: string | null
          es_whatsapp?: boolean | null
          id?: string
          nextsis_code: string
          nombre_contacto?: string | null
          notes?: string | null
          razon_social?: string | null
          ruc?: string | null
          subclass_id?: string | null
          telefono?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          cargo_contacto?: string | null
          class_id?: string | null
          created_at?: string
          description?: string
          direccion?: string | null
          doc_id_contacto?: string | null
          email?: string | null
          es_whatsapp?: boolean | null
          id?: string
          nextsis_code?: string
          nombre_contacto?: string | null
          notes?: string | null
          razon_social?: string | null
          ruc?: string | null
          subclass_id?: string | null
          telefono?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_subclass_id_fkey"
            columns: ["subclass_id"]
            isOneToOne: false
            referencedRelation: "subclasses"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          template_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          template_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      role_change_logs: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_role: Database["public"]["Enums"]["user_role"]
          old_role: Database["public"]["Enums"]["user_role"] | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_role: Database["public"]["Enums"]["user_role"]
          old_role?: Database["public"]["Enums"]["user_role"] | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_role?: Database["public"]["Enums"]["user_role"]
          old_role?: Database["public"]["Enums"]["user_role"] | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_menu_config: {
        Row: {
          available_menus: Json
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          available_menus?: Json
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          available_menus?: Json
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      role_menu_permissions: {
        Row: {
          can_access: boolean | null
          created_at: string | null
          id: string
          menu_item_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_menu_permissions_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      sistemas_evaluacion: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          is_active: boolean
          name: string
          tipo_sistema: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tipo_sistema?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tipo_sistema?: string
          updated_at?: string
        }
        Relationships: []
      }
      subclasses: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          name: string
          nextsis_code: string
          tipo: string | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          name: string
          nextsis_code: string
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string
          nextsis_code?: string
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subclasses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios_empresa: {
        Row: {
          activo: boolean
          area_id: string | null
          avatar_url: string | null
          color_personal: string
          created_at: string
          email: string
          firma_url: string | null
          id: string
          nombre_completo: string
          puesto: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          area_id?: string | null
          avatar_url?: string | null
          color_personal?: string
          created_at?: string
          email: string
          firma_url?: string | null
          id?: string
          nombre_completo: string
          puesto: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          area_id?: string | null
          avatar_url?: string | null
          color_personal?: string
          created_at?: string
          email?: string
          firma_url?: string | null
          id?: string
          nombre_completo?: string
          puesto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_company_user_to_system: {
        Args: {
          company_user_email: string
          user_password: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      change_user_role: {
        Args: {
          _user_id: string
          _new_role: Database["public"]["Enums"]["user_role"]
          _reason?: string
        }
        Returns: boolean
      }
      create_default_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_system_user: {
        Args: {
          user_email: string
          user_password: string
          user_first_name: string
          user_last_name: string
          user_username?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      create_test_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deactivate_system_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      debug_auth_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      delete_all_conformidades: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      delete_evaluation_system: {
        Args: { system_id: string }
        Returns: boolean
      }
      delete_system_user: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      fix_evaluation_classifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          evaluation_id: string
          old_classification: string
          new_classification: string
          total_score: number
        }[]
      }
      force_delete_auth_users: {
        Args: { user_emails: string[] }
        Returns: {
          email: string
          deleted: boolean
          reason: string
        }[]
      }
      generate_correlativo_by_area: {
        Args: { area_name: string }
        Returns: string
      }
      generate_correlativo_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_allowed_menus_for_role: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: {
          id: string
          name: string
          url: string
          icon: string
          description: string
          sort_order: number
        }[]
      }
      get_menus_for_role: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: Json
      }
      get_user_area: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_area_by_profile: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          username: string
          first_name: string
          last_name: string
          user_role: Database["public"]["Enums"]["user_role"]
          created_at: string
          last_sign_in_at: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      recalculate_evaluation_classification: {
        Args: { eval_total_score: number; scale_ranges: Json }
        Returns: string
      }
      reset_user_password: {
        Args: { target_user_id: string; new_password: string }
        Returns: boolean
      }
      update_role_menus: {
        Args: { _role: Database["public"]["Enums"]["user_role"]; _menus: Json }
        Returns: boolean
      }
      validate_email_format: {
        Args: { email: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "supervisor" | "evaluator" | "usuario_responsable"
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
      user_role: ["admin", "supervisor", "evaluator", "usuario_responsable"],
    },
  },
} as const
