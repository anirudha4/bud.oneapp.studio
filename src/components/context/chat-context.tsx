'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChatMessage } from '@/lib/types';
import { v4 } from 'uuid';

type ChatContextType = {
    messages: ChatMessage[];
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    clearMessages: () => void;
    updateLastMessage: (updates: Partial<ChatMessage>) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chat-messages', []);

    const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
            ...message,
            id: v4(),
            timestamp: new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    const updateLastMessage = (updates: Partial<ChatMessage>) => {
        setMessages(prevMessages => {
            if (prevMessages.length === 0) return prevMessages;
            const lastIndex = prevMessages.length - 1;
            const updatedMessages = [...prevMessages];
            updatedMessages[lastIndex] = { ...updatedMessages[lastIndex], ...updates };
            return updatedMessages;
        });
    };

    return (
        <ChatContext.Provider value={{
            messages,
            addMessage,
            clearMessages,
            updateLastMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatContextProvider');
    }
    return context;
};
