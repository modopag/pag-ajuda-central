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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          data: Json
          event_type: string
          id: string
          timestamp: string
        }
        Insert: {
          data?: Json
          event_type: string
          id?: string
          timestamp?: string
        }
        Update: {
          data?: Json
          event_type?: string
          id?: string
          timestamp?: string
        }
        Relationships: []
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string
          canonical_url: string | null
          category_id: string
          content: string
          first_paragraph: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          published_at: string | null
          reading_time_minutes: number
          seo_image: Json | null
          slug: string
          status: string
          title: string
          type: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author: string
          canonical_url?: string | null
          category_id: string
          content: string
          first_paragraph?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          seo_image?: Json | null
          slug: string
          status?: string
          title: string
          type?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author?: string
          canonical_url?: string | null
          category_id?: string
          content?: string
          first_paragraph?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number
          seo_image?: Json | null
          slug?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          position: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          article_id: string
          comment: string | null
          created_at: string
          id: string
          is_helpful: boolean
          user_ip: string | null
        }
        Insert: {
          article_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful: boolean
          user_ip?: string | null
        }
        Update: {
          article_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_helpful?: boolean
          user_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string
          created_at: string
          file_size: number
          file_url: string
          height: number
          id: string
          mime_type: string
          width: number
        }
        Insert: {
          alt_text: string
          created_at?: string
          file_size: number
          file_url: string
          height: number
          id?: string
          mime_type: string
          width: number
        }
        Update: {
          alt_text?: string
          created_at?: string
          file_size?: number
          file_url?: string
          height?: number
          id?: string
          mime_type?: string
          width?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          created_at: string
          from_path: string
          id: string
          is_active: boolean
          to_path: string
          type: string
        }
        Insert: {
          created_at?: string
          from_path: string
          id?: string
          is_active?: boolean
          to_path: string
          type?: string
        }
        Update: {
          created_at?: string
          from_path?: string
          id?: string
          is_active?: boolean
          to_path?: string
          type?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          type?: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      slug_history: {
        Row: {
          article_id: string
          changed_at: string
          id: string
          new_slug: string
          old_slug: string
          redirect_created: boolean
        }
        Insert: {
          article_id: string
          changed_at?: string
          id?: string
          new_slug: string
          old_slug: string
          redirect_created?: boolean
        }
        Update: {
          article_id?: string
          changed_at?: string
          id?: string
          new_slug?: string
          old_slug?: string
          redirect_created?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "slug_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          name: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      can_user_login: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { max_per_hour?: number; operation_type: string }
        Returns: boolean
      }
      ensure_root_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_base_slug: {
        Args: { title_text: string }
        Returns: string
      }
      generate_unique_slug: {
        Args: {
          article_id_param?: string
          category_id_param: string
          title_text: string
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_root_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_sensitive_access: {
        Args: { operation: string; record_id?: string; table_name: string }
        Returns: undefined
      }
      reject_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
    }
    Enums: {
      user_role: "admin" | "editor" | "pending"
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
      user_role: ["admin", "editor", "pending"],
    },
  },
} as const
