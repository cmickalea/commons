import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const webStorage = {
  getItem: (key: string) =>
    typeof localStorage !== "undefined"
      ? Promise.resolve(localStorage.getItem(key))
      : Promise.resolve(null),

  setItem: (key: string, value: string) =>
    typeof localStorage !== "undefined"
      ? Promise.resolve(localStorage.setItem(key, value))
      : Promise.resolve(),

  removeItem: (key: string) =>
    typeof localStorage !== "undefined"
      ? Promise.resolve(localStorage.removeItem(key))
      : Promise.resolve(),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});