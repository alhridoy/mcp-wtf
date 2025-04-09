import { MCPServer } from './parser';

// Simplified fast search implementation without heavy models
export async function initializeSearchEngine(servers: MCPServer[]) {
  // No heavy initialization needed for keyword search
  console.log('Fast search engine initialized with', servers.length, 'servers');
  return true;
}

export async function semanticSearch(query: string, servers: MCPServer[], topK: number = 100): Promise<MCPServer[]> {
  try {
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

    // Standard keyword search with enhanced ranking
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
      
      return { server, score };
    });
    
    // Sort by score and return top results
    return scoredResults
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.server);
      
  } catch (error) {
    console.error('Search error:', error);
    
    // Simple fallback
    const lowerQuery = query.toLowerCase();
    return servers.filter(server => 
      server.name.toLowerCase().includes(lowerQuery) || 
      server.description.toLowerCase().includes(lowerQuery) ||
      server.language.toLowerCase().includes(lowerQuery) ||
      server.type.toLowerCase().includes(lowerQuery)
    );
  }
}
