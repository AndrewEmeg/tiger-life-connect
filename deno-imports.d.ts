declare module "https://deno.land/std@0.177.0/http/server.ts" {
    export function serve(handler: (req: Request) => Promise<Response>): void;
}

declare module "https://esm.sh/stripe@13.0.0?target=deno" {
    export default class Stripe {
        constructor(apiKey: string, options?: { apiVersion: string });
        checkout: {
            sessions: {
                create(params: any): Promise<{ id: string; url: string }>;
            };
        };
    }
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
    export function createClient(
        supabaseUrl: string,
        supabaseKey: string,
        options?: { global?: { headers?: Record<string, string> } }
    ): {
        auth: {
            getUser(): Promise<{ data: { user: any }; error: any }>;
        };
        from(table: string): {
            insert(data: any): Promise<{ error: any }>;
        };
    };
}
