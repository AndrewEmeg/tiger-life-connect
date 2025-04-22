
import { supabase } from "@/integrations/supabase/client";

export const initializeProfileStorage = async () => {
  try {
    console.log("Initializing profile storage...");
    // Call the edge function to create the bucket if it doesn't exist
    const { data, error } = await supabase.functions.invoke("create-profile-bucket");
    
    if (error) {
      console.error("Error initializing storage:", error);
      return null;
    }
    
    console.log("Storage initialization result:", data);
    return data;
  } catch (error) {
    console.error("Error initializing storage:", error);
    return null;
  }
};
