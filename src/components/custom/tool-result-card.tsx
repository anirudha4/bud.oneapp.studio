import React from 'react';
import { ToolResult } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
    result: ToolResult;
};

export const ToolResultCard = ({ result }: Props) => {
    const getToolIcon = (toolName: string) => {
        switch (toolName) {
            case 'search_items': return '🔍';
            case 'summarize_items': return '📊';
            case 'add_items': return '➕';
            case 'update_items': return '✏️';
            case 'question_items': return '❓';
            default: return '🔧';
        }
    };

    const getToolName = (toolName: string) => {
        switch (toolName) {
            case 'search_items': return 'Search Items';
            case 'summarize_items': return 'Summarize Items';
            case 'add_items': return 'Add Items';
            case 'update_items': return 'Update Items';
            case 'question_items': return 'Question Items';
            default: return toolName;
        }
    };

    return (
        <div className={cn(
            // "rounded-lg border p-3 text-sm",
            // result.success 
                // ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                // : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        )}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{getToolIcon(result.toolName)}</span>
                <span className="font-medium">{getToolName(result.toolName)}</span>
                <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    result.success 
                        ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200"
                        : "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200"
                )}>
                    {result.success ? 'Success' : 'Failed'}
                </span>
            </div>

            <div className="text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: result.data?.answer || result.summary }} />

            {result.error && (
                <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                    Error: {result.error}
                </div>
            )}
            
            {result.success && result.data && result.toolName === 'search_items' && Array.isArray(result.data) && (
                <div className="mt-2">
                    <div className="text-xs font-medium mb-1">Found {result.data.length} items:</div>
                    <div className="space-y-1">
                        {result.data.map((item: any, index: number) => (
                            <div key={index} className="text-xs bg-white dark:bg-gray-700 rounded p-2">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                    in {item.listName}
                                </span>
                            </div>
                        ))}
                        {result.data.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                ... and {result.data.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            )}
    
        </div>
    );
};
