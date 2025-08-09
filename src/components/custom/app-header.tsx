'use client'
import React from 'react'
import Button from './button'
import { Download, Trash, Upload } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { PopoverClose } from '@radix-ui/react-popover'

type Props = {}

const AppHeader = ({ }: Props) => {
    const clearAll = async () => {
        localStorage.clear();
        window.location.reload();
    }
    return (
        <div className="min-h-16 sticky top-0 left-0 w-full border-b bg-background px-4 flex justify-between items-center">
            <div className=""></div>
            <div className="flex items-center gap-3">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button>
                            <Trash size={16} />
                            Delete All Data
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='p-0 rounded-xl' side='bottom' align='center'>
                        <div className="text-sm font-medium text-muted-foreground p-3 border-b">
                            Are you sure you want to clear all data?
                        </div>
                        <div className="flex items-center gap-3 justify-end py-2 px-3">
                            <Button onClick={clearAll} className='text-red-500 hover:bg-red-50 border-red-100'>
                                Clear
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
    )
}

export default AppHeader