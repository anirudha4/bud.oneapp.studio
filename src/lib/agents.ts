import { ItemType, ToolResult } from "@/lib/types"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { 
    initializeVectorStore, 
    getRelevantDocuments, 
    formatDocumentsForContext,
    addItemsToVectorStore,
    updateItemInVectorStore,
    removeItemFromVectorStore
} from "./vectorstore"
import { getSession } from "./session"

/**
 * Get AI instance with API key from session
 */
async function getAI() {
    const session = await getSession();
    
    if (!session?.apiKey) {
        throw new Error('Please go to settings "/settings" and set the API Key');
    }

    const google = createGoogleGenerativeAI({
        apiKey: session.apiKey
    });

    return google("gemini-2.0-flash-exp");
}

// Tool definitions
export type Tool = {
    name: string;
    description: string;
    parameters: any;
    execute: (params: any, context: { items: ItemType[] }) => Promise<ToolResult>;
}

// Tool: Search through items
export const searchItemsTool: Tool = {
    name: "search_items",
    description: "Search through existing items using AI-powered semantic similarity",
    parameters: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "The search query to find relevant items"
            },
            maxResults: {
                type: "number",
                description: "Maximum number of results to return (default: 5)",
                default: 5
            }
        },
        required: ["query"]
    },
    execute: async (params, context) => {
        try {
            await initializeVectorStore(context.items);
            const results = await getRelevantDocuments(params.query, params.maxResults || 5);
            
            // Generate AI-powered search summary
            const searchSummary = await generateAISearchSummary(params.query, results);
            
            return {
                toolName: "search_items",
                success: true,
                data: results.map(doc => doc.metadata),
                summary: searchSummary
            };
        } catch (error) {
            return {
                toolName: "search_items",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                summary: `<p>Failed to search items for "<em>${params.query}</em>"</p>`
            };
        }
    }
};

// Tool: Summarize items
export const summarizeItemsTool: Tool = {
    name: "summarize_items",
    description: "Generate an AI-powered summary of items based on filters",
    parameters: {
        type: "object",
        properties: {
            listName: {
                type: "string",
                description: "Filter by specific list name"
            },
            objectType: {
                type: "string", 
                description: "Filter by specific object type"
            },
            tags: {
                type: "array",
                items: { type: "string" },
                description: "Filter by specific tags"
            }
        }
    },
    execute: async (params, context) => {
        try {
            let filteredItems = context.items;
            
            if (params.listName) {
                filteredItems = filteredItems.filter(item => 
                    item.listName.toLowerCase() === params.listName.toLowerCase()
                );
            }
            
            if (params.objectType) {
                filteredItems = filteredItems.filter(item => 
                    item.objectType.toLowerCase() === params.objectType.toLowerCase()
                );
            }
            
            if (params.tags && params.tags.length > 0) {
                filteredItems = filteredItems.filter(item => 
                    params.tags.some((tag: string) => 
                        item.tags.some(itemTag => 
                            itemTag.toLowerCase().includes(tag.toLowerCase())
                        )
                    )
                );
            }
            
            // Generate AI-powered summary
            const aiSummary = await generateAISummary(filteredItems, params);
            
            // Basic data structure for compatibility
            const summary = {
                totalItems: filteredItems.length,
                byList: Object.entries(
                    filteredItems.reduce((acc, item) => {
                        acc[item.listName] = (acc[item.listName] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>)
                ),
                byObjectType: Object.entries(
                    filteredItems.reduce((acc, item) => {
                        acc[item.objectType] = (acc[item.objectType] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>)
                ),
                recentItems: filteredItems
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map(item => ({ name: item.name, listName: item.listName, objectType: item.objectType })),
                aiSummary: aiSummary
            };
            
            return {
                toolName: "summarize_items",
                success: true,
                data: summary,
                summary: aiSummary
            };
        } catch (error) {
            return {
                toolName: "summarize_items",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                summary: "<p>Failed to generate summary</p>"
            };
        }
    }
};

// Tool: Add new items
export const addItemsTool: Tool = {
    name: "add_items",
    description: "Add new items to the system with AI-powered validation and enhancement",
    parameters: {
        type: "object",
        properties: {
            items: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        listName: { type: "string" },
                        listIcon: { type: "string" },
                        objectType: { type: "string" },
                        objectIcon: { type: "string" },
                        isNote: { type: "boolean" },
                        isTask: { type: "boolean" },
                        icon: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        fields: { type: "object" }
                    },
                    required: ["name", "listName", "objectType"]
                }
            }
        },
        required: ["items"]
    },
    execute: async (params, context) => {
        try {
            const now = new Date().toISOString();
            const newItems: ItemType[] = params.items.map((item: any) => ({
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: item.name,
                description: item.description || '',
                listName: item.listName,
                listIcon: item.listIcon || '📋',
                objectType: item.objectType,
                objectIcon: item.objectIcon || '📄',
                isNote: item.isNote || false,
                isTask: item.isTask || false,
                icon: item.icon || '📄',
                tags: item.tags || [],
                fields: item.fields || {},
                createdAt: now,
                updatedAt: now
            }));
            
            // Add to vector store
            await addItemsToVectorStore(newItems);
            
            // Generate AI-powered summary of what was added
            const addSummary = await generateAIAddSummary(newItems);
            
            return {
                toolName: "add_items",
                success: true,
                data: newItems,
                summary: addSummary
            };
        } catch (error) {
            return {
                toolName: "add_items",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                summary: "<p>Failed to add items</p>"
            };
        }
    }
};

// Tool: Update existing items
export const updateItemsTool: Tool = {
    name: "update_items",
    description: "Update existing items in the system with AI-powered change analysis",
    parameters: {
        type: "object",
        properties: {
            updates: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        listName: { type: "string" },
                        listIcon: { type: "string" },
                        objectType: { type: "string" },
                        objectIcon: { type: "string" },
                        isNote: { type: "boolean" },
                        isTask: { type: "boolean" },
                        icon: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                        fields: { type: "object" }
                    },
                    required: ["id"]
                }
            }
        },
        required: ["updates"]
    },
    execute: async (params, context) => {
        try {
            const updatedItems: ItemType[] = [];
            const changes: { before: ItemType; after: ItemType }[] = [];
            
            for (const update of params.updates) {
                const existingItem = context.items.find(item => item.id === update.id);
                if (!existingItem) {
                    throw new Error(`Item with id ${update.id} not found`);
                }
                
                const updatedItem = {
                    ...existingItem,
                    ...update,
                    updatedAt: new Date().toISOString()
                };
                
                changes.push({ before: existingItem, after: updatedItem });
                await updateItemInVectorStore(updatedItem);
                updatedItems.push(updatedItem);
            }
            
            // Generate AI-powered update summary
            const updateSummary = await generateAIUpdateSummary(changes);
            
            return {
                toolName: "update_items",
                success: true,
                data: updatedItems,
                summary: updateSummary
            };
        } catch (error) {
            return {
                toolName: "update_items",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                summary: "<p>Failed to update items</p>"
            };
        }
    }
};

// Tool: Answer questions about items
export const questionItemsTool: Tool = {
    name: "question_items",
    description: "Answer questions about items using AI and context",
    parameters: {
        type: "object",
        properties: {
            question: {
                type: "string",
                description: "The question to answer about the items"
            }
        },
        required: ["question"]
    },
    execute: async (params, context) => {
        try {
            await initializeVectorStore(context.items);
            const relevantDocs = await getRelevantDocuments(params.question, 5);
            
            if (relevantDocs.length === 0) {
                return {
                    toolName: "question_items",
                    success: true,
                    data: { 
                        question: params.question, 
                        answer: "<p>I couldn't find any relevant items to answer your question.</p>",
                        relevantItems: [] 
                    },
                    summary: "<p>No relevant items found for the question</p>"
                };
            }
            
            // Generate AI-powered answer using the context
            const answer = await generateAIAnswerFromContext(params.question, relevantDocs);
            
            return {
                toolName: "question_items",
                success: true,
                data: { question: params.question, answer, relevantItems: relevantDocs.map(doc => doc.metadata) },
                summary: `Answered question about items using ${relevantDocs.length} relevant items`
            };
        } catch (error) {
            return {
                toolName: "question_items",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                summary: `<p>Failed to answer question: "<em>${params.question}</em>"</p>`
            };
        }
    }
};

// Helper function to clean markdown formatting from AI responses
function cleanMarkdownFromHTML(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```html\s*/gi, '');
    cleaned = cleaned.replace(/```\s*$/gi, '');
    cleaned = cleaned.replace(/```/g, '');
    
    // Remove any remaining markdown formatting
    cleaned = cleaned.replace(/^\s*```.*?$/gm, '');
    cleaned = cleaned.replace(/^```.*?\n/gm, '');
    cleaned = cleaned.replace(/\n```.*?$/gm, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
}

// AI-powered search summary generation
async function generateAISearchSummary(query: string, results: any[]): Promise<string> {
    try {
        const ai = await getAI();
        const result = await generateText({
            model: ai,
            prompt: `You are a productivity assistant. Summarize search results for a user's query.

Search Query: "${query}"
Found ${results.length} items

Instructions:
- Provide a concise, helpful summary in HTML format
- Use proper HTML tags like <p>, <strong>, <em>, <ul>, <li> etc.
- Mention the number of results and their relevance
- Be encouraging and actionable
- Keep it under 100 words
- Return ONLY HTML, no markdown or plain text
- Do NOT use code blocks or markdown formatting
- Do NOT prefix with html code blocks or suffix with closing blocks
- Start directly with HTML tags like <p>

HTML Summary:`,
            maxTokens: 150,
        });
        return cleanMarkdownFromHTML(result.text);
    } catch (error) {
        return `<p>Found <strong>${results.length}</strong> relevant items for "<em>${query}</em>"</p>`;
    }
}

// AI-powered summary generation
async function generateAISummary(items: ItemType[], params: any): Promise<string> {
    try {
        const filters = [];
        if (params.listName) filters.push(`list: ${params.listName}`);
        if (params.objectType) filters.push(`type: ${params.objectType}`);
        if (params.tags) filters.push(`tags: ${params.tags.join(', ')}`);

        const itemsSummary = items.slice(0, 10).map(item => ({
            name: item.name,
            type: item.objectType,
            list: item.listName,
            isTask: item.isTask,
            isNote: item.isNote,
            tags: item.tags
        }));

        const ai = await getAI();
        const result = await generateText({
            model: ai,
            prompt: `You are a productivity assistant. Create a helpful summary of the user's items.

Total Items: ${items.length}
Filters Applied: ${filters.length > 0 ? filters.join(', ') : 'None'}

Sample Items (showing up to 10):
${JSON.stringify(itemsSummary, null, 2)}

Instructions:
- Provide insights about their productivity and organization in HTML format
- Use proper HTML tags like <p>, <strong>, <em>, <ul>, <li>, <h3> etc.
- Highlight patterns, priorities, or suggestions
- Be encouraging and actionable
- Focus on what's most important
- Keep it conversational and under 200 words
- Return ONLY HTML, no markdown or plain text
- Do NOT use code blocks or markdown formatting
- Do NOT prefix with html code blocks or suffix with closing blocks
- Start directly with HTML tags like <p>

HTML Summary:`,
            maxTokens: 300,
        });
        return cleanMarkdownFromHTML(result.text);
    } catch (error) {
        const filterText = params.listName || params.objectType ? 
            ` from <em>${params.listName || ''}</em>${params.objectType ? ` of type <strong>${params.objectType}</strong>` : ''}` : '';
        return `<p>Summarized <strong>${items.length}</strong> items${filterText}</p>`;
    }
}

// AI-powered add summary generation
async function generateAIAddSummary(newItems: ItemType[]): Promise<string> {
    try {
        const itemsSummary = newItems.map(item => ({
            name: item.name,
            type: item.objectType,
            list: item.listName,
            description: item.description
        }));

        const ai = await getAI();
        const result = await generateText({
            model: ai,
            prompt: `You are a productivity assistant. Summarize what was just added to the user's workspace.

New Items Added:
${JSON.stringify(itemsSummary, null, 2)}

Instructions:
- Acknowledge what was successfully added in HTML format
- Use proper HTML tags like <p>, <strong>, <em>, <ul>, <li> etc.
- Be encouraging about their productivity
- Suggest next steps if appropriate
- Keep it positive and concise
- Under 100 words
- Return ONLY HTML, no markdown or plain text
- Do NOT use code blocks or markdown formatting
- Do NOT prefix with html code blocks or suffix with closing blocks
- Start directly with HTML tags like <p>

HTML Summary:`,
            maxTokens: 150,
        });
        return cleanMarkdownFromHTML(result.text);
    } catch (error) {
        return `<p>Added <strong>${newItems.length}</strong> new item(s): <em>${newItems.map(item => item.name).join(', ')}</em></p>`;
    }
}

// AI-powered update summary generation
async function generateAIUpdateSummary(changes: { before: ItemType; after: ItemType }[]): Promise<string> {
    try {
        const changesSummary = changes.map(change => ({
            item: change.after.name,
            changes: Object.keys(change.after).filter(key => 
                JSON.stringify(change.before[key as keyof ItemType]) !== JSON.stringify(change.after[key as keyof ItemType])
            )
        }));

        const ai = await getAI();
        const result = await generateText({
            model: ai,
            prompt: `You are a productivity assistant. Summarize what was just updated in the user's workspace.

Updates Made:
${JSON.stringify(changesSummary, null, 2)}

Instructions:
- Acknowledge what was successfully updated in HTML format
- Use proper HTML tags like <p>, <strong>, <em>, <ul>, <li> etc.
- Highlight the key changes made
- Be encouraging about their progress
- Keep it positive and concise
- Under 100 words
- Return ONLY HTML, no markdown or plain text
- Do NOT use code blocks or markdown formatting
- Do NOT prefix with html code blocks or suffix with closing blocks
- Start directly with HTML tags like <p>

HTML Summary:`,
            maxTokens: 150,
        });
        return cleanMarkdownFromHTML(result.text);
    } catch (error) {
        return `<p>Updated <strong>${changes.length}</strong> item(s): <em>${changes.map(c => c.after.name).join(', ')}</em></p>`;
    }
}

// AI-powered helper function to generate answers from context documents
async function generateAIAnswerFromContext(question: string, docs: any[]): Promise<string> {
    try {
        // Prepare context from documents
        const contextItems = docs.map(doc => {
            const meta = doc.metadata;
            return {
                name: meta.name,
                description: meta.description || '',
                type: meta.objectType,
                list: meta.listName,
                tags: meta.tags || [],
                isTask: meta.isTask,
                isNote: meta.isNote,
                score: meta.score
            };
        });

        // Generate AI response
        const ai = await getAI();
        const result = await generateText({
            model: ai,
            prompt: `You are a helpful productivity assistant. Answer the user's question based on their personal items.

Question: "${question}"

Available context (relevant items from their workspace):
${JSON.stringify(contextItems, null, 2)}

Instructions:
- Provide a helpful, natural answer based on the context in HTML format
- Use proper HTML tags like <p>, <strong>, <em>, <ul>, <li>, <h3> etc.
- If asking about counts, provide specific numbers
- If asking for lists, format them nicely with bullet points using <ul> and <li>
- If comparing items, organize by categories using proper HTML structure
- Be conversational and helpful
- Focus on the most relevant items first (higher scores are more relevant)
- If no relevant items, suggest what they might want to do instead
- Return ONLY HTML, no markdown or plain text
- Do NOT use code blocks or markdown formatting
- Do NOT prefix with html code blocks or suffix with closing blocks
- Start directly with HTML tags like <p>

HTML Answer:`,
            maxTokens: 500,
        });

        return cleanMarkdownFromHTML(result.text);
    } catch (error) {
        console.error("Error generating AI answer:", error);
        // Fallback to basic formatting if AI fails
        return generateBasicAnswerFromContext(question, docs);
    }
}

// Fallback function for basic answer generation
function generateBasicAnswerFromContext(question: string, docs: any[]): string {
    const itemsSummary = docs.map(doc => {
        const meta = doc.metadata;
        const tags = meta.tags?.length > 0 ? ` <span class="tags">(Tags: ${meta.tags.join(', ')})</span>` : '';
        return `<li><strong>${meta.name}</strong> - ${meta.description || 'No description'} <em>(${meta.objectType} in ${meta.listName})</em>${tags}</li>`;
    }).join('');
    
    return `<div><p>Based on your question, I found <strong>${docs.length}</strong> relevant item${docs.length === 1 ? '' : 's'}:</p><ul>${itemsSummary}</ul></div>`;
}

// Helper function to generate answers from context documents
function generateAnswerFromContext(question: string, docs: any[]): string {
    const questionLower = question.toLowerCase();
    
    // Analyze the question type
    const isCountQuestion = questionLower.includes('how many') || questionLower.includes('count');
    const isListQuestion = questionLower.includes('what are') || questionLower.includes('list') || questionLower.includes('show me');
    const isComparisonQuestion = questionLower.includes('compare') || questionLower.includes('difference');
    const isSearchQuestion = questionLower.includes('find') || questionLower.includes('search') || questionLower.includes('look for');
    
    if (isCountQuestion) {
        const count = docs.length;
        const itemTypes = docs.map(doc => doc.metadata.objectType);
        const uniqueTypes = [...new Set(itemTypes)];
        return `<p>I found <strong>${count}</strong> relevant item${count === 1 ? '' : 's'} related to your question. ${uniqueTypes.length > 1 ? `These include <em>${uniqueTypes.join(', ')}</em>.` : ''}</p>`;
    }
    
    if (isListQuestion || isSearchQuestion) {
        const items = docs.map(doc => {
            const meta = doc.metadata;
            return `<li><strong>${meta.name}</strong> <em>(${meta.objectType} in ${meta.listName})</em>${meta.description ? `: ${meta.description}` : ''}</li>`;
        });
        return `<div><p>Here are the relevant items I found:</p><ul>${items.join('')}</ul></div>`;
    }
    
    if (isComparisonQuestion) {
        const groupedByType = docs.reduce((acc, doc) => {
            const type = doc.metadata.objectType;
            if (!acc[type]) acc[type] = [];
            acc[type].push(doc.metadata);
            return acc;
        }, {} as Record<string, any[]>);
        
        const comparison = Object.entries(groupedByType).map(([type, items]) => 
            `<p><strong>${type}s</strong>: ${(items as any[]).map((item: any) => `<em>${item.name}</em>`).join(', ')}</p>`
        ).join('');
        
        return `<div><p>Based on your items, here's what I found:</p>${comparison}</div>`;
    }
    
    // Default comprehensive answer
    const itemsSummary = docs.map(doc => {
        const meta = doc.metadata;
        const tags = meta.tags?.length > 0 ? ` <span class="tags">(Tags: ${meta.tags.join(', ')})</span>` : '';
        return `<li><strong>${meta.name}</strong> - ${meta.description || 'No description'} <em>(${meta.objectType} in ${meta.listName})</em>${tags}</li>`;
    }).join('');
    
    const lists = [...new Set(docs.map(doc => doc.metadata.listName))];
    const types = [...new Set(docs.map(doc => doc.metadata.objectType))];
    
    let answer = `<div><p>Based on your question, I found <strong>${docs.length}</strong> relevant item${docs.length === 1 ? '' : 's'}`;
    
    if (lists.length > 1) {
        answer += ` across <strong>${lists.length}</strong> lists (<em>${lists.join(', ')}</em>)`;
    } else if (lists.length === 1) {
        answer += ` in the "<em>${lists[0]}</em>" list`;
    }
    
    if (types.length > 1) {
        answer += ` of different types (<em>${types.join(', ')}</em>)`;
    } else if (types.length === 1) {
        answer += ` of type "<em>${types[0]}</em>"`;
    }
    
    answer += ':</p><ul>' + itemsSummary + '</ul></div>';
    
    return answer;
}

// Available tools registry
export const AVAILABLE_TOOLS: Record<string, Tool> = {
    search_items: searchItemsTool,
    summarize_items: summarizeItemsTool,
    add_items: addItemsTool,
    update_items: updateItemsTool,
    question_items: questionItemsTool
};

// Tool execution function
export async function executeTool(
    toolName: string, 
    parameters: any, 
    context: { items: ItemType[] }
): Promise<ToolResult> {
    const tool = AVAILABLE_TOOLS[toolName];
    if (!tool) {
        return {
            toolName,
            success: false,
            error: `Tool "${toolName}" not found`,
            summary: `<p>Unknown tool: <em>${toolName}</em></p>`
        };
    }
    
    return await tool.execute(parameters, context);
}
