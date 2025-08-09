"use client";

import { ArrowRight, Bot, Check, ChevronDown, Paperclip, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { parseUserInputWithAgent } from '@/lib/ai';
import { toast } from 'sonner';
import { useItemContext } from '../context/item-context';
import { useChatContext } from '../context/chat-context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import Button from "../custom/button";
import { unstable_batchedUpdates } from "react-dom";

const AI_MODELS = [
    "Gemini 2.5 Flash",
];

const MODEL_ICONS: Record<string, React.ReactNode> = {
    "Gemini 2.5 Flash": (
        <svg
            height="1em"
            style={{ flex: "none", lineHeight: "1" }}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>Gemini</title>
            <defs>
                <linearGradient
                    id="lobe-icons-gemini-fill"
                    x1="0%"
                    x2="68.73%"
                    y1="100%"
                    y2="30.395%"
                >
                    <stop offset="0%" stopColor="#1C7DFF" />
                    <stop offset="52.021%" stopColor="#1C69FF" />
                    <stop offset="100%" stopColor="#F0DCD6" />
                </linearGradient>
            </defs>
            <path
                d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
                fill="url(#lobe-icons-gemini-fill)"
                fillRule="nonzero"
            />
        </svg>
    ),
};

export default function AIInputTextArea() {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 72,
        maxHeight: 300,
    });
    const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash");
    const { items, addItems, updateItem } = useItemContext();
    const { messages, addMessage } = useChatContext();

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (value.trim() === '') return;

        const userMessage = value.trim();
        setValue('');
        adjustHeight(true);

        try {
            setLoading(true);

            // Add user message to chat
            addMessage({
                role: 'user',
                content: userMessage
            });

            // Get AI response with agent system
            const response = await parseUserInputWithAgent(userMessage, items, messages);

            // Update context and add assistant message in batched updates
            unstable_batchedUpdates(() => {
                // Add items to context if any were created
                if (response.createdItems.length > 0) {
                    addItems(response.createdItems);
                }

                // Update items if any were updated
                if (response.updatedItems.length > 0) {
                    response.updatedItems.forEach(item => {
                        updateItem(item.id, item);
                    });
                }

                // Add assistant message to chat
                addMessage({
                    role: 'assistant',
                    content: response.message,
                    toolResults: response.toolResults,
                    createdItems: response.createdItems,
                    updatedItems: response.updatedItems
                });
            });

        } catch (error: any) {
            console.error('Error in AI chat:', error);
            toast.error("Failed to process your request. Please try again.");

            // Add error message to chat
            addMessage({
                role: 'assistant',
                content: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full p-3">
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 pt-4">
                <div className="flex items-center gap-2 mb-2.5 mx-2">
                    <div className="flex-1 flex items-center gap-2">
                        <h3 className="text-black dark:text-white/90 text-xs tracking-tighter">
                            Ask anything to <span className="font-semibold">Bud</span> to get started.
                        </h3>
                    </div>
                </div>
                <div className="relative">
                    <div className="relative flex flex-col border overflow-hidden border-transparent focus-within:border-border rounded-xl">
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "400px" }}
                        >
                            <Textarea
                                id="ai-input-15"
                                value={value}
                                placeholder={`What can I do for you?\nType @Task, @Note, @Event etc. to create a new item.`}
                                className={cn(
                                    "w-full border-none rounded-b-none px-4 py-3 bg-background dark:text-white placeholder:text-black/70 dark:placeholder:text-white/70 resize-none focus-visible:ring-0 focus-visible:ring-offset-0",
                                    "min-h-[80px] placeholder:leading-[25px]"
                                )}
                                ref={textareaRef}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                            />
                        </div>

                        <div className="h-14 bg-background rounded-b-xl flex items-center">
                            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between w-[calc(100%-24px)]">
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                className="flex items-center gap-1 h-8 pl-1 pr-2 text-xs rounded-md dark:text-white hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                            >
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={selectedModel}
                                                        initial={{
                                                            opacity: 0,
                                                            y: -5,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 5,
                                                        }}
                                                        transition={{
                                                            duration: 0.15,
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {
                                                            MODEL_ICONS[
                                                            selectedModel
                                                            ]
                                                        }
                                                        {selectedModel}
                                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                                    </motion.div>
                                                </AnimatePresence>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className={cn(
                                                "min-w-[10rem]",
                                                "border-black/10 dark:border-white/10",
                                                "bg-gradient-to-b from-white via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800"
                                            )}
                                        >
                                            {AI_MODELS.map((model) => (
                                                <DropdownMenuItem
                                                    key={model}
                                                    onSelect={() =>
                                                        setSelectedModel(model)
                                                    }
                                                    className="flex items-center justify-between gap-2"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {MODEL_ICONS[model] || (
                                                            <Bot className="w-4 h-4 opacity-50" />
                                                        )}{" "}
                                                        <span>{model}</span>
                                                    </div>
                                                    {selectedModel ===
                                                        model && (
                                                            <Check className="w-4 h-4 text-blue-500" />
                                                        )}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
                                    <label
                                        className={cn(
                                            "rounded-lg p-2 bg-black/5 dark:bg-white/5 cursor-pointer",
                                            "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500",
                                            "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                                        )}
                                        aria-label="Attach file"
                                    >
                                        <input type="file" className="hidden" />
                                        <Paperclip className="w-4 h-4 transition-colors" />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className={cn(
                                        "rounded-lg p-2 bg-black/5 dark:bg-white/5 ml-auto",
                                        "hover:bg-black/10 dark:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-blue-500"
                                    )}
                                    aria-label="Send message"
                                    disabled={!value.trim() || loading}
                                    onClick={handleSubmit}
                                >
                                    {loading ? (
                                        <LoaderCircle className="w-4 h-4 text-muted-foreground animate-spin" />
                                    ) : (
                                        <ArrowRight
                                            className={cn(
                                                "w-4 h-4 dark:text-white transition-opacity duration-200",
                                                value.trim()
                                                    ? "opacity-100"
                                                    : "opacity-30"
                                            )}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
