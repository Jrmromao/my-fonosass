'use client';

import {useState, useEffect} from 'react';
import {useUser} from '@clerk/nextjs';
import {getCurrentUserRole} from "@/utils";


type UserRole = 'ADMIN' | 'USER' | 'GUEST';

/**
 * Hook that uses server action to fetch user role
 */
export function useUserRole() {
    const {isLoaded, isSignedIn} = useUser();
    const [role, setRole] = useState<UserRole>('GUEST');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            if (!isLoaded) return;
            try {
                setIsLoading(true);
                // If not signed in, no need to call the server
                if (!isSignedIn) {
                    setRole('GUEST');
                    return;
                }
                // Use server action to get role
                const userRole = await getCurrentUserRole();
                setRole(userRole);
            } catch (error) {
                console.error('Error fetching role:', error);
                setRole('USER'); // Default fallback
            } finally {
                setIsLoading(false);
            }
        }

        fetchRole();
    }, [isLoaded, isSignedIn]);

    return {role, isLoading: !isLoaded || isLoading};
}