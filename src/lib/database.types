export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
          current_period_end: string | null
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
          current_period_end?: string | null
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
          current_period_end?: string | null
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
