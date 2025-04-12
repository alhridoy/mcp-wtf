// We'll use a dynamic import approach instead of require
// This will be properly code-split by webpack/turbopack
let transformersPromise: Promise<any> | null = null;

// Create a function to load the transformers module
export function getTransformers() {
  if (typeof window === 'undefined') {
    throw new Error('Cannot use transformers in server environment');
  }
  
  if (!transformersPromise) {
    // Use dynamic import which is browser-safe
    transformersPromise = import('@xenova/transformers');
  }
  
  return transformersPromise;
}

// Server type definition matching your data structure
export interface MCPServer {
  id: number;
  name: string;
  url: string;
  description: string;
  language: string;
  type: string;
  hostingType: string;
  embedding?: number[];
}

// Cache for the embedding model to avoid reloading
let embeddingModel: any = null;

// Load the model (this can be cached)
export async function getEmbeddingModel() {
  if (embeddingModel) return embeddingModel;
  
  if (typeof window === 'undefined') {
    throw new Error('Cannot load embedding model in server environment');
  }
  
  console.log('Loading embedding model...');
  
  try {
    // Get the transformers module using our dynamic import function
    const transformers = await getTransformers();
    
    // Use the 'feature-extraction' pipeline with the all-MiniLM-L6-v2 model
    embeddingModel = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model loaded');
    return embeddingModel;
  } catch (error) {
    console.error('Error loading embedding model:', error);
    throw error;
  }
}

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = await getEmbeddingModel();
    const output = await model(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Create rich text representation for embedding
export function createEmbeddingText(server: MCPServer): string {
  return `
    Name: ${server.name}
    Description: ${server.description}
    Language: ${server.language}
    Type: ${server.type}
    Hosting: ${server.hostingType}
  `;
}

// Process all servers to generate and attach embeddings
export async function processServers(servers: MCPServer[]): Promise<MCPServer[]> {
  console.log('Processing servers for embeddings...');
  
  // Early return if not in browser
  if (typeof window === 'undefined') {
    console.warn('Cannot process embeddings in server environment');
    return servers;
  }
  
  const processedServers: MCPServer[] = [];
  
  // Process in batches to avoid browser hanging
  const batchSize = 5;
  const batches = Math.ceil(servers.length / batchSize);
  
  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const batchStart = batchIndex * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, servers.length);
    const batch = servers.slice(batchStart, batchEnd);
    
    // Add a small delay between batches to prevent UI freezing
    if (batchIndex > 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    for (const server of batch) {
      // Create rich text representation
      const text = createEmbeddingText(server);
      
      try {
        // Generate and store embedding
        const embedding = await generateEmbedding(text);
        processedServers.push({
          ...server,
          embedding
        });
        
        // Log progress occasionally
        if (processedServers.length % 10 === 0) {
          console.log(`Processed ${processedServers.length}/${servers.length} servers`);
        }
      } catch (error) {
        console.error(`Error generating embedding for server ${server.id}:`, error);
        // Still include the server without embedding
        processedServers.push(server);
      }
    }
  }
  
  console.log(`Completed processing ${processedServers.length} servers`);
  return processedServers;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}

// Semantic search function
export async function semanticSearch(query: string, servers: MCPServer[]): Promise<MCPServer[]> {
  console.log('Performing semantic search for:', query);
  
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);
  
  // Filter to only include servers with embeddings
  const serversWithEmbeddings = servers.filter(server => server.embedding);
  
  // Rank servers by similarity
  const results = serversWithEmbeddings
    .map(server => ({
      ...server,
      similarity: cosineSimilarity(queryEmbedding, server.embedding!)
    }))
    .sort((a, b) => b.similarity - a.similarity);
  
  console.log(`Found ${results.length} results for semantic search`);
  return results;
}
