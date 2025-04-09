"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GitHubRepoStats } from '@/lib/github';

import './github-stats.css';

interface MCPServer {
  id: number;
  name: string;
  url: string;
  description: string;
  language: string;
  type: string;
  hostingType: string;
  githubStats?: GitHubRepoStats | null;
}

interface SearchResponse {
  results: MCPServer[];
  count: number;
  time: number;
  error?: string;
  message?: string;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [allServers, setAllServers] = useState<MCPServer[]>([]);
  const [displayedServers, setDisplayedServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchTime, setSearchTime] = useState(0);
  
  // Initialize with any URL search params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
    
    // Fetch all servers
    fetchServers();
  }, [searchParams]);
  
  // Effect to perform search when query changes
  useEffect(() => {
    const query = searchQuery.trim();
    if (query) {
      performSearch(query);
    }
  }, [searchQuery]);
  
  // Fetch all servers
  async function fetchServers() {
    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('Fetching servers...');
      
      const response = await fetch('/api/servers');
      if (!response.ok) {
        console.error('Servers API response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Servers fetched successfully, count:', data?.length || 0);
      setAllServers(data);
      
      // If no search query, display all servers
      if (!searchQuery.trim()) {
        filterAndDisplayServers(data);
      } else {
        console.log('Search query exists, will perform search:', searchQuery);
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Failed to load server data. Please try again.');
      console.error('Error fetching servers:', error);
    }
  }
  
  // Perform search
  async function performSearch(query: string) {
    try {
      setIsSearching(true);
      setErrorMessage('');
      console.log('Performing search for:', query);
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        console.error('Search API response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Search failed with status ${response.status}`);
      }
      
      const data: SearchResponse = await response.json();
      console.log('Search results received:', data);
      
      if (data.error) {
        throw new Error(data.message || 'Search failed');
      }
      
      // Update state with search results
      filterAndDisplayServers(data.results);
      setSearchTime(data.time);
      setSearchStatus(`Found ${displayedServers.length} results`);
      setIsSearching(false);
    } catch (error) {
      setIsSearching(false);
      setErrorMessage(`Search error: ${(error as Error).message}`);
      console.error('Search error:', error);
    }
  }
  
  // Filter and display servers
  function filterAndDisplayServers(servers: MCPServer[]) {
    console.log('Filtering servers, received count:', servers?.length || 0);
    
    // Ensure servers is an array
    if (!Array.isArray(servers)) {
      console.error('Received non-array servers data:', servers);
      setErrorMessage('Invalid data format received from server.');
      setDisplayedServers([]);
      return;
    }
    
    setDisplayedServers(servers);
    setSearchStatus(searchQuery ? 
      `Found ${servers.length} results ${searchTime > 0 ? `(${searchTime.toFixed(2)} ms)` : ''}` : 
      `Showing ${servers.length} servers`);
    
    console.log('Display updated with', servers.length, 'servers');
  }
  
  // Handle search input change
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Update URL with search query
    if (query.trim()) {
      const params = new URLSearchParams(window.location.search);
      params.set('q', query);
      window.history.pushState({}, '', `?${params.toString()}`);
    }
  }
  
  // Handle search form submission
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      performSearch(query);
    }
  }
  
  // Handle example search clicks
  function handleExampleClick(query: string, e: React.MouseEvent) {
    e.preventDefault();
    setSearchQuery(query);
    
    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set('q', query);
    window.history.pushState({}, '', `?${params.toString()}`);
  }
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header>
          <h1 className="text-3xl font-bold mb-4">MCP.<span className="highlight">wtf</span></h1>
          
          <div className="legend mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-3">Legend</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium mb-2">Programming Language</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="emoji-display">🐍</span> Python</li>
                  <li><span className="emoji-display">📇</span> TypeScript/JavaScript</li>
                  <li><span className="emoji-display">🏎️</span> Go</li>
                  <li><span className="emoji-display">🦀</span> Rust</li>
                  <li><span className="emoji-display">#️⃣</span> C#</li>
                  <li><span className="emoji-display">☕</span> Java</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Scope</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="emoji-display">☁️</span> Cloud Service</li>
                  <li><span className="emoji-display">🏠</span> Local Service</li>
                  <li><span className="emoji-display">📟</span> Embedded Systems</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Operating System</h3>
                <ul className="space-y-1 text-sm">
                  <li><span className="emoji-display">🍎</span> macOS</li>
                  <li><span className="emoji-display">🪟</span> Windows</li>
                  <li><span className="emoji-display">🐧</span> Linux</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Special</h3>
              <ul className="space-y-1 text-sm">
                <li><span className="emoji-display">🎖️</span> Official Implementation</li>
              </ul>
            </div>
          </div>
          
          <div className="helper-text">
            Try words, phrases, names, features, and languages. You can also look for exact textual phrases (like
            <a href="#" className="text-primary-color mx-1" onClick={(e) => handleExampleClick('"coding agent"', e)}>"coding agent"</a>) 
            and prefix matches (such as 
            <a href="#" className="text-primary-color mx-1" onClick={(e) => handleExampleClick('python*', e)}>python*</a>).
          </div>
          
          <div className="helper-text">
            Filter by specific attributes like 
            <a href="#" className="text-primary-color mx-1" onClick={(e) => handleExampleClick('@language:python', e)}>@language:python</a>, 
            <a href="#" className="text-primary-color mx-1" onClick={(e) => handleExampleClick('@language:javascript', e)}>@language:javascript</a>, and 
            <a href="#" className="text-primary-color mx-1" onClick={(e) => handleExampleClick('@type:framework', e)}>@type:framework</a>.
          </div>
          
          <form onSubmit={handleSearchSubmit} className="mt-4 mb-6 relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-2 border rounded-md pl-10"
              placeholder="Search..."
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
          </form>
        </header>

        <main>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : errorMessage ? (
            <div className="error-status">{errorMessage}</div>
          ) : (
            <>
              <div className="search-status">{searchStatus}</div>
              
              <div className="server-results">
                {displayedServers.length === 0 ? (
                  <div className="text-center py-4">No servers found matching your criteria.</div>
                ) : (
                  displayedServers.map(server => {
                    // Extract emoji from description to display separately
                    const emojis = server.description.match(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu) || [];
                    
                    // Format emojis to display consistently
                    const emojiText = [...new Set(emojis)].join(' '); // Remove duplicates
                    
                    // Format the description properly with more robust handling
                    let descriptionText = '';
                    
                    // Process different description formats
                    // Remove any emojis from the beginning
                    const emojiPattern = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu;
                    
                    // First clean out special patterns
                    let cleanDesc = server.description
                      // Handle oddly formatted descriptions with double dashes and emojis
                      .replace(/^\s*-\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*)+\s*-\s*/gu, '')  
                      // Handle emojis at start with dash after
                      .replace(/^\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*)+\s*-\s*/gu, '')
                      // Handle just emojis at start without dash
                      .replace(/^\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*)+/gu, '')
                      .trim();
                    
                    // If it's something like "- actual description"
                    if (cleanDesc.startsWith('-')) {
                      cleanDesc = cleanDesc.substring(1).trim();
                    }
                    
                    // If there's still description content
                    if (cleanDesc) {
                      descriptionText = cleanDesc;
                      
                      // Keep full description
                      descriptionText = descriptionText;
                    } else {
                      // Leave description empty if we couldn't extract anything meaningful
                      descriptionText = '';
                    }
                    
                    return (
                      <div key={server.id} className="server-item">
                        <h2>
                          <a href={server.url} target="_blank" rel="noopener noreferrer">
                            {server.name}
                          </a>
                          {emojiText && <span className="emoji-display ml-2">{emojiText}</span>}
                          {descriptionText && (
                            <span className="server-brief-description"> - {descriptionText}</span>
                          )}
                        </h2>
                        
                        <div className="server-meta">
                          <div className="meta-row flex flex-wrap gap-2">
                            {server.type && <span className="capitalize bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">{server.type}</span>}
                            {server.language && server.language !== 'Unknown' && (
                              <span className="bg-blue-50 dark:bg-blue-900 px-2 py-0.5 rounded text-sm">{server.language}</span>
                            )}
                          </div>
                          {server.githubStats && (
                            <div className="github-stats">
                              <span className="stat-item" title="Stars">
                                ⭐ {server.githubStats.stars.toLocaleString()}
                              </span>
                              <span className="stat-item" title="Forks">
                                🔱 {server.githubStats.forks.toLocaleString()}
                              </span>
                              <span className="stat-item" title="Last Updated">
                                📅 {new Date(server.githubStats.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </main>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            A search engine for MCP servers. Data from the 
            <a 
              href="https://github.com/punkpeye/awesome-mcp-servers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-color mx-1"
            >
              Awesome MCP Servers
            </a> 
            repository.
          </p>
        </footer>
      </div>
    </div>
  );
}
