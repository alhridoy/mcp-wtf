"use client";

import { useState, useEffect, useCallback } from 'react';

// Define server interface
export interface MCPServer {
  id: number;
  name: string;
  url: string;
  description: string;
  language: string;
  type: string;
  hostingType: string;
  embedding?: number[];
  similarity?: number;
  semanticSimilarity?: number;
  textSimilarity?: number;
  githubStats?: any;
}

// No global model - we'll use a simpler approach that works in browsers

// Hook for lightweight semantic search
export function useMiniLMSearch() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [serversWithEmbeddings, setServersWithEmbeddings] = useState<MCPServer[]>([]);
  const [isProcessingServers, setIsProcessingServers] = useState(false);

  // Simpler approach without loading the actual model
  // Just simulate loading to show the UI state
  const simulateModelLoading = useCallback(async () => {
    setIsModelLoading(true);
    console.log('Simulating model loading (browser-safe)...');
    
    // Simulate model loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsModelLoading(false);
    console.log('Simulated model loading complete');
    return true;
  }, []);
  
  // Generate a simple embedding from text
  // This is a simplified version that doesn't need transformers.js
  const generateSimpleEmbedding = useCallback((text: string): number[] => {
    // Create a simplified embedding based on character frequencies
    // This is not as powerful as a real embedding model but works without dependencies
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789 '.split('');
    const embedding = new Array(chars.length).fill(0);
    
    const lowerText = text.toLowerCase();
    let total = 0;
    
    // Count character frequencies
    for (let i = 0; i < lowerText.length; i++) {
      const charIndex = chars.indexOf(lowerText[i]);
      if (charIndex >= 0) {
        embedding[charIndex]++;
        total++;
      }
    }
    
    // Normalize the embedding
    if (total > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / total;
      }
    }
    
    return embedding;
  }, []);

  // Function to process servers in batches
  const processServers = useCallback(async (servers: MCPServer[]) => {
    if (!servers.length || isProcessingServers) return [];
    
    try {
      setIsProcessingServers(true);
      console.log(`Starting to process ${servers.length} servers for embeddings...`);
      console.log('This may take a few moments...');
      
      // Just simulate model loading
      await simulateModelLoading();
      
      // Process in small batches to avoid browser freezing
      const batchSize = 20;
      const batches = Math.ceil(servers.length / batchSize);
      const processedServers = [...servers];
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, servers.length);
        const batchServers = servers.slice(start, end);
        
        // Create rich text for embedding with more context
        const textsToEmbed = batchServers.map(server => {
          // Create a more detailed representation for better embeddings
          return `
            Name: ${server.name}
            Description: ${server.description}
            Programming Language: ${server.language}
            Type: ${server.type}
            Hosting: ${server.hostingType}
            This MCP server provides ${server.type} functionality in ${server.language}.
            ${server.description}
          `;
        });
        
        // Get embeddings using our simplified approach
        for (let j = 0; j < textsToEmbed.length; j++) {
          try {
            // Get simplified embedding
            const embeddingData = generateSimpleEmbedding(textsToEmbed[j]);
            
            const index = start + j;
            processedServers[index] = {
              ...processedServers[index],
              embedding: embeddingData
            };
            
            // Log progress for every 20 servers
            if ((start + j + 1) % 20 === 0 || start + j + 1 === servers.length) {
              console.log(`Processed ${start + j + 1}/${servers.length} servers`);
            }
          } catch (e) {
            console.error(`Error embedding server ${start + j}:`, e);
          }
          
          // Yield to the browser's event loop to prevent UI freezing
          if (j % 3 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      console.log('Finished processing server embeddings');
      setServersWithEmbeddings(processedServers);
      return processedServers;
    } catch (error) {
      console.error('Error processing servers:', error);
      return servers;
    } finally {
      setIsProcessingServers(false);
    }
  }, [simulateModelLoading, generateSimpleEmbedding, isProcessingServers]);

  // Function to perform hybrid search (combines semantic and text search)
  const performHybridSearch = useCallback(async (
    query: string,
    servers: MCPServer[] = serversWithEmbeddings,
    filters: Record<string, string> = {}
  ): Promise<MCPServer[]> => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      console.log('Empty query and no filters - returning all servers');
      return servers;
    }
    
    try {
      console.log(`Performing hybrid search for: "${query}"`);
      if (Object.keys(filters).length > 0) {
        console.log('With filters:', filters);
      }
      console.log(`Total servers available: ${servers.length}`);
      
      // First apply metadata filters if any
      let filteredServers = servers;
      if (Object.keys(filters).length > 0) {
        filteredServers = applyMetadataFilters(servers, filters);
        console.log(`After filtering: ${filteredServers.length} servers remain`);
      }
      
      // If no query, just return the filtered results
      if (!query.trim()) {
        return filteredServers;
      }
      
      // Get servers with embeddings for semantic search
      const serversWithValidEmbeddings = filteredServers.filter(server => server.embedding && server.embedding.length > 0);
      console.log(`Servers with embeddings: ${serversWithValidEmbeddings.length}`);
      
      // If we don't have any embeddings or the query starts with special characters, use text search only
      if (serversWithValidEmbeddings.length === 0 || 
          query.startsWith('@') || 
          query.startsWith('"') ||
          query.endsWith('*')) {
        console.log('Using text-only search due to special query or no embeddings');
        return performTextSearch(query, filteredServers);
      }
      
      // Get query embedding for semantic search
      console.log('Generating embedding for query...');
      const queryEmbedding = generateSimpleEmbedding(query);
      
      // Calculate both semantic and text similarity for each server
      const scoredServers = serversWithValidEmbeddings.map(server => {
        // Semantic similarity from embeddings
        const semanticSimilarity = cosineSimilarity(queryEmbedding, server.embedding!);
        
        // Text-based similarity
        const textSim = textSimilarity(query, server);
        
        // Combined hybrid score (weighted combination)
        // Adjust these weights to control the balance between semantic and text search
        const combinedSimilarity = semanticSimilarity * 0.6 + textSim * 0.4;
        
        return { 
          ...server, 
          similarity: combinedSimilarity,
          semanticSimilarity,
          textSimilarity: textSim 
        };
      });
        
      // Log some examples of the similarity calculation
      if (scoredServers.length > 0) {
        console.log('Example hybrid score calculations:');
        scoredServers.slice(0, 3).forEach(s => {
          console.log(`${s.name}: semantic=${s.semanticSimilarity?.toFixed(4)}, text=${s.textSimilarity?.toFixed(4)}, combined=${s.similarity?.toFixed(4)}`);
        });
      }
      
      // Sort by combined similarity (highest first)
      const results = scoredServers
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
      
      // Get top 10 results for logging
      const top10 = results.slice(0, 10);
      console.log('Top 10 hybrid search results:');
      top10.forEach((server, i) => {
        console.log(`${i+1}. ${server.name} - Score: ${server.similarity?.toFixed(4)}`);
      });
      
      return results;
    } catch (error) {
      console.error('Error in hybrid search:', error);
      // Fallback to text search if semantic search fails
      console.log('Falling back to text search');
      return performTextSearch(query, servers);
    }
  }, [simulateModelLoading, serversWithEmbeddings]);
  
  // Pure text-based search function
  const performTextSearch = useCallback((
    query: string,
    servers: MCPServer[]
  ): MCPServer[] => {
    if (!query.trim() || !servers.length) {
      return servers;
    }
    
    try {
      console.log(`Performing text-based search for: "${query}"`);
      
      // Special query handling
      if (query.startsWith('@language:')) {
        const language = query.replace('@language:', '').trim().toLowerCase();
        return servers.filter(server => 
          server.language.toLowerCase().includes(language) ||
          (language === 'python' && (server.description?.includes('🐍') || server.language.toLowerCase().includes('python'))) ||
          (language === 'javascript' && (server.description?.includes('📇') || server.language.toLowerCase().includes('javascript'))) ||
          (language === 'typescript' && (server.description?.includes('📇') || server.language.toLowerCase().includes('typescript'))) ||
          (language === 'go' && (server.description?.includes('🏎️') || server.language.toLowerCase().includes('go'))) ||
          (language === 'java' && (server.description?.includes('☕') || server.language.toLowerCase().includes('java')))
        );
      } else if (query.startsWith('@type:')) {
        const type = query.replace('@type:', '').trim().toLowerCase();
        return servers.filter(server => 
          server.type.toLowerCase().includes(type)
        );
      }
      
      // Handle exact phrase search
      if (query.startsWith('"') && query.endsWith('"')) {
        const exactPhrase = query.slice(1, -1).toLowerCase();
        return servers.filter(server => 
          server.name.toLowerCase().includes(exactPhrase) || 
          server.description.toLowerCase().includes(exactPhrase)
        );
      }
      
      // Handle prefix search
      if (query.endsWith('*')) {
        const prefix = query.slice(0, -1).toLowerCase();
        return servers.filter(server => 
          server.name.toLowerCase().startsWith(prefix) || 
          server.language.toLowerCase().startsWith(prefix)
        );
      }

      // Standard keyword search with ranking
      const lowerQuery = query.toLowerCase();
      const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);
      
      // Score each server based on keyword matches
      const scoredResults = servers.map(server => {
        let score = 0;
        const searchText = `${server.name} ${server.description} ${server.language} ${server.type}`.toLowerCase();
        
        // Exact match bonus
        if (searchText.includes(lowerQuery)) {
          score += 10;
        }
        
        // Word match scoring
        for (const word of words) {
          if (server.name.toLowerCase().includes(word)) {
            score += 5; // Higher weight for name matches
          }
          if (server.language.toLowerCase().includes(word)) {
            score += 4; // High weight for language matches
          }
          if (server.description.toLowerCase().includes(word)) {
            score += 3; // Medium weight for description matches
          }
          if (server.type.toLowerCase().includes(word)) {
            score += 2; // Lower weight for type matches
          }
        }
        
        return { 
          ...server, 
          similarity: score / 10, // Normalize to 0-1 range
          textSimilarity: score / 10
        };
      });
      
      // Sort by score and filter out zero scores
      return scoredResults
        .filter(item => item.similarity! > 0)
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
        
    } catch (error) {
      console.error('Text search error:', error);
      return [];
    }
  }, []);
  
  // Function to apply metadata filters
  const applyMetadataFilters = useCallback((
    servers: MCPServer[],
    filters: Record<string, string>
  ): MCPServer[] => {
    return servers.filter(server => {
      // Check each filter
      for (const [key, value] of Object.entries(filters)) {
        const lowerValue = value.toLowerCase();
        
        switch(key) {
          case 'language':
            if (!server.language.toLowerCase().includes(lowerValue)) {
              return false;
            }
            break;
            
          case 'type':
            if (!server.type.toLowerCase().includes(lowerValue)) {
              return false;
            }
            break;
            
          case 'hosting':
            if (!server.hostingType.toLowerCase().includes(lowerValue)) {
              return false;
            }
            break;
            
          // Add more filter types as needed
        }
      }
      
      // If passed all filters
      return true;
    });
  }, []);

  // Calculate cosine similarity
  // Enhanced cosine similarity with fallback for edge cases
  function cosineSimilarity(a: number[], b: number[]): number {
    // Safety checks
    if (!a || !b) return 0;
    if (a.length !== b.length) {
      console.error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
      return 0;
    }
    
    // Check if either vector is all zeros
    const isAZero = a.every(val => val === 0);
    const isBZero = b.every(val => val === 0);
    if (isAZero || isBZero) return 0;
    
    // Calculate cosine similarity
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) return 0;
    
    // Ensure the result is in the valid range [-1, 1]
    const similarity = dotProduct / (normA * normB);
    return Math.max(-1, Math.min(1, similarity));
  }
  
  // Function for basic text similarity as a fallback
  function textSimilarity(query: string, server: MCPServer): number {
    const serverText = [
      server.name,
      server.description,
      server.language,
      server.type,
      server.hostingType
    ].join(' ').toLowerCase();
    
    const queryTerms = query.toLowerCase().split(/\s+/);
    let matches = 0;
    
    for (const term of queryTerms) {
      if (term.length > 2 && serverText.includes(term)) {
        matches++;
      }
    }
    
    return matches / queryTerms.length;
  }

  return {
    isModelLoading,
    isProcessingServers,
    serversWithEmbeddings,
    processServers,
    performHybridSearch,
    performTextSearch,
    applyMetadataFilters,
    generateSimpleEmbedding
  };
}
