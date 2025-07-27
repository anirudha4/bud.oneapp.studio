import React from 'react';
import { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ItemCard } from './item-card';
import { ToolResultCard } from './tool-result-card';

type Props = {
    message: ChatMessage;
};

export const ChatMessageComponent = ({ message }: Props) => {
    const isUser = message.role === 'user';
    
    return (
        <div className={cn(
            "flex w-full mb-4",
            isUser ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm border",
                isUser 
                    ? "bg-accent text-accent-foreground ml-auto" 
                    : "bg-white text-indigo-600"
            )}>
                <div className="whitespace-pre-wrap break-words">
                    {message.content}
                </div>
                
                {message.toolResults && message.toolResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {message.toolResults.map((result, index) => (
                            <ToolResultCard key={index} result={result} />
                        ))}
                    </div>
                )}
                
                {/* Created Items */}
                {message.createdItems && message.createdItems.length > 0 && (
                    <div className="mt-3">
                        <div className="text-sm font-medium mb-2 opacity-75">
                            ✨ Created {message.createdItems.length} item(s):
                        </div>
                        <div className="space-y-2">
                            {message.createdItems.map((item) => (
                                <ItemCard key={item.id} item={item} compact />
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Updated Items */}
                {message.updatedItems && message.updatedItems.length > 0 && (
                    <div className="mt-3">
                        <div className="text-sm font-medium mb-2 opacity-75">
                            📝 Updated {message.updatedItems.length} item(s):
                        </div>
                        <div className="space-y-2">
                            {message.updatedItems.map((item) => (
                                <ItemCard key={item.id} item={item} compact />
                            ))}
                        </div>
                    </div>
                )}
                
                <div className={cn(
                    "text-xs mt-2 text-gray-500"
                )}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
};
