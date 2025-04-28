export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      snippets: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          html_code: string | null
          css_code: string | null
          js_code: string | null
          user_id: string
          is_public: boolean
          tags: string[] | null
          views: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          html_code?: string | null
          css_code?: string | null
          js_code?: string | null
          user_id: string
          is_public?: boolean
          tags?: string[] | null
          views?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          html_code?: string | null
          css_code?: string | null
          js_code?: string | null
          user_id?: string
          is_public?: boolean
          tags?: string[] | null
          views?: number
        }
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          plan_type: string
          status: string
          snippet_limit: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_type: string
          status: string
          snippet_limit: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          plan_type?: string
          status?: string
          snippet_limit?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      canvas_positions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          snippet_id: string
          position_x: number
          position_y: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          snippet_id: string
          position_x: number
          position_y: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          snippet_id?: string
          position_x?: number
          position_y?: number
        }
      }
      canvas_settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          zoom: number
          position_x: number
          position_y: number
          public_access_id: string | null
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          zoom?: number
          position_x?: number
          position_y?: number
          public_access_id?: string | null
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          zoom?: number
          position_x?: number
          position_y?: number
          public_access_id?: string | null
          is_public?: boolean
        }
      }
      favorites: {
        Row: {
          id: string
          created_at: string
          user_id: string
          snippet_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          snippet_id: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          snippet_id?: string
        }
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
  }
}
