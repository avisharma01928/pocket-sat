import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { syncData } from '@/lib/sync';

export const AutoSync = () => {
    useEffect(() => {
        const runSync = async (isSilent: boolean) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await syncData(session.user.id, isSilent);
            }
        };

        // Initial sync on mount (silent)
        runSync(true);

        // Sync every minute (silent)
        const interval = setInterval(() => {
            runSync(true);
        }, 60000);

        // Sync on login (not silent, so user knows)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await syncData(session.user.id, false);
            }
        });

        return () => {
            clearInterval(interval);
            subscription.unsubscribe();
        };
    }, []);

    return null;
};
