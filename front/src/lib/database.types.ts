// Tipos generados a mano desde supabase/migrations/20260623000000_initial_schema.sql
// Actualizar si el schema cambia

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          sketch_js: string | null
          config_yaml: string | null
          memory: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          sketch_js?: string | null
          config_yaml?: string | null
          memory?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          sketch_js?: string | null
          config_yaml?: string | null
          memory?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      snapshots: {
        Row: {
          id: string
          project_id: string
          user_id: string
          label: string | null
          sketch_js: string | null
          config_yaml: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          label?: string | null
          sketch_js?: string | null
          config_yaml?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          label?: string | null
          sketch_js?: string | null
          config_yaml?: string | null
          created_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          project_id: string
          user_id: string
          name: string
          url: string
          mime_type: string | null
          size_bytes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          name: string
          url: string
          mime_type?: string | null
          size_bytes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          name?: string
          url?: string
          mime_type?: string | null
          size_bytes?: number | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
