import { supabase } from "@/integrations/supabase/client";

export { supabase };

export const getSupabaseUrl = (): string => {
  return (import.meta.env.VITE_SUPABASE_URL as string) || "";
};

export const isSupabaseConfigured = (): boolean => true;

export const getSupabaseAnonKey = (): string => {
  return (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";
};

export const isCustomSupabaseSet = (): boolean => false;

export const resetCustomSupabaseConfig = (): void => {
  // Lovable Cloud manages the connection; nothing to reset.
};

export const setCustomSupabaseConfig = (_url: string, _anonKey: string): boolean => {
  // Lovable Cloud manages the connection; custom overrides are not needed.
  return true;
};

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from("products").select("id", { head: true, count: "exact" });
    if (error) {
      return { success: false, message: `সংযোগ ত্রুটি: ${error.message}` };
    }
    return { success: true, message: "সফলভাবে ক্লাউড ডেটাবেজে সংযোগ স্থাপন করা হয়েছে!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "সার্ভারে পৌঁছানো সম্ভব হয়নি।" };
  }
}
