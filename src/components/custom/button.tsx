import { cn } from '@/lib/utils';
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;
const Button = ({ className, children, ...props }: Props) => {
    return (
        <button
            className={cn(
                'h-[38px] text-sm font-semibold cursor-pointer px-4',
                'border rounded-md hover:bg-accent transition-all flex items-center gap-3',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button