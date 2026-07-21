// Tipos generados a mano desde supabase/migrations/
// Actualizar si el schema cambia. Idealmente regenerar con el CLI de Supabase.

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
        Relationships: []
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
        Relationships: []
      }
      snapshots: {
        Row: {
          id: string
          project_id: string
          user_id: string
          label: string | null
          values: Json | null
          sketch_js: string | null
          config_yaml: string | null
          preview_url: string | null
          is_favorite: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          label?: string | null
          values?: Json | null
          sketch_js?: string | null
          config_yaml?: string | null
          preview_url?: string | null
          is_favorite?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          label?: string | null
          values?: Json | null
          sketch_js?: string | null
          config_yaml?: string | null
          preview_url?: string | null
          is_favorite?: boolean
          created_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          sketch_js: string
          config_yaml: string
          renderer: 'p5js' | 'threejs'
          thumbnail_url: string | null
          tags: string[] | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          sketch_js: string
          config_yaml: string
          renderer: 'p5js' | 'threejs'
          thumbnail_url?: string | null
          tags?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          sketch_js?: string
          config_yaml?: string
          renderer?: 'p5js' | 'threejs'
          thumbnail_url?: string | null
          tags?: string[] | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
