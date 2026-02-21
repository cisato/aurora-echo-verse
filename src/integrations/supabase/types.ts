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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          monthly_limit: number
          name: string
          tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          monthly_limit?: number
          name?: string
          tier?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          monthly_limit?: number
          name?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          status_code: number | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint?: string
          id?: string
          status_code?: number | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          status_code?: number | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_insights: {
        Row: {
          acknowledged: boolean | null
          created_at: string
          description: string
          detected_from: string | null
          id: string
          pattern_type: string
          severity: string | null
          suggestion: string | null
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          created_at?: string
          description: string
          detected_from?: string | null
          id?: string
          pattern_type: string
          severity?: string | null
          suggestion?: string | null
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          created_at?: string
          description?: string
          detected_from?: string | null
          id?: string
          pattern_type?: string
          severity?: string | null
          suggestion?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          decisions_made: string[] | null
          emotional_tone: string | null
          id: string
          key_topics: string[] | null
          milestones: string[] | null
          period_type: string | null
          summary: string
          unresolved_threads: string[] | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          decisions_made?: string[] | null
          emotional_tone?: string | null
          id?: string
          key_topics?: string[] | null
          milestones?: string[] | null
          period_type?: string | null
          summary: string
          unresolved_threads?: string[] | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          decisions_made?: string[] | null
          emotional_tone?: string | null
          id?: string
          key_topics?: string[] | null
          milestones?: string[] | null
          period_type?: string | null
          summary?: string
          unresolved_threads?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emotional_patterns: {
        Row: {
          context: string | null
          conversation_id: string | null
          created_at: string | null
          emotion: string
          id: string
          intensity: number | null
          polarity: string | null
          trigger_pattern: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          conversation_id?: string | null
          created_at?: string | null
          emotion: string
          id?: string
          intensity?: number | null
          polarity?: string | null
          trigger_pattern?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          conversation_id?: string | null
          created_at?: string | null
          emotion?: string
          id?: string
          intensity?: number | null
          polarity?: string | null
          trigger_pattern?: string | null
          user_id?: string
        }
        Relationships: []
      }
      identity_evolution: {
        Row: {
          created_at: string | null
          delta: number | null
          dimension: string
          evidence: string | null
          id: string
          note: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delta?: number | null
          dimension: string
          evidence?: string | null
          id?: string
          note?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delta?: number | null
          dimension?: string
          evidence?: string | null
          id?: string
          note?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          emotion: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          emotion?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          emotion?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      proactive_insights: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          insight_type: string
          is_dismissed: boolean | null
          is_surfaced: boolean | null
          message: string
          priority: number | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_dismissed?: boolean | null
          is_surfaced?: boolean | null
          message: string
          priority?: number | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_dismissed?: boolean | null
          is_surfaced?: boolean | null
          message?: string
          priority?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ritual_summaries: {
        Row: {
          accomplishments: string[] | null
          created_at: string
          goals_reviewed: string[] | null
          growth_highlights: string[] | null
          id: string
          intentions: string[] | null
          mood_trend: string | null
          period_end: string
          period_start: string
          ritual_type: string
          summary: string
          user_id: string
        }
        Insert: {
          accomplishments?: string[] | null
          created_at?: string
          goals_reviewed?: string[] | null
          growth_highlights?: string[] | null
          id?: string
          intentions?: string[] | null
          mood_trend?: string | null
          period_end: string
          period_start: string
          ritual_type: string
          summary: string
          user_id: string
        }
        Update: {
          accomplishments?: string[] | null
          created_at?: string
          goals_reviewed?: string[] | null
          growth_highlights?: string[] | null
          id?: string
          intentions?: string[] | null
          mood_trend?: string | null
          period_end?: string
          period_start?: string
          ritual_type?: string
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          id: string
          key: string
          last_reinforced_at: string | null
          source: string | null
          updated_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          key: string
          last_reinforced_at?: string | null
          source?: string | null
          updated_at?: string | null
          user_id: string
          value: string
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          key?: string
          last_reinforced_at?: string | null
          source?: string | null
          updated_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          active_persona: string | null
          companion_mode: string | null
          created_at: string
          id: string
          memory_depth: string | null
          preferred_model: string | null
          proactive_enabled: boolean | null
          updated_at: string
          user_id: string
          voice_enabled: boolean | null
          web_search_enabled: boolean | null
        }
        Insert: {
          active_persona?: string | null
          companion_mode?: string | null
          created_at?: string
          id?: string
          memory_depth?: string | null
          preferred_model?: string | null
          proactive_enabled?: boolean | null
          updated_at?: string
          user_id: string
          voice_enabled?: boolean | null
          web_search_enabled?: boolean | null
        }
        Update: {
          active_persona?: string | null
          companion_mode?: string | null
          created_at?: string
          id?: string
          memory_depth?: string | null
          preferred_model?: string | null
          proactive_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean | null
          web_search_enabled?: boolean | null
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
    Enums: {},
  },
} as const
