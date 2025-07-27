'use server'
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { ItemType, ChatMessage, ToolResult } from "./types"
import { 
    initializeVectorStore, 
    getRelevantDocuments, 
    formatDocumentsForContext,
    addItemsToVectorStore,
    updateItemInVectorStore,
    removeItemFromVectorStore
} from "./vectorstore"
import { AVAILABLE_TOOLS, executeTool } from "./agents"
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

    return google("gemini-2.5-pro", {
        structuredOutputs: true,
        useSearchGrounding: true,
        dynamicRetrievalConfig: {
            mode: 'MODE_DYNAMIC'
        }
    });
}

const SYSTEM_PROMPTS = `
You are a versatile Productivity AI assistant for an app called Bud. You have access to various tools to help users manage their tasks, notes, events, meals, recipes and any other items whatever user asks for.

**Available Tools:**
${Object.values(AVAILABLE_TOOLS).map(tool => `
- ${tool.name}: ${tool.description}
  Parameters: ${JSON.stringify(tool.parameters, null, 2)}
`).join('')}

**Your Capabilities:**
1. **Tool Usage**: You can use tools to search, summarize, add, update, and answer questions about items
2. **Item Creation**: Create new items based on user requests
3. **Content Generation**: Generate content, draft emails, create lists, etc.
4. **Question Answering**: Answer questions about existing items or general knowledge

**Response Strategy:**
1. **Analyze Intent**: Determine if the user wants to:
   - Use tools (search, summarize, update existing items)
   - Create new items
   - Get information or generate content

2. **Tool Selection**: If tools are needed, decide which tools to use and in what order
3. **Response Format**: Always respond with a structured JSON containing:
   - message: Your conversational response to the user
   - toolCalls: Array of tool calls to execute (if any)
   - createItems: Array of new items to create (if any)

**Response Schema:**
{
  "message": "string", // Your conversational response
  "toolCalls": [
    {
      "toolName": "string",
      "parameters": object
    }
  ],
  "createItems": [
    {
      "listName": "string",
      "listIcon": "string",
      "objectType": "string", 
      "objectIcon": "string",
      "name": "string",
      "description": "string", // HTML format
      "tags": ["string"],
      "fields": object,
      "isNote": boolean,
      "isTask": boolean,
      "icon": "string"
    }
  ]
}

**Examples:**

*Input: "Show me all my work tasks"*
Response:
{
  "message": "I'll search for all your work-related tasks.",
  "toolCalls": [
    {
      "toolName": "search_items",
      "parameters": {
        "query": "work tasks",
        "maxResults": 10
      }
    }
  ],
  "createItems": []
}

*Input: "Add a task to buy groceries tomorrow"*
Response:
{
  "message": "I'll add a grocery shopping task for you.",
  "toolCalls": [],
  "createItems": [
    {
      "listName": "Personal",
      "listIcon": "�",
      "objectType": "Task",
      "objectIcon": "✅",
      "name": "Buy groceries",
      "description": "<div>Purchase groceries for tomorrow.</div>",
      "tags": ["shopping", "urgent"],
      "fields": {"Due Date": "Tomorrow"},
      "isNote": false,
      "isTask": true,
      "icon": "�"
    }
  ]
}

*Input: "What's the capital of Japan?"*
Response:
{
  "message": "The capital of Japan is Tokyo. It's been the capital since 1868 and is one of the world's most populous metropolitan areas.",
  "toolCalls": [],
  "createItems": []
}

**Guidelines:**
- Always provide a helpful conversational response in the message field
- Use tools when users want to interact with existing items
- Create new items when users explicitly request adding something
- Be concise but informative
- Maintain consistency with existing items when creating new ones
- Use appropriate icons and categorization
`


export const makeMetadata = async (items: ItemType[]) => {
    const lists = items.map(item => item.listName);
    const objectTypes = items.map(item => item.objectType);
    const tags = items.flatMap(item => item.tags);
    return {
        lists,
        objectTypes,
        tags
    }
}

export const parseUserInput = async (input: string, items: ItemType[]): Promise<ItemType | ItemType[]> => {
    const { lists, objectTypes, tags } = await makeMetadata(items);
    
    // Initialize vector store with existing items
    await initializeVectorStore(items);
    
    // Get relevant documents based on similarity search
    const relevantDocs = await getRelevantDocuments(input, 3);
    const contextFromSimilarItems = formatDocumentsForContext(relevantDocs);
    
    const prompt = `
**Context:**
- User Input: "${input}"

**Existing Data:**
- listNames: ${lists.join(', ') || 'None'}
- objectTypes: ${objectTypes.join(', ') || 'None'}
- tags: ${tags.join(', ') || 'None'}

**Similar Existing Items (for context):**
${contextFromSimilarItems}
`;

    try {
        const ai = await getAI();
        const response = await generateText({
            model: ai,
            prompt,
            system: SYSTEM_PROMPTS
        });

        // Remove code block markers like ```json or ```
        const cleanedText = response.text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        console.log("cleanedText", cleanedText);
        console.log("responseText", response.text);

        return JSON.parse(cleanedText) as ItemType | ItemType[];
    } catch (error: any) {
        console.error("Error generating object:", error);
        throw new Error(error.message || "An error occurred while processing your request.");
    }
}

export const parseUserInputWithAgent = async (
    input: string, 
    items: ItemType[],
    chatHistory: ChatMessage[] = []
): Promise<{
    message: string;
    toolResults: ToolResult[];
    createdItems: ItemType[];
    updatedItems: ItemType[];
}> => {
    const { lists, objectTypes, tags } = await makeMetadata(items);
    
    // Initialize vector store with existing items
    await initializeVectorStore(items);
    
    // Get relevant documents based on similarity search
    const relevantDocs = await getRelevantDocuments(input, 3);
    const contextFromSimilarItems = formatDocumentsForContext(relevantDocs);
    
    // Format recent chat history for context
    const recentHistory = chatHistory
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
    
    const prompt = `
**Context:**
- User Input: "${input}"

**Existing Data:**
- listNames: ${lists.join(', ') || 'None'}
- objectTypes: ${objectTypes.join(', ') || 'None'}
- tags: ${tags.join(', ') || 'None'}

**Similar Existing Items (for context):**
${contextFromSimilarItems}

**Recent Chat History:**
${recentHistory || 'No previous conversation'}

Please analyze the user input and provide a response with appropriate tool calls and/or item creation.
`;

    try {
        const ai = await getAI();
        const response = await generateText({
            model: ai,
            prompt,
            system: SYSTEM_PROMPTS
        });

        // Parse the response
        const cleanedText = response.text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();

        const aiResponse = JSON.parse(cleanedText) as {
            message: string;
            toolCalls?: Array<{ toolName: string; parameters: any }>;
            createItems?: ItemType[];
        };

        // Execute tool calls if any
        const toolResults: ToolResult[] = [];
        if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
            for (const toolCall of aiResponse.toolCalls) {
                const result = await executeTool(toolCall.toolName, toolCall.parameters, { items });
                toolResults.push(result);
            }
        }

        // Process created items
        const createdItems: ItemType[] = [];
        const updatedItems: ItemType[] = [];
        
        if (aiResponse.createItems && aiResponse.createItems.length > 0) {
            const now = new Date().toISOString();
            for (const item of aiResponse.createItems) {
                const newItem: ItemType = {
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
                };
                createdItems.push(newItem);
            }
            
            // Add to vector store
            if (createdItems.length > 0) {
                await addItemsToVectorStore(createdItems);
            }
        }

        // Check tool results for created/updated items
        for (const toolResult of toolResults) {
            if (toolResult.success && toolResult.data) {
                if (toolResult.toolName === 'add_items' && Array.isArray(toolResult.data)) {
                    createdItems.push(...toolResult.data);
                } else if (toolResult.toolName === 'update_items' && Array.isArray(toolResult.data)) {
                    updatedItems.push(...toolResult.data);
                }
            }
        }

        return {
            message: aiResponse.message,
            toolResults,
            createdItems,
            updatedItems
        };
    } catch (error) {
        console.error("Error in parseUserInputWithAgent:", error);
        return {
            message: "I apologize, but I encountered an error processing your request. Please try rephrasing your message.",
            toolResults: [],
            createdItems: [],
            updatedItems: []
        };
    }
}

/**
 * Vector store management functions
 * These functions should be called when items are added, updated, or deleted
 * to keep the vector store in sync with your data
 */

/**
 * Call this when new items are created
 */
export const syncNewItemsToVectorStore = async (newItems: ItemType[]) => {
    try {
        await addItemsToVectorStore(newItems);
        console.log(`Added ${newItems.length} items to vector store`);
    } catch (error) {
        console.error("Error syncing new items to vector store:", error);
    }
}

/**
 * Call this when an item is updated
 */
export const syncUpdatedItemToVectorStore = async (updatedItem: ItemType) => {
    try {
        await updateItemInVectorStore(updatedItem);
        console.log(`Updated item ${updatedItem.id} in vector store`);
    } catch (error) {
        console.error("Error syncing updated item to vector store:", error);
    }
}

/**
 * Call this when an item is deleted
 */
export const syncDeletedItemFromVectorStore = async (itemId: string) => {
    try {
        await removeItemFromVectorStore(itemId);
        console.log(`Removed item ${itemId} from vector store`);
    } catch (error) {
        console.error("Error removing item from vector store:", error);
    }
}

/**
 * Search for similar items without creating new ones
 * Useful for finding related content or avoiding duplicates
 */
export const findSimilarItems = async (query: string, allItems: ItemType[], k: number = 5) => {
    try {
        await initializeVectorStore(allItems);
        return await getRelevantDocuments(query, k);
    } catch (error) {
        console.error("Error finding similar items:", error);
        return [];
    }
}