import { pipeline, env } from '@xenova/transformers';
import { MCPServer } from './parser';

// Since we're in a Node.js environment, we need to configure the model loading
env.useBrowserCache = false;
env.allowLocalModels = false;

// Type definitions for embeddings and model
type EmbeddingVector = number[];
type EmbeddingModel = ReturnType<typeof pipeline>;

// Utility function to safely convert model output to EmbeddingVector
function toEmbeddingVector(data: any): EmbeddingVector {
  if (data instanceof Float32Array) {
    return Array.from(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => Number(item));
  }
  console.warn('Unexpected embedding data type:', data);
  return [];
}

// Cache for embeddings
let serverEmbeddings: EmbeddingVector[] = [];
let model: EmbeddingModel | null = null;

export async function initializeSemanticSearch(servers: MCPServer[]) {
  try {
    console.log('Initializing semantic search with all-MiniLM-L6-v2...');
    
    // Initialize the model
    model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
    // Generate embeddings for all servers
    console.log('Generating embeddings for', servers.length, 'servers...');
    serverEmbeddings = await Promise.all(
      servers.map(async (server) => {
        const text = `${server.name} ${server.description} ${server.language} ${server.type}`;
        const output = await model(text, { pooling: 'mean', normalize: true });
        return toEmbeddingVector(output.data);
      })
    );
    
    console.log('Semantic search initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing semantic search:', error);
    return false;
  }
}

// Cosine similarity between two vectors
function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

export async function semanticSearch(query: string, servers: MCPServer[], topK: number = 100): Promise<MCPServer[]> {
  try {
    // Handle special queries with the old system
    if (query.startsWith('@') || query.startsWith('"') || query.endsWith('*')) {
      return legacySearch(query, servers, topK);
    }
    
    if (!model) {
      console.warn('Semantic search not initialized, falling back to legacy search');
      return legacySearch(query, servers, topK);
    }
    
    // Generate embedding for the query
    const queryOutput = await model(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = toEmbeddingVector(queryOutput.data);
    
    // Calculate similarities
    const similarities = serverEmbeddings.map((embedding, index) => ({
      server: servers[index],
      score: cosineSimilarity(queryEmbedding, embedding)
    }));
    
    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.server);
      
  } catch (error) {
    console.error('Semantic search error:', error);
    return legacySearch(query, servers, topK);
  }
}

// Legacy keyword-based search as fallback
function legacySearch(query: string, servers: MCPServer[], topK: number = 100): Promise<MCPServer[]> {
  // Special query handling
  if (query.startsWith('@language:')) {
    const language = query.replace('@language:', '').trim().toLowerCase();
    return Promise.resolve(servers.filter(server => 
      server.language.toLowerCase().includes(language)
    ));
  } 
  
  if (query.startsWith('@type:')) {
    const type = query.replace('@type:', '').trim().toLowerCase();
    return Promise.resolve(servers.filter(server => 
      server.type.toLowerCase().includes(type)
    ));
  }
  
  // Handle exact phrase search
  if (query.startsWith('"') && query.endsWith('"')) {
    const exactPhrase = query.slice(1, -1).toLowerCase();
    return Promise.resolve(servers.filter(server => 
      server.name.toLowerCase().includes(exactPhrase) || 
      server.description.toLowerCase().includes(exactPhrase)
    ));
  }
  
  // Handle prefix search
  if (query.endsWith('*')) {
    const prefix = query.slice(0, -1).toLowerCase();
    return Promise.resolve(servers.filter(server => 
      server.name.toLowerCase().startsWith(prefix) || 
      server.language.toLowerCase().startsWith(prefix)
    ));
  }
  
  // Standard keyword search
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);
  
  const scoredResults = servers.map(server => {
    let score = 0;
    const searchText = `${server.name} ${server.description} ${server.language} ${server.type}`.toLowerCase();
    
    if (searchText.includes(lowerQuery)) {
      score += 10;
    }
    
    for (const word of words) {
      if (server.name.toLowerCase().includes(word)) score += 5;
      if (server.language.toLowerCase().includes(word)) score += 4;
      if (server.description.toLowerCase().includes(word)) score += 3;
      if (server.type.toLowerCase().includes(word)) score += 2;
    }
    
    return { server, score };
  });
  
  return Promise.resolve(
    scoredResults
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.server)
  );
}
