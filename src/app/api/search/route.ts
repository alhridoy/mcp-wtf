import { NextRequest, NextResponse } from 'next/server';
import { mcpServers } from '@/lib/data';
import { initializeSemanticSearch, semanticSearch } from '@/lib/semantic';
import { getGitHubStats } from '@/lib/github';

// Store the initialization state
let isInitialized = false;
const servers = mcpServers; // Use hardcoded data

export async function GET(request: NextRequest) {
  console.log('Search API called - environment:', process.env.NODE_ENV);
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    console.log('Search query received:', query);
    const start = performance.now();
    
    // Initialize semantic search if not done already
    if (!isInitialized) {
      console.log('Initializing semantic search...');
      isInitialized = await initializeSemanticSearch(servers);
      console.log('Semantic search initialized:', isInitialized);
    }
    
    if (!query) {
      // Fetch GitHub stats for all servers
      const serversWithStats = await Promise.all(
        servers.map(async (server) => {
          // Always try to get stats for all servers that might be GitHub URLs
          if (server.url && server.url.includes('github.com')) {
            const stats = await getGitHubStats(server.url);
            console.log(`Got stats for ${server.name}:`, stats);
            return { ...server, githubStats: stats };
          }
          return server;
        })
      );
      
      return NextResponse.json({
        results: serversWithStats,
        count: serversWithStats.length,
        time: 0
      });
    }
    
    // Perform semantic search
    let results = await semanticSearch(query, servers);
    
    // Fetch GitHub stats for search results
    results = await Promise.all(
      results.map(async (server) => {
        // Always try to get stats for all servers that might be GitHub URLs
        if (server.url && server.url.includes('github.com')) {
          const stats = await getGitHubStats(server.url);
          console.log(`Got stats for search result ${server.name}:`, stats);
          return { ...server, githubStats: stats };
        }
        return server;
      })
    );
    
    const timeMs = performance.now() - start;
    
    return NextResponse.json({
      results,
      count: results.length,
      time: timeMs
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
