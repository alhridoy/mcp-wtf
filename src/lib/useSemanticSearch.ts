"use client";

import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';

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
  githubStats?: any;
}

// Hook for semantic search functionality
export function useSemanticSearch() {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [model, setModel] = useState<any>(null);
  const [serversWithEmbeddings, setServersWithEmbeddings] = useState<MCPServer[]>([]);
  const [isProcessingServers, setIsProcessingServers] = useState(false);

  // Load the USE model
  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        setIsModelLoading(true);
        
        // Load TensorFlow.js and the Universal Sentence Encoder
        await tf.ready();
        const tfUse = await import('@tensorflow-models/universal-sentence-encoder');
        
        // Load the model
        console.log('Loading Universal Sentence Encoder model...');
        const loadedModel = await tfUse.load();
        
        if (isMounted) {
          console.log('Universal Sentence Encoder model loaded successfully');
          setModel(loadedModel);
          setIsModelLoading(false);
        }
      } catch (error) {
        console.error('Error loading Universal Sentence Encoder model:', error);
        if (isMounted) {
          setIsModelLoading(false);
        }
      }
    }

    if (typeof window !== 'undefined' && !model) {
      loadModel();
    }

    return () => { isMounted = false; };
  }, [model]);

  // Function to process servers and generate embeddings
  const processServers = useCallback(async (servers: MCPServer[]) => {
    if (!model || isProcessingServers) return;
    
    try {
      console.log('Processing servers for embeddings...');
      setIsProcessingServers(true);
      
      // Create rich text representations for all servers
      const serverTexts = servers.map(server => 
        `${server.name} ${server.description} ${server.language} ${server.type} ${server.hostingType}`
      );
      
      // Process in batches to avoid memory issues
      const batchSize = 10;
      const processedServers: MCPServer[] = [...servers];
      
      for (let i = 0; i < servers.length; i += batchSize) {
        const batch = serverTexts.slice(i, i + batchSize);
        
        // Generate embeddings for this batch
        const embeddings = await model.embed(batch);
        const embeddingValues = await embeddings.array();
        
        // Assign embeddings to servers
        for (let j = 0; j < batch.length; j++) {
          const serverIndex = i + j;
          if (serverIndex < processedServers.length) {
            processedServers[serverIndex] = {
              ...processedServers[serverIndex],
              embedding: embeddingValues[j]
            };
          }
        }
        
        // Log progress
        if ((i + batchSize) % 50 === 0 || i + batchSize >= servers.length) {
          console.log(`Processed ${Math.min(i + batchSize, servers.length)}/${servers.length} servers`);
        }
        
        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      console.log('All servers processed with embeddings');
      setServersWithEmbeddings(processedServers);
      return processedServers;
    } catch (error) {
      console.error('Error processing servers:', error);
      return servers;
    } finally {
      setIsProcessingServers(false);
    }
  }, [model, isProcessingServers]);

  // Function to perform semantic search
  const performSemanticSearch = useCallback(async (
    query: string, 
    servers: MCPServer[] = serversWithEmbeddings
  ): Promise<MCPServer[]> => {
    if (!model || !query.trim() || servers.length === 0) {
      return [];
    }

    try {
      console.log('Performing semantic search for:', query);
      
      // Get embeddings for the query
      const queryEmbedding = await model.embed([query]);
      const queryVector = await queryEmbedding.array();
      
      // Find servers with embeddings
      const serversWithValidEmbeddings = servers.filter(s => s.embedding && s.embedding.length > 0);
      
      if (serversWithValidEmbeddings.length === 0) {
        console.log('No servers with valid embeddings found');
        return [];
      }
      
      // Calculate cosine similarity for each server
      const results = serversWithValidEmbeddings.map(server => {
        const similarity = cosineSimilarity(queryVector[0], server.embedding!);
        return {
          ...server,
          similarity
        };
      });
      
      // Sort by similarity (highest first)
      const sortedResults = results.sort((a, b) => 
        (b.similarity ?? 0) - (a.similarity ?? 0)
      );
      
      console.log(`Found ${sortedResults.length} semantic search results`);
      return sortedResults;
    } catch (error) {
      console.error('Error in semantic search:', error);
      return [];
    }
  }, [model, serversWithEmbeddings]);

  // Calculate cosine similarity between two vectors
  function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
  }

  return {
    isModelLoading,
    isProcessingServers,
    model,
    serversWithEmbeddings,
    processServers,
    performSemanticSearch
  };
}
