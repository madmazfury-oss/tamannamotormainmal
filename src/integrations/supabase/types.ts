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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          business_location: string | null
          details: string | null
          entity_id: string
          entity_title: string
          entity_type: string
          id: string
          performed_by: string
          timestamp: string
        }
        Insert: {
          action_type: string
          business_location?: string | null
          details?: string | null
          entity_id: string
          entity_title: string
          entity_type: string
          id: string
          performed_by: string
          timestamp: string
        }
        Update: {
          action_type?: string
          business_location?: string | null
          details?: string | null
          entity_id?: string
          entity_title?: string
          entity_type?: string
          id?: string
          performed_by?: string
          timestamp?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          balance: number | null
          business_location: string | null
          business_name: string | null
          created_at: string
          credit_limit: number | null
          customer_group: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          total_purchases: number | null
          type: string
        }
        Insert: {
          address?: string | null
          balance?: number | null
          business_location?: string | null
          business_name?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_group?: string | null
          email?: string | null
          id: string
          name: string
          phone?: string | null
          total_purchases?: number | null
          type: string
        }
        Update: {
          address?: string | null
          balance?: number | null
          business_location?: string | null
          business_name?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_group?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          total_purchases?: number | null
          type?: string
        }
        Relationships: []
      }
      delete_requests: {
        Row: {
          business_location: string | null
          damage_severity: string | null
          entity_id: string
          entity_title: string
          entity_type: string
          id: string
          item_value: number | null
          reason: string
          request_date: string
          requested_by: string
          status: string | null
        }
        Insert: {
          business_location?: string | null
          damage_severity?: string | null
          entity_id: string
          entity_title: string
          entity_type: string
          id: string
          item_value?: number | null
          reason: string
          request_date: string
          requested_by: string
          status?: string | null
        }
        Update: {
          business_location?: string | null
          damage_severity?: string | null
          entity_id?: string
          entity_title?: string
          entity_type?: string
          id?: string
          item_value?: number | null
          reason?: string
          request_date?: string
          requested_by?: string
          status?: string | null
        }
        Relationships: []
      }
      due_payments: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          invoice_no: string | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          received_by: string | null
          remaining_due: number | null
          sale_id: string | null
        }
        Insert: {
          amount_paid: number
          created_at?: string
          id: string
          invoice_no?: string | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          received_by?: string | null
          remaining_due?: number | null
          sale_id?: string | null
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          invoice_no?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          received_by?: string | null
          remaining_due?: number | null
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "due_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_location: string | null
          category: string
          created_at: string
          expense_date: string
          expense_no: string
          id: string
          note: string | null
          reference_no: string | null
        }
        Insert: {
          amount: number
          business_location?: string | null
          category: string
          created_at?: string
          expense_date: string
          expense_no: string
          id: string
          note?: string | null
          reference_no?: string | null
        }
        Update: {
          amount?: number
          business_location?: string | null
          category?: string
          created_at?: string
          expense_date?: string
          expense_no?: string
          id?: string
          note?: string | null
          reference_no?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          alert_quantity: number | null
          business_location: string | null
          category: string
          created_at: string | null
          current_stock: number
          id: string
          image_url: string | null
          name: string
          selling_price: number
          sku: string
          unit_purchase_price: number
        }
        Insert: {
          alert_quantity?: number | null
          business_location?: string | null
          category: string
          created_at?: string | null
          current_stock?: number
          id: string
          image_url?: string | null
          name: string
          selling_price?: number
          sku: string
          unit_purchase_price?: number
        }
        Update: {
          alert_quantity?: number | null
          business_location?: string | null
          category?: string
          created_at?: string | null
          current_stock?: number
          id?: string
          image_url?: string | null
          name?: string
          selling_price?: number
          sku?: string
          unit_purchase_price?: number
        }
        Relationships: []
      }
      purchases: {
        Row: {
          business_location: string | null
          created_at: string
          grand_total: number
          id: string
          items_count: number | null
          payment_due: number | null
          payment_status: string | null
          purchase_date: string
          purchase_no: string
          purchase_status: string | null
          supplier_name: string
        }
        Insert: {
          business_location?: string | null
          created_at?: string
          grand_total?: number
          id: string
          items_count?: number | null
          payment_due?: number | null
          payment_status?: string | null
          purchase_date: string
          purchase_no: string
          purchase_status?: string | null
          supplier_name: string
        }
        Update: {
          business_location?: string | null
          created_at?: string
          grand_total?: number
          id?: string
          items_count?: number | null
          payment_due?: number | null
          payment_status?: string | null
          purchase_date?: string
          purchase_no?: string
          purchase_status?: string | null
          supplier_name?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount_tendered: number | null
          business_location: string | null
          cashier_name: string | null
          change_due: number | null
          created_at: string
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          due_notes: string | null
          id: string
          invoice_due: number | null
          invoice_no: string
          items_count: number | null
          items_data: string | null
          payment_method: string | null
          payment_status: string | null
          sale_date: string
          subtotal: number | null
          tax_amount: number | null
          total_amount: number
          type: string | null
        }
        Insert: {
          amount_tendered?: number | null
          business_location?: string | null
          cashier_name?: string | null
          change_due?: number | null
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          due_notes?: string | null
          id: string
          invoice_due?: number | null
          invoice_no: string
          items_count?: number | null
          items_data?: string | null
          payment_method?: string | null
          payment_status?: string | null
          sale_date: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          type?: string | null
        }
        Update: {
          amount_tendered?: number | null
          business_location?: string | null
          cashier_name?: string | null
          change_due?: number | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          due_notes?: string | null
          id?: string
          invoice_due?: number | null
          invoice_no?: string
          items_count?: number | null
          items_data?: string | null
          payment_method?: string | null
          payment_status?: string | null
          sale_date?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          type?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          business_location: string | null
          created_at: string
          email: string
          id: number
          last_login: string | null
          name: string
          password: string | null
          phone: string | null
          role: string | null
          status: string | null
          uid: string
          username: string
        }
        Insert: {
          business_location?: string | null
          created_at?: string
          email: string
          id?: number
          last_login?: string | null
          name: string
          password?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          uid: string
          username: string
        }
        Update: {
          business_location?: string | null
          created_at?: string
          email?: string
          id?: number
          last_login?: string | null
          name?: string
          password?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          uid?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
