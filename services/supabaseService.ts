
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Entity } from '../types';

let supabase: SupabaseClient | null = null;

// Initialize Supabase - try to use env vars if available, otherwise wait for manual config
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export const getSupabase = () => supabase;

export const initSupabaseManual = (url: string, key: string) => {
  try {
    supabase = createClient(url, key);
    return true;
  } catch (error) {
    console.error("Failed to init Supabase manually", error);
    return false;
  }
};

// --- Auth ---

export const signIn = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase not initialized");
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase not initialized");
  return await supabase.auth.signUp({ email, password });
};

export const signOut = async () => {
  if (!supabase) return;
  return await supabase.auth.signOut();
};

export const getSession = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
};

// --- Data ---

export const fetchEntities = async (userId: string) => {
  if (!supabase) throw new Error("Supabase not initialized");
  
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Entity[];
};

export const createEntity = async (entity: Omit<Entity, 'id' | 'created_at'>) => {
  if (!supabase) throw new Error("Supabase not initialized");

  const { data, error } = await supabase
    .from('entities')
    .insert([entity])
    .select()
    .single();

  if (error) throw error;
  return data as Entity;
};

export const deleteEntity = async (id: string) => {
  if (!supabase) throw new Error("Supabase not initialized");

  const { error } = await supabase
    .from('entities')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
