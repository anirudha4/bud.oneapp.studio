import { cn } from '@/lib/utils'
import React from 'react'
import { heading } from '../fonts'
import SettingForm from '@/components/custom/settings-form'
import { getSession } from '@/lib/session'

type Props = {}

const Settings = async ({ }: Props) => {
    const session = await getSession();
    console.log('session', session);
    
    return (
        <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between p-4 bg-background border-b sticky top-16 left-0">
                <h1 className={cn(
                    'text-lg font-medium flex items-center gap-2',
                    heading.className
                )}>
                    ⚙️ <span>Settings</span>
                </h1>
            </div>
            <SettingForm name={session?.name} apiKey={session?.apiKey} />
        </div>
    )
}

export default Settings