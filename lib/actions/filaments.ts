"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFilament(
  name: string,
  color: string,
  material: string,
  weight_grams: number,
  cost_zar: number,
  cost_rmb: number | null,
  rmb_to_zar_rate: number | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("filaments").insert({
    user_id: user.id,
    name,
    color,
    material,
    weight_grams,
    cost_zar,
    cost_rmb,
    rmb_to_zar_rate,
  });

  if (error) throw error;
  revalidatePath("/inventory");
}

export async function updateFilament(
  filamentId: string,
  name: string,
  color: string,
  material: string,
  weight_grams: number,
  cost_zar: number,
  cost_rmb: number | null,
  rmb_to_zar_rate: number | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("filaments")
    .update({
      name,
      color,
      material,
      weight_grams,
      cost_zar,
      cost_rmb,
      rmb_to_zar_rate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", filamentId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/inventory");
}

export async function deleteFilament(filamentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("filaments")
    .delete()
    .eq("id", filamentId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/inventory");
}

export async function recordFilamentUsage(
  filamentId: string,
  grams_used: number,
  print_description: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Record usage
  const { error: usageError } = await supabase
    .from("filament_usage")
    .insert({
      user_id: user.id,
      filament_id: filamentId,
      grams_used,
      print_description,
    });

  if (usageError) throw usageError;

  // Update filament used_grams
  const { data: filament, error: fetchError } = await supabase
    .from("filaments")
    .select("used_grams")
    .eq("id", filamentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) throw fetchError;

  const { error: updateError } = await supabase
    .from("filaments")
    .update({ used_grams: (filament.used_grams || 0) + grams_used })
    .eq("id", filamentId)
    .eq("user_id", user.id);

  if (updateError) throw updateError;
  revalidatePath("/inventory");
  revalidatePath("/calculator");
}

export async function addFilamentStock(
  filamentId: string,
  grams_to_add: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get current filament
  const { data: filament, error: fetchError } = await supabase
    .from("filaments")
    .select("weight_grams, used_grams")
    .eq("id", filamentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) throw fetchError;

  // Add to weight_grams
  const { error: updateError } = await supabase
    .from("filaments")
    .update({
      weight_grams: (filament.weight_grams || 0) + grams_to_add,
      updated_at: new Date().toISOString(),
    })
    .eq("id", filamentId)
    .eq("user_id", user.id);

  if (updateError) throw updateError;
  revalidatePath("/inventory");
  revalidatePath("/calculator");
}
