
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Debug log to confirm if Stripe secret is available
    console.log("STRIPE KEY EXISTS:", !!Deno.env.get("STRIPE_SECRET_KEY"));

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
            apiVersion: "2023-10-16",
        });

        // Get the request body
        const body = await req.json();
        const { itemId, itemType, price, title, description, sellerId } = body;

        console.log("Received checkout request:", {
            itemId,
            itemType,
            price,
            title,
            description,
            sellerId,
        });

        if (!itemId || !itemType || !price || !title || !sellerId) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 400,
                }
            );
        }

        // Get the JWT token from the Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "No authorization header" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                    status: 401,
                }
            );
        }

        // Connect to Supabase with the client's JWT token
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: authHeader } },
            }
        );

        const {
            data: { user },
            error,
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 401,
            });
        }

        console.log("User authenticated:", user.id);

        // Fallback for origin header
        const origin = req.headers.get("origin") ?? "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: title,
                            description: description || "",
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/${itemType === "product" ? "marketplace" : "services"}`,
        });

        console.log("Stripe session created:", session.id);

        // Insert order into Supabase using service role key
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
            { auth: { persistSession: false } }
        );

        const { error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                buyer_id: user.id,
                seller_id: sellerId,
                item_type: itemType,
                item_id: itemId,
                price: price,
                status: "processing", // Explicitly string-literal 
                stripe_session_id: session.id,
            });

        if (orderError) {
            console.error("Error creating order:", orderError);
        } else {
            console.log("Order created successfully");
        }

        return new Response(JSON.stringify({ url: session.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error in create-checkout:", {
            message: error.message,
            stack: error.stack,
            raw: error,
        });
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
