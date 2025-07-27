'use client'
import React, { useRef, useEffect } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { heading } from '@/app/fonts'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
import AIInputTextArea from '../ui/ai-input-textarea'
import { useChatContext } from '../context/chat-context'
import { ChatMessageComponent } from './chat-message'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import Button from './button'
import { PopoverClose } from '@radix-ui/react-popover'

type Props = {}

const AIChat = ({ }: Props) => {
    const { messages, clearMessages } = useChatContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="max-w-[500px] w-full border-l bg-white flex flex-col">
            <div className="h-16 border-b items-center justify-between flex px-4">
                <div className="flex items-center gap-3">
                    <Image src={'/logo.svg'} width={30} height={30} alt='Bud Logo' />
                    <h1 className={cn(
                        "text-lg font-semibold",
                        heading.className
                    )}>Ask Bud</h1>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <div
                            className='h-[40px] w-[40px] flex items-center justify-center rounded-xl hover:bg-accent transition-all cursor-pointer text-xl'
                        >
                            🚫
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className='p-0 rounded-xl' side='bottom' align='center'>
                        <div className="text-sm font-medium text-muted-foreground p-3 border-b">
                            Are you sure you want to clear the chat?
                        </div>
                        <div className="flex items-center gap-3 justify-end py-2 px-3">
                            <Button onClick={clearMessages} className='text-red-500 hover:bg-red-50 border-red-100'>
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

            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="mb-4">
                            <Image src="/logo.svg" alt="AI Icon" width={64} height={64} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Welcome to Bud AI!</h3>
                        <p className="text-gray-500 max-w-sm">
                            I can help you organize, search, and interact with your items. Ask questions, get insights, and discover new ways to make the most of your workspace. Just start typing below!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <ChatMessageComponent key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <AIInputTextArea />
        </div>
    )
}

export default AIChat