import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ItemType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { heading } from '@/app/fonts'
import Editor from './editor'
import { useItemContext } from '../context/item-context'
import { InlineEdit } from './inline-edit';
import { AlertCircle, Box, Calendar, ListChecks, Tag } from 'lucide-react'
import { Separator } from '../ui/separator'

type Props = {
    item: ItemType,
    children?: React.ReactNode
}

const ItemSheet = ({ item, children }: Props) => {
    const { updateItem } = useItemContext();

    const handleUpdateItem = (newItem: ItemType) => {
        updateItem(item.id, newItem);
    }
    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent
                className='min-w-[300px] md:min-w-[500px] overflow-auto'
            >
                <SheetHeader className='border-b'>
                    <SheetTitle
                        className={cn(
                            'flex items-center gap-3 text-lg font-semibold truncate w-[95%]',
                            heading.className
                        )}
                    >
                        <span>{item.icon}</span>
                        <InlineEdit
                            onSave={(value) => handleUpdateItem({
                                ...item,
                                name: value
                            })}
                            value={item.name}
                        />
                    </SheetTitle>
                </SheetHeader>

                <div className="p-6 pt-2 flex flex-col gap-4">
                    <Alert className='bg-accent/50'>
                        <AlertCircle />
                        <AlertDescription>
                            You can only edit the name and description of any item.
                        </AlertDescription>
                    </Alert>
                    <div className="flex flex-col gap-2">
                        <span className='text-sm font-medium text-muted-foreground'>Description</span>
                        <Editor html={item.description as string} onChange={(html) => handleUpdateItem({
                            ...item,
                            description: html
                        })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <span className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                            <ListChecks size={16} />
                            List
                        </span>
                        <InlineEdit
                            onSave={(value) => handleUpdateItem({
                                ...item,
                                listName: value
                            })}
                            disabled
                            value={item.listName}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <span className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                            <Box size={16} />
                            Object
                        </span>
                        <InlineEdit
                            onSave={(value) => handleUpdateItem({
                                ...item,
                                objectType: value
                            })}
                            disabled
                            value={item.objectType}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <span className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                            <Calendar size={16} />
                            Created At
                        </span>
                        <InlineEdit
                            onSave={(value) => handleUpdateItem({
                                ...item,
                                objectType: value
                            })}
                            disabled
                            value={item.createdAt}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <span className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                            <Tag size={16} />
                            Tags
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            {item.tags.map(tag => (
                                <InlineEdit
                                    key={tag}
                                    disabled
                                    onSave={(value) => handleUpdateItem({
                                        ...item,
                                        tags: item.tags.map(t => t === tag ? value : t)
                                    })}
                                    value={tag}
                                    className="bg-muted w-fit uppercase text-muted-foreground px-2 py-1 rounded-full text-xs"
                                />
                            ))}
                        </div>
                    </div>
                    {item.fields && Object.keys(item.fields).length > 0 && (
                        <div className="flex flex-col gap-2">
                            <Separator className='mb-5' />
                            {Object.entries(item.fields).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-2 gap-2">
                                    <span className='text-sm font-medium text-muted-foreground'>{key}</span>
                                    <InlineEdit
                                        disabled
                                        onSave={(newValue) => handleUpdateItem({
                                            ...item,
                                            fields: {
                                                ...item.fields,
                                                [key]: newValue
                                            }
                                        })}
                                        value={value}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet >
    )
}

export default ItemSheet