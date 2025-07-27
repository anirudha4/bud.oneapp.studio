import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ItemType } from "./types";

// Initialize Google embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // Google's latest embedding model
});

// Global vector store instance
let vectorStore: MemoryVectorStore | null = null;

/**
 * Convert ItemType to LangChain Document
 */
export function itemToDocument(item: ItemType): Document {
    // Create searchable content by combining relevant fields
    const searchableContent = [
        item.name,
        item.description || '',
        item.tags.join(' '),
        item.objectType,
        item.listName,
        // Include custom fields in searchable content
        Object.entries(item.fields || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(' ')
    ].filter(Boolean).join(' ');

    return new Document({
        pageContent: searchableContent,
        metadata: {
            id: item.id,
            name: item.name,
            description: item.description,
            listName: item.listName,
            listIcon: item.listIcon,
            objectType: item.objectType,
            objectIcon: item.objectIcon,
            isNote: item.isNote,
            isTask: item.isTask,
            icon: item.icon,
            tags: item.tags,
            fields: item.fields,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            // Add relevance score (will be populated during search)
            score: undefined
        }
    });
}

/**
 * Initialize or update the vector store with items
 */
export async function initializeVectorStore(items: ItemType[]): Promise<MemoryVectorStore> {
    if (items.length === 0) {
        // Create empty vector store if no items
        vectorStore = new MemoryVectorStore(embeddings);
        return vectorStore;
    }

    // Convert items to documents
    const documents = items.map(itemToDocument);
    
    // Create new vector store with documents
    vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
    
    return vectorStore;
}

/**
 * Add new items to existing vector store
 */
export async function addItemsToVectorStore(newItems: ItemType[]): Promise<void> {
    if (!vectorStore) {
        throw new Error("Vector store not initialized. Call initializeVectorStore first.");
    }
    
    if (newItems.length === 0) return;
    
    const documents = newItems.map(itemToDocument);
    await vectorStore.addDocuments(documents);
}

/**
 * Update an existing item in the vector store
 */
export async function updateItemInVectorStore(updatedItem: ItemType): Promise<void> {
    if (!vectorStore) {
        throw new Error("Vector store not initialized. Call initializeVectorStore first.");
    }
    
    // Remove old document and add updated one
    // Note: MemoryVectorStore doesn't have direct update, so we'll recreate
    // For production, consider using a persistent vector store like Pinecone or Chroma
    await removeItemFromVectorStore(updatedItem.id);
    await addItemsToVectorStore([updatedItem]);
}

/**
 * Remove an item from the vector store
 */
export async function removeItemFromVectorStore(itemId: string): Promise<void> {
    if (!vectorStore) {
        throw new Error("Vector store not initialized. Call initializeVectorStore first.");
    }
    
    // MemoryVectorStore doesn't have direct delete method
    // This would need to be implemented for production use with persistent stores
    console.warn("Item removal not fully implemented for MemoryVectorStore. Consider using a persistent vector store.");
}

/**
 * Perform similarity search on items
 */
export async function searchSimilarItems(
    query: string, 
    k: number = 5, 
    threshold: number = 0.7
): Promise<Document[]> {
    if (!vectorStore) {
        throw new Error("Vector store not initialized. Call initializeVectorStore first.");
    }
    
    try {
        // Perform similarity search with scores
        const results = await vectorStore.similaritySearchWithScore(query, k);
        
        // Filter by threshold and return documents with scores in metadata
        return results
            .filter(([, score]) => score >= threshold)
            .map(([doc, score]) => {
                // Add the similarity score to the document metadata
                return new Document({
                    pageContent: doc.pageContent,
                    metadata: {
                        ...doc.metadata,
                        score: score
                    }
                });
            });
    } catch (error) {
        console.error("Error performing similarity search:", error);
        return [];
    }
}

/**
 * Get relevant documents for AI context
 */
export async function getRelevantDocuments(
    query: string,
    maxDocuments: number = 3
): Promise<Document[]> {
    const relevantDocs = await searchSimilarItems(query, maxDocuments, 0.6);
    
    // Sort by score (highest first) and limit results
    return relevantDocs
        .sort((a, b) => (b.metadata.score || 0) - (a.metadata.score || 0))
        .slice(0, maxDocuments);
}

/**
 * Format documents for AI context
 */
export function formatDocumentsForContext(documents: Document[]): string {
    if (documents.length === 0) {
        return "No relevant items found.";
    }
    
    return documents.map((doc, index) => {
        const metadata = doc.metadata;
        return `
**Relevant Item ${index + 1}:**
- ID : ${metadata.id}
- Name: ${metadata.name}
- Type: ${metadata.objectType} in List ${metadata.listName}
- Description: ${metadata.description || 'No description'}
- Tags: ${metadata.tags?.join(', ') || 'None'}
- Similarity Score: ${metadata.score?.toFixed(3) || 'N/A'}
`;
    }).join('\n');
}

/**
 * Get the current vector store instance
 */
export function getVectorStore(): MemoryVectorStore | null {
    return vectorStore;
}
