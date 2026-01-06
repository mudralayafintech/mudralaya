import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async (userId, userPhone) => {
            if (!userId) {
                setProfile(null);
                return;
            }
            try {
                // 1. Direct fetch from database
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) {
                    // PGRST116 means 0 rows found when .single() expected one
                    if (error.code === 'PGRST116') {
                        console.warn("User profile missing. Creating default profile...");

                        // 2. Self-Healing: Create or Ensure the missing row exists
                        // Use upsert to handle race conditions (409 Conflict)
                        const { data: newData, error: createError } = await supabase
                            .from('users')
                            .upsert([
                                {
                                    id: userId,
                                    phone: userPhone, // Use the passed phone number directly
                                    role: 'user',
                                    updated_at: new Date()
                                }
                            ], { onConflict: 'id', ignoreDuplicates: true })
                            .select(); // REMOVED .single() to avoid PGRST116 on ignored duplicate

                        if (createError) {
                            console.error("Failed to create/ensure profile:", createError);
                        } else if (newData && newData.length > 0) {
                            console.log("Created/Ensured default profile successfully");
                            setProfile(newData[0]);
                        } else {
                            // upsert with ignoreDuplicates returns empty array [] if row existed.
                            // So we fetch one more time.
                            const { data: retryData } = await supabase
                                .from('users')
                                .select('*')
                                .eq('id', userId)
                                .single();

                            if (retryData) {
                                console.log("Fetched existing profile after conflict resolution");
                                setProfile(retryData);
                            }
                        }
                    } else {
                        console.error("Profile fetch error (direct):", error.message);
                    }
                } else if (data) {
                    console.log("Profile fetched successfully (direct)");
                    setProfile(data);
                }
            } catch (err) {
                console.error("Unexpected error in fetchProfile:", err);
            }
        };

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id, session.user.phone);
            }
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id, session.user.phone);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        user,
        profile,
        loading
    };

    return (
        <UserContext.Provider value={value}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
