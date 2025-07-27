# LangChain Vector Store Integration

This integration adds semantic similarity search capabilities to the Bud AI system using LangChain and Google embeddings. The system can now understand context from existing items and provide more intelligent suggestions.

## Features

- **Semantic Similarity Search**: Find related items based on meaning, not just keywords
- **Context-Aware AI**: The AI uses similar existing items to maintain consistency
- **Duplicate Detection**: Automatically detect potential duplicate items
- **Smart Categorization**: AI learns from existing patterns to categorize new items appropriately

## Architecture

```
User Input → Vector Search → Similar Items Context → AI Processing → Structured Output
```

### Key Components

1. **`vectorstore.ts`**: Core vector store functionality
2. **`ai.ts`**: Enhanced AI parsing with vector context
3. **Examples**: Usage patterns and best practices

## Setup

The necessary packages are already installed:
- `@langchain/google-genai`: Google embeddings
- `@langchain/core`: Core LangChain functionality  
- `@langchain/community`: Community vector stores
- `langchain`: Main LangChain library

## Basic Usage

### 1. Initialize Vector Store

```typescript
import { initializeVectorStore } from './lib/vectorstore';

// Initialize with existing items
await initializeVectorStore(existingItems);
```

### 2. AI Parsing with Vector Context

```typescript
import { parseUserInput } from './lib/ai';

// The AI now automatically uses vector similarity for context
const result = await parseUserInput("Add task to buy groceries", existingItems);
```

### 3. Keep Vector Store in Sync

```typescript
import { 
  syncNewItemsToVectorStore, 
  syncUpdatedItemToVectorStore,
  syncDeletedItemFromVectorStore 
} from './lib/ai';

// When items are created
await syncNewItemsToVectorStore(newItems);

// When items are updated  
await syncUpdatedItemToVectorStore(updatedItem);

// When items are deleted
await syncDeletedItemFromVectorStore(itemId);
```

## Advanced Usage

### Direct Similarity Search

```typescript
import { searchSimilarItems, getRelevantDocuments } from './lib/vectorstore';

// Low-level search with scores
const results = await searchSimilarItems("project management", 5, 0.7);

// High-level search for AI context
const docs = await getRelevantDocuments("project management", 3);
```

### Duplicate Detection

```typescript
import { findSimilarItems } from './lib/ai';

const similarItems = await findSimilarItems(userInput, allItems, 3);
if (similarItems.length > 0 && similarItems[0].metadata.score > 0.8) {
  // Potential duplicate detected
  console.log("Similar item exists:", similarItems[0].metadata.name);
}
```

### Context-Aware Item Creation

The AI now considers similar existing items when creating new ones:

```typescript
// If you have existing items like:
// - "Buy groceries" in "Shopping" list with tags ["food", "urgent"]
// - "Weekly team meeting" in "Work" list with tags ["meeting", "recurring"]

// New input: "Add task to buy organic vegetables"
// AI will likely use "Shopping" list and food-related tags

// New input: "Schedule standup meeting"  
// AI will likely use "Work" list and meeting-related tags
```

## Configuration

### Embedding Model

The default embedding model is Google's `text-embedding-004`. You can modify this in `vectorstore.ts`:

```typescript
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "text-embedding-004", // Latest Google embedding model
});
```

### Similarity Thresholds

Adjust similarity thresholds based on your needs:

```typescript
// In vectorstore.ts
export async function searchSimilarItems(
    query: string, 
    k: number = 5, 
    threshold: number = 0.7  // Adjust this threshold
): Promise<Document[]>
```

### Search Parameters

Control how many similar items are used for AI context:

```typescript
// In ai.ts parseUserInput function
const relevantDocs = await getRelevantDocuments(input, 3); // Change number here
```

## Best Practices

### 1. Initialize Once Per Session

```typescript
// Initialize when your app starts or when items are loaded
await initializeVectorStore(allItems);

// Then use direct search or AI parsing
const results = await parseUserInput(userInput, allItems);
```

### 2. Sync Vector Store with Data Changes

```typescript
// In your item creation logic
const newItem = await createItem(data);
await syncNewItemsToVectorStore([newItem]);

// In your item update logic  
const updatedItem = await updateItem(id, data);
await syncUpdatedItemToVectorStore(updatedItem);

// In your item deletion logic
await deleteItem(id);
await syncDeletedItemFromVectorStore(id);
```

### 3. Handle Edge Cases

```typescript
try {
  const result = await parseUserInput(input, items);
  // Handle result
} catch (error) {
  console.error("AI parsing failed:", error);
  // Fallback to basic parsing without vector context
}
```

### 4. Monitor Performance

```typescript
// Log similarity scores to tune thresholds
const docs = await searchSimilarItems(query, 5, 0.6);
docs.forEach(doc => {
  console.log(`${doc.metadata.name}: ${doc.metadata.score}`);
});
```

## Vector Store Alternatives

The current implementation uses `MemoryVectorStore` for simplicity. For production, consider:

- **Pinecone**: Managed vector database
- **Chroma**: Open-source vector database  
- **Weaviate**: GraphQL vector database
- **Qdrant**: High-performance vector search engine

To switch vector stores, modify the imports and initialization in `vectorstore.ts`.

## Troubleshooting

### Common Issues

1. **Empty search results**: Lower the similarity threshold
2. **Too many irrelevant results**: Raise the similarity threshold
3. **Poor AI categorization**: Ensure diverse training data in existing items
4. **Performance issues**: Consider switching to a persistent vector store

### Debug Information

Enable debug logging to understand vector search behavior:

```typescript
// Add to vectorstore.ts
console.log("Search query:", query);
console.log("Results with scores:", results.map(([doc, score]) => ({
  name: doc.metadata.name,
  score: score
})));
```

## Examples

See `src/examples/vector-store-usage.ts` for comprehensive usage examples including:

- Basic AI parsing with vector context
- Vector store lifecycle management
- Direct similarity search
- Context-aware parsing
- Duplicate detection patterns

## Integration Points

### Where to Call Vector Store Functions

1. **App Initialization**: `initializeVectorStore(allItems)`
2. **Item Creation**: `syncNewItemsToVectorStore(newItems)`
3. **Item Updates**: `syncUpdatedItemToVectorStore(updatedItem)`
4. **Item Deletion**: `syncDeletedItemFromVectorStore(itemId)`
5. **AI Parsing**: `parseUserInput(input, items)` (automatic)
6. **Search Features**: `findSimilarItems(query, items)`

### Performance Considerations

- Vector store initialization may take time with large datasets
- Consider initializing in the background
- Embedding generation requires API calls to Google
- Cache embeddings when possible for better performance

This integration makes your AI assistant much smarter by learning from existing data patterns and providing contextually relevant suggestions.
