'use client'
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Button from '@/components/custom/button'
import { setSession } from '@/lib/session'
import { toast } from 'sonner'

type Props = {
    name?: string;
    apiKey?: string;
}

const SettingForm = ({ apiKey = '', name = '' }: Props) => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formRef.current) {
            const formData = new FormData(formRef.current);
            const name = formData.get('name') as string;
            const apiKey = formData.get('apiKey') as string;
            await setSession(name, apiKey);
            toast.success('Settings saved successfully!');
        }
    };
    return (
        <div className="p-4">
            <div className="bg-background p-4 md:p-6 rounded-2xl border">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-medium">Personal Information</h2>
                </div>
                <form ref={formRef} onSubmit={handleSubmit} className='flex flex-col gap-4 mt-4'>
                    <div className="flex flex-col gap-2">
                        <Label>
                            Name
                        </Label>
                        <Input defaultValue={name} placeholder="Enter your name" name='name' />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>
                            API KEY
                        </Label>
                        <Input defaultValue={apiKey} placeholder="Enter your API key" name='apiKey' />
                    </div>
                    <Button className='w-fit bg-foreground text-background hover:text-background hover:bg-foreground border-none mt-3'>
                        Save Settings
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default SettingForm