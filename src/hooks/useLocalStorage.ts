'use client'
import { useState, useEffect } from "react";

export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((prevValue: T) => T)) => void] => {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    useEffect(() => {
        try {
            const item = typeof window !== "undefined" ? localStorage.getItem(key) : null;
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const setValue = (value: T | ((prevValue: T) => T)) => {
        try {
            setStoredValue(prevValue => {
                const newValue = typeof value === 'function' ? (value as (prevValue: T) => T)(prevValue) : value;
                if (typeof window !== "undefined") {
                    localStorage.setItem(key, JSON.stringify(newValue));
                }
                return newValue;
            });
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}