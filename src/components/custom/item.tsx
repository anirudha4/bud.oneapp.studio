import { cn } from '@/lib/utils';
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import Button from './button';
import { PopoverClose } from '@radix-ui/react-popover';
import { useItemContext } from '../context/item-context';
import { ItemType } from '@/lib/types';
import { isEmpty } from 'lodash';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import ItemSheet from './item-sheet';

type Props = {
    item: ItemType;
}

const Item = ({
    item
}: Props) => {
    const { removeItem } = useItemContext();
    const handleDelete = () => {
        removeItem(item.id)
    }
    return (
        <div className="p-[2px] rounded-2xl bg-accent border" id={`item-${item.id}`}>
            <div className='rounded-xl bg-background shadow-2xl shadow-accent/20 border'>
                <ItemSheet item={item}>
                    <div className="flex items-center gap-3 h-12 px-4 border-b cursor-pointer">
                        {item.icon}
                        <h3 className='text-lg font-semibold truncate'>{item.name}</h3>
                    </div>
                </ItemSheet>
                <div className="p-4">
                    <p
                        className="text-sm text-muted-foreground leading-8 line-clamp-6"
                        dangerouslySetInnerHTML={{ __html: item.description as string }}
                    />
                </div>
                {!isEmpty(item.tags) && (
                    <div className="flex items-center min-h-12 overflow-x-auto px-4 border-t text-sm text-muted-foreground gap-1 py-1">
                        {item.tags.map(tag => (
                            <span key={tag} className='inline-block uppercase font-medium bg-muted text-muted-foreground px-2 py-1 whitespace-nowrap rounded-full text-xs'>{tag}</span>
                        ))}
                    </div>
                )}
                <div className="flex items-center justify-between h-12 px-4 border-t text-sm text-muted-foreground">
                    <div className="flex items-center gap-4 ">
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="flex items-center gap-3">
                                    {item.listIcon}
                                    <span>{item.listName}</span>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                List
                            </TooltipContent>
                        </Tooltip>
                        <div className="h-[25px] w-[2px] bg-accent"></div>
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="flex items-center gap-4">
                                    {item.objectIcon}
                                    <span>{item.objectType}</span>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                Object Type
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    "cursor-pointer rounded-2xl h-[30px] w-[30px] min-w-[30px]",
                                    "hover:bg-accent text-accent-foreground"
                                )}
                            >
                                🗑️
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0 rounded-xl' side='bottom' align='center'>
                            <div className="text-sm font-medium text-muted-foreground p-3 border-b">
                                Are you sure you want to delete this item?
                            </div>
                            <div className="flex items-center gap-3 justify-end py-2 px-3">
                                <Button onClick={handleDelete} className='text-red-500 hover:bg-red-50 border-red-100'>
                                    Delete
                                </Button>
                                <PopoverClose asChild>
                                    <Button>
                                        Cancel
                                    </Button>
                                </PopoverClose>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    )
}

export default Item