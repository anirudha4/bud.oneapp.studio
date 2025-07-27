import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import Link from 'next/link'

type Props = {}

const SidebarLinks = ({ }: Props) => {
    return (
        <div className="flex-1 flex flex-col mt-5 justify-between">
            <div className="flex flex-col gap-2 items-center">
                <SidebarLink href={'/'} icon={'🛖'} label={'Home'} />
                <SidebarLink href={'/settings'} icon={'⚙️'} label={'Settings'} />
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className='h-[40px] w-[40px] flex items-center justify-center rounded-2xl hover:bg-accent transition-all cursor-pointer text-xl mx-auto mb-5'>
                        <span>🚪</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side='right'>
                    <p className='text-sm'>Logout</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

export default SidebarLinks

export const SidebarLink = ({
    href,
    icon,
    label,
    active = false,
}: {
    href: string;
    icon: string;
    label: string;
    active?: boolean;
}) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href={href} className='h-[40px] w-[40px] flex items-center justify-center rounded-xl hover:bg-accent transition-all cursor-pointer text-xl'>
                    {icon}
                </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>
                <p className='text-sm'>{label}</p>
            </TooltipContent>
        </Tooltip>
    )
}