export type ItemType = {
    id: string;
    name: string;
    description?: string;
    fields: Record<string, any>;
    listName: string;
    listIcon: string;
    objectType: string;
    objectIcon: string;
    isNote: boolean;
    isTask: boolean;
    icon: string;
    tags: string[];
    createdAt: string,
    updatedAt: string
}

export type ToolResult = {
    toolName: string;
    success: boolean;
    data?: any;
    error?: string;
    summary: string;
}

export type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    toolResults?: ToolResult[];
    createdItems?: ItemType[];
    updatedItems?: ItemType[];
}