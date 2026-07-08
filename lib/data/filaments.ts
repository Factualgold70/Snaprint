import type { SupabaseClient } from "@supabase/supabase-js";

export interface Filament {
  id: string;
  user_id: string;
  name: string;
  color: string;
  material: string;
  weight_grams: number;
  cost_zar: number;
  cost_rmb: number | null;
  rmb_to_zar_rate: number | null;
  used_grams: number;
  created_at: string;
  updated_at: string;
}

export async function getFilaments(
  supabase: SupabaseClient,
  userId: string
): Promise<Filament[]> {
  const { data, error } = await supabase
    .from("filaments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFilament(
  supabase: SupabaseClient,
  filamentId: string,
  userId: string
): Promise<Filament | null> {
  const { data, error } = await supabase
    .from("filaments")
    .select("*")
    .eq("id", filamentId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function getFilamentWithUsage(
  supabase: SupabaseClient,
  filamentId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("filaments")
    .select(
      `
      *,
      filament_usage(grams_used, print_description, created_at)
    `
    )
    .eq("id", filamentId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}
