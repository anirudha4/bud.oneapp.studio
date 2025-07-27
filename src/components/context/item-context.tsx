'use client';
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ItemType } from '@/lib/types';

type Item = ItemType
type List = {
    name: string;
    items: Item[];
    icon: string;
}
type ObjectType = {
    name: string;
    icon: string;
    items: Item[]
}

type GroupBy = 'listName' | 'objectType' | 'tags' | 'createdAt' | 'none';

type ItemContextType = {
    items: Item[];
    addItems: (items: Item[]) => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, record: Partial<Item>) => void;
    lists: List[];
    objectTypes: ObjectType[];
    groupBy: GroupBy;
    setGroupBy: (groupBy: GroupBy) => void;
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemContextProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useLocalStorage<Item[]>('items', []);
    const [groupBy, setGroupBy] = useLocalStorage<GroupBy>('groupBy', 'none');

    const lists = useMemo(() => {
        const lists: { [key: string]: List } = {};
        items.forEach(item => {
            if (!lists[item.listName]) {
                lists[item.listName] = { name: item.listName, items: [], icon: item.listIcon };
            }
            lists[item.listName].items.push(item);
        });
        return Object.values(lists);
    }, [items])
    const objectTypes = useMemo(() => {
        const types: { [key: string]: ObjectType } = {};
        items.forEach(item => {
            if (!types[item.objectType]) {
                types[item.objectType] = { name: item.objectType, icon: item.objectIcon, items: [] };
            }
            types[item.objectType].items.push(item);
        });
        return Object.values(types);
    }, [items]);

    const addItems = (item: Item[]) => setItems([...items, ...item]);
    const removeItem = (id: string) =>
        setItems(items.filter(item => item.id !== id));
    const updateItem = (id: string, record: Partial<Item>) => {
        setItems(items.map(item => item.id === id ? { ...item, ...record } : item));
    };

    return (
        <ItemContext.Provider value={{
            items,
            addItems,
            removeItem,
            lists,
            objectTypes,
            groupBy,
            setGroupBy,
            updateItem
        }}>
            {children}
        </ItemContext.Provider>
    );
};

export const useItemContext = () => {
    const context = useContext(ItemContext);
    if (!context) {
        throw new Error('useItemContext must be used within an ItemContextProvider');
    }
    return context;
};