/**
 * Example Usage of LangChain Vector Store Integration
 * 
 * This file demonstrates how to use the new vector store functionality
 * with the AI parsing system.
 */

import { ItemType } from "../lib/types";
import { 
    parseUserInput, 
    syncNewItemsToVectorStore, 
    syncUpdatedItemToVectorStore,
    syncDeletedItemFromVectorStore,
    findSimilarItems
} from "../lib/ai";
import { initializeVectorStore, searchSimilarItems } from "../lib/vectorstore";

// Example usage scenarios

/**
 * Scenario 1: Basic AI parsing with vector similarity context
 */
export async function exampleBasicParsing() {
    const existingItems: ItemType[] = [
        {
            id: "1",
            name: "Buy groceries",
            description: "Need to buy milk, bread, and eggs",
            listName: "Shopping",
            listIcon: "🛒",
            objectType: "Task",
            objectIcon: "✅",
            isNote: false,
            isTask: true,
            icon: "🥛",
            tags: ["shopping", "food", "urgent"],
            fields: { "store": "Whole Foods", "budget": "$50" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: "2", 
            name: "Team meeting notes",
            description: "Discussed project timeline and deliverables",
            listName: "Work",
            listIcon: "💼",
            objectType: "Note",
            objectIcon: "📝",
            isNote: true,
            isTask: false,
            icon: "👥",
            tags: ["meeting", "work", "project"],
            fields: { "attendees": "John, Sarah, Mike", "duration": "1 hour" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // The AI will now use vector similarity to find relevant context
    const userInput = "Add task to buy organic vegetables";
    const result = await parseUserInput(userInput, existingItems);
    
    console.log("AI parsed result with vector context:", result);
    
    // The AI should recognize this is similar to the existing grocery item
    // and maintain consistency in listName, tags, etc.
}

/**
 * Scenario 2: Managing vector store lifecycle
 */
export async function exampleVectorStoreLifecycle() {
    const initialItems: ItemType[] = [
        // ... your existing items
    ];

    // 1. Initialize vector store
    await initializeVectorStore(initialItems);

    // 2. When new items are created via AI
    const newUserInput = "Schedule dentist appointment";
    const newItems = await parseUserInput(newUserInput, initialItems);
    
    // Sync new items to vector store
    if (Array.isArray(newItems)) {
        await syncNewItemsToVectorStore(newItems);
    } else {
        await syncNewItemsToVectorStore([newItems]);
    }

    // 3. When an item is updated
    const updatedItem: ItemType = {
        id: "1",
        name: "Buy organic groceries", // Updated name
        description: "Need to buy organic milk, bread, and eggs",
        // ... other fields
        listName: "Shopping",
        listIcon: "🛒",
        objectType: "Task", 
        objectIcon: "✅",
        isNote: false,
        isTask: true,
        icon: "🥛",
        tags: ["shopping", "food", "organic"],
        fields: { "store": "Whole Foods", "budget": "$60" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    await syncUpdatedItemToVectorStore(updatedItem);

    // 4. When an item is deleted
    await syncDeletedItemFromVectorStore("some-item-id");
}

/**
 * Scenario 3: Direct similarity search
 */
export async function exampleSimilaritySearch() {
    const allItems: ItemType[] = [
        // ... your items
    ];

    // Find items similar to a query
    const query = "project management";
    const similarDocs = await findSimilarItems(query, allItems, 5);
    
    console.log("Similar items found:", similarDocs.map(doc => ({
        name: doc.metadata.name,
        score: doc.metadata.score,
        type: doc.metadata.objectType
    })));

    // Direct vector store search (more control)
    await initializeVectorStore(allItems);
    const searchResults = await searchSimilarItems(query, 3, 0.7);
    
    console.log("Direct search results:", searchResults);
}

/**
 * Scenario 4: Advanced context-aware parsing
 */
export async function exampleContextAwareParsing() {
    const projectItems: ItemType[] = [
        {
            id: "proj-1",
            name: "Design system research",
            description: "Research best practices for design systems",
            listName: "Design Project",
            listIcon: "🎨",
            objectType: "Research",
            objectIcon: "🔍",
            isNote: true,
            isTask: false,
            icon: "📚",
            tags: ["design", "research", "system"],
            fields: { "priority": "high", "deadline": "next week" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: "proj-2",
            name: "Component library audit",
            description: "Audit existing component library for inconsistencies",
            listName: "Design Project", 
            listIcon: "🎨",
            objectType: "Task",
            objectIcon: "✅",
            isNote: false,
            isTask: true,
            icon: "🔧",
            tags: ["design", "audit", "components"],
            fields: { "assignee": "Sarah", "status": "in-progress" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // When user adds similar content, AI should recognize patterns
    const userInput = "Create task for design token documentation";
    const result = await parseUserInput(userInput, projectItems);
    
    console.log("Context-aware result:", result);
    // Expected: AI should use "Design Project" list and design-related tags
    // based on similarity to existing items
}

/**
 * Scenario 5: Avoiding duplicates with similarity threshold
 */
export async function exampleDuplicateDetection() {
    const items: ItemType[] = [
        {
            id: "task-1",
            name: "Weekly team standup",
            description: "Regular team synchronization meeting",
            listName: "Meetings",
            listIcon: "📅",
            objectType: "Recurring Event",
            objectIcon: "🔄",
            isNote: false,
            isTask: false,
            icon: "👥",
            tags: ["meeting", "team", "weekly"],
            fields: { "time": "Monday 9AM", "duration": "30 minutes" },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // Check for potential duplicates before creating
    const potentialDuplicate = "Add recurring team standup meeting";
    const similarItems = await findSimilarItems(potentialDuplicate, items, 3);
    
    if (similarItems.length > 0 && similarItems[0].metadata.score > 0.8) {
        console.log("Potential duplicate detected:", similarItems[0].metadata.name);
        // Handle duplicate case - maybe ask user for confirmation
    } else {
        // Proceed with creation
        const result = await parseUserInput(potentialDuplicate, items);
        console.log("New item created:", result);
    }
}

// Export all example functions for easy testing
export const examples = {
    exampleBasicParsing,
    exampleVectorStoreLifecycle,
    exampleSimilaritySearch,
    exampleContextAwareParsing,
    exampleDuplicateDetection
};
