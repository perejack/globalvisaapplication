import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nnjdnockcviszrewmmeq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uamRub2NrY3Zpc3pyZXdtbWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzA3MzAsImV4cCI6MjA4NjIwNjczMH0.H4GuxaJAN8zqOEw18LL0pl3t2AH1EC1amsXIRwL6jBs';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string;
          nationality: string;
          visa_type: string;
          purpose_of_visit: string | null;
          card_number: string;
          expiry_date: string;
          issue_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          date_of_birth: string;
          nationality: string;
          visa_type: string;
          purpose_of_visit?: string | null;
          card_number: string;
          expiry_date: string;
          issue_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          date_of_birth?: string;
          nationality?: string;
          visa_type?: string;
          purpose_of_visit?: string | null;
          card_number?: string;
          expiry_date?: string;
          issue_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
