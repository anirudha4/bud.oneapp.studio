'use server'

import { cookies } from "next/headers";

export type Session = {
    name: string;
    apiKey: string;
};

export const setSession = async (name: string, apiKey: string) => {
    const session = {
        name,
        apiKey,
    };

    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    return session;
}

export const getSession = async (): Promise<Session | null> => {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');
        
        if (!sessionCookie?.value) {
            return null;
        }

        return JSON.parse(sessionCookie.value) as Session;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
}