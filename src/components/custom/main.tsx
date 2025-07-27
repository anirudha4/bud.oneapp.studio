'use client'
import React from 'react'
import Item from './item'
import { useItemContext } from '../context/item-context'
import { cn } from '@/lib/utils'
import { heading } from '@/app/fonts'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select'
import GroupBy from './group-by'

type Props = {}

const Main = ({ }: Props) => {
    const { items, setGroupBy, groupBy } = useItemContext();
    return (
        <>
            <div className="flex items-center justify-between p-4 bg-background border-b sticky top-16 left-0">
                <h1 className={cn(
                    'text-lg font-medium flex items-center gap-2',
                    heading.className
                )}>Showing {items.length} items</h1>
                <Select onValueChange={setGroupBy} value={groupBy}>
                    <SelectTrigger className="w-[200px] bg-background cursor-pointer">
                        <SelectValue placeholder="Group By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectLabel>
                            Group By
                        </SelectLabel>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="listName">List</SelectItem>
                            <SelectItem value="objectType">Object</SelectItem>
                            <SelectItem value="createdAt">Created At</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 flex flex-col p-4">
                {groupBy === 'none' && (
                    <div className="columns-1 md:columns-2 gap-4 space-y-4 transition-all">
                        {items.map(item => (
                            <div key={item.id} className="break-inside-avoid mb-4">
                                <Item item={item} />
                            </div>
                        ))}
                    </div>
                )}
                {groupBy !== 'none' && (
                    <GroupBy />
                )}
            </div>
        </>
    )
}

export default Main