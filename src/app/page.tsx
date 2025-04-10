"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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

export default function Home() {
  const searchParams = useSearchParams();
  
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [allServers, setAllServers] = useState<MCPServer[]>([]);
  const [displayedServers, setDisplayedServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchTime, setSearchTime] = useState(0);
  
  // Initialize with any URL search params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
    
    // Fetch servers from JSON file
    fetchServersFromJSON();
  }, [searchParams]);
  
  // Effect to perform search when query changes
  useEffect(() => {
    const query = searchQuery.trim();
    if (query) {
      performSearch(query);
    }
  }, [searchQuery]);
  
  // Fetch servers from JSON file
  async function fetchServersFromJSON() {
    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('Fetching servers from JSON file...');
      
      const response = await fetch('/data/servers.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch servers: ${response.status}`);
      }
      
      const data = await response.json();
      const servers = data.servers;
      
      console.log('Servers loaded from JSON:', servers.length);
      setAllServers(servers);
      
      // If no search query, display all servers
      if (!searchQuery.trim()) {
        setDisplayedServers(servers);
        setSearchStatus(`Showing all ${servers.length} servers`);
      } else {
        performSearch(searchQuery);
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(`Failed to load server data: ${(error as Error).message}`);
      console.error('Error fetching servers:', error);
    }
  }
  
  // Perform client-side search
  function performSearch(query: string) {
    try {
      setIsLoading(true);
      setErrorMessage('');
      console.log('Performing search for:', query);
      
      const start = performance.now();
      
      // Simple client-side filtering
      const results = allServers.filter(server => {
        const searchableText = [
          server.name,
          server.description,
          server.language,
          server.type,
          server.hostingType
        ].join(' ').toLowerCase();
        
        return searchableText.includes(query.toLowerCase());
      });
      
      const end = performance.now();
      const searchTimeMs = end - start;
      
      console.log('Search found', results.length, 'results in', searchTimeMs, 'ms');
      
      // Update UI with search results
      setDisplayedServers(results);
      setSearchTime(searchTimeMs);
      setSearchStatus(`Found ${results.length} results (${searchTimeMs.toFixed(2)} ms)`);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(`Search error: ${(error as Error).message}`);
      console.error('Search error:', error);
    }
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
    } else {
      // If empty search, show all servers
      setDisplayedServers(allServers);
      setSearchStatus(`Showing all ${allServers.length} servers`);
    }
  }
  
  function getMetadataBadgeClass(type: string) {
    const lowerType = type.toLowerCase();
    
    // Language badges
    if (lowerType === 'python') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (['javascript', 'typescript', 'javascript/typescript'].includes(lowerType)) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    } else if (lowerType === 'go') {
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    } else if (lowerType === 'rust') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    } else if (lowerType === 'java') {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else if (lowerType === 'c#') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
    
    // Hosting type badges
    else if (lowerType === 'cloud') {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    } else if (lowerType === 'self-hosted' || lowerType === 'local service') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (lowerType.includes('cloud') && lowerType.includes('self-hosted')) {
      return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200';
    }
    
    // Type badges with meaningful colors
    else if (lowerType === 'database') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    } else if (lowerType === 'search') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    } else if (lowerType === 'api gateway') {
      return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200';
    }
    
    // Default case
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
  
  return (
    <main className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        MCP.<span className="text-purple-600">wtf</span>
      </h1>
      

      
      <div className="mb-8">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Try words, phrases, names, features, and languages. You can also look for exact textual phrases (like "coding agent" ) and prefix matches (such as python* ).
        </p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Filter by specific attributes like @language:python , @language:javascript , and @type:framework .
        </p>
        
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="absolute inset-y-0 left-3 flex items-center">
            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p>Loading servers...</p>
        </div>
      ) : errorMessage ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-900 dark:text-red-200">
          {errorMessage}
        </div>
      ) : (
        <>
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-2 rounded-lg mb-4 text-green-900 dark:text-green-200">
            {searchStatus}
          </div>
          
          {displayedServers.length > 0 ? (
            <div className="space-y-6">
              {displayedServers.map(server => (
                <div key={server.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h3 className="text-xl font-medium mb-1">
                        <a href={server.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                          {server.name}
                        </a>
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{server.description}</p>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded-md ${getMetadataBadgeClass(server.language)}`}>
                          {server.language}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-md ${getMetadataBadgeClass(server.type)}`}>
                          {server.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-md ${getMetadataBadgeClass(server.hostingType)}`}>
                          {server.hostingType}
                        </span>
                      </div>
                    </div>
                    
                    {server.githubStats && (
                      <div className="github-stats mt-2 md:mt-0 self-start">
                        <div className="stats-container">
                          {server.githubStats.stars !== undefined && (
                            <div className="stat-item">
                              <span className="stat-icon">⭐</span>
                              <span className="stat-value">{server.githubStats.stars.toLocaleString()}</span>
                            </div>
                          )}
                          {server.githubStats.forks !== undefined && (
                            <div className="stat-item">
                              <span className="stat-icon">🍴</span>
                              <span className="stat-value">{server.githubStats.forks.toLocaleString()}</span>
                            </div>
                          )}
                          {server.githubStats.updatedAt && (
                            <div className="stat-item updated-at">
                              <span className="stat-value">Updated: {new Date(server.githubStats.updatedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-400">No servers found matching your criteria.</p>
            </div>
          )}
        </>
      )}
      
      <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
        <p>A search engine for MCP servers. Data from the Awesome MCP Servers repository.</p>
      </footer>
    </main>
  );
}
