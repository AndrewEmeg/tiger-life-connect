
import { supabase } from "@/integrations/supabase/client";

export const initializeProfileStorage = async () => {
  try {
    // Check if the function exists
    const { data } = await supabase.functions.invoke("create-profile-bucket");
    console.log("Storage initialization result:", data);
    return data;
  } catch (error) {
    console.error("Error initializing storage:", error);
    return null;
  }
};
