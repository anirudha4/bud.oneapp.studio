'use client'
import { parseUserInput } from '@/lib/ai';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import Image from 'next/image';
import React from 'react'
import { toast } from 'sonner';
import { v4 } from 'uuid';
import { useItemContext } from '../context/item-context';
import moment from 'moment';

type Props = {}

const AIInput = ({ }: Props) => {
    const [inputValue, setInputValue] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const { items, addItems } = useItemContext();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '') return;
        try {
            setLoading(true);
            const response = await parseUserInput(inputValue, items);
            if (Array.isArray(response)) {
                const newItems = response.map(item => ({
                    ...item,
                    id: v4(),
                    createdAt: moment().format('Do MM, YYYY'),
                    updatedAt: moment().format('Do MM, YYYY')
                }));
                addItems([...newItems]);
            } else if (typeof response === 'object' && response !== null) {
                response.id = v4();
                response.createdAt = moment().format('Do MM, YYYY');
                response.updatedAt = moment().format('Do MM, YYYY');
                addItems([response]);
            } else {
                throw new Error('Invalid response format');
            }
            setInputValue('');
        } catch (error) {
            toast.error("Failed to understand the input. Please try to rephrase.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="h-16 px-4">
            <form onSubmit={handleSubmit} className='border bg-background rounded-2xl shadow-2xl max-w-[900px] w-full flex items-center focus-within:border-purple-300 overflow-hidden'>
                <input
                    autoFocus
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className='max-w-[900px] w-full h-full outline-none p-4'
                    placeholder='How can I help you?'
                    type='text'
                />
                <button className="p-4 border-l hover:bg-accent cursor-pointer outline-none">
                    {loading ? <LoaderCircle size={18} className='text-muted-foreground animate-spin' /> : <ArrowRight size={18} className='text-muted-foreground' />}
                </button>
            </form>
        </div>
    )
}

export default AIInput