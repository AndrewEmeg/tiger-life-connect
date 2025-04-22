
// This edge function creates a storage bucket for profile images if it doesn't exist
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create the Supabase client with service role key (needed for storage admin operations)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;

    const profileBucket = buckets?.find(bucket => bucket.name === "profiles");
    
    if (!profileBucket) {
      // Create bucket if it doesn't exist
      const { data, error } = await supabaseAdmin.storage.createBucket("profiles", {
        public: true,
        fileSizeLimit: 2097152, // 2MB limit
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"]
      });
      
      if (error) throw error;
      
      // Create a policy to allow authenticated users to upload their own profile pictures
      await supabaseAdmin.storage.from("profiles").createPolicy({
        name: "Avatar Upload Policy",
        definition: {
          statements: [
            "CREATE POLICY avatar_upload_policy ON storage.objects FOR INSERT TO authenticated USING (bucket_id = 'profiles' AND auth.uid()::text = SUBSTRING(name FROM 1 FOR POSITION('/' IN name) - 1))"
          ],
        }
      });
      
      return new Response(
        JSON.stringify({ success: true, message: "Profiles bucket created!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Profiles bucket already exists" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
