import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface UserProfile {
    profile_image?: string;
    full_name?: string;
    // Add other profile fields here as needed
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (
        email: string,
        password: string,
        fullName: string
    ) => Promise<void>;
    signOut: () => Promise<void>;
    updateUserProfile: (profileData: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    // Function to update user profile in the context
    const updateUserProfile = (profileData: UserProfile) => {
        if (user) {
            setUser({
                ...user,
                user_metadata: {
                    ...user.user_metadata,
                    ...profileData,
                },
            });
        }
    };

    useEffect(() => {
        // Listen to auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (event === "SIGNED_IN") {
                const url = new URL(window.location.href);

                // Pages we don't want to redirect from after sign-in
                const allowlistPaths = [
                    "/checkout-success",
                    "/marketplace",
                    "/services",
                    "/events",
                    "/product",
                    "/service",
                    "/profile",
                    "/messages",
                ];

                const isAllowlisted = allowlistPaths.some((path) =>
                    url.pathname.startsWith(path)
                );
                const hasSessionId = url.searchParams.has("session_id");

                // Only redirect if not already on an allowed page
                if (
                    !isAllowlisted &&
                    !(url.pathname === "/checkout-success" && hasSessionId)
                ) {
                    navigate("/");
                }

                toast.success("Successfully signed in!");
            }

            if (event === "SIGNED_OUT") {
                navigate("/auth");
                toast.info("Signed out");
            }
        });

        // Load any existing session on mount
        supabase.auth
            .getSession()
            .then(({ data: { session: currentSession } }) => {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
            });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signUp = async (
        email: string,
        password: string,
        fullName: string
    ) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                signIn,
                signUp,
                signOut,
                updateUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
