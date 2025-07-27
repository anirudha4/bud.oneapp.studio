import React from 'react';
import { ItemType } from '@/lib/types';
import { cn } from '@/lib/utils';
import ItemSheet from './item-sheet';

type Props = {
    item: ItemType;
    compact?: boolean;
};

export const ItemCard = ({ item, compact = false }: Props) => {
    return (
        <ItemSheet item={item}>
            <div className={cn(
                "rounded-lg border cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                compact ? "p-2" : "p-3"
            )}>
                <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                        <div className={cn(
                            "font-medium text-gray-900 dark:text-gray-100 truncate",
                            compact ? "text-sm" : "text-base"
                        )}>
                            {item.name}
                        </div>

                        {!compact && item.description && (
                            <div
                                className="text-sm text-gray-600 dark:text-gray-300 mt-1"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                        )}

                        <div className={cn(
                            "flex items-center gap-2 mt-1",
                            compact ? "text-xs" : "text-sm"
                        )}>
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span>{item.listIcon}</span>
                                {item.listName}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span>{item.objectIcon}</span>
                                {item.objectType}
                            </span>

                            {/* {item.isTask && (
                                <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-blue-500 dark:text-blue-400 text-xs">Task</span>
                                </>
                            )}

                            {item.isNote && (
                                <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-green-500 dark:text-green-400 text-xs">Note</span>
                                </>
                            )} */}
                        </div>

                        {item.tags && item.tags.length > 0 && (
                            <div className={cn("flex flex-wrap gap-1 mt-1", compact ? "hidden" : "")}>
                                {item.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {item.tags.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        +{item.tags.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ItemSheet>
    );
};
