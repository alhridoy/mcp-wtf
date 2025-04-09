"use client";

import { useEffect, useState } from 'react';
import { GitHubRepoStats } from '@/lib/github';

export default function TestGitHubStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/search');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">GitHub Stats Test</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <h2 className="text-xl mb-2">API Response:</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
            {JSON.stringify(stats, null, 2)}
          </pre>
          
          <h2 className="text-xl mt-6 mb-2">GitHub Stats:</h2>
          <div className="space-y-4">
            {stats?.results?.map((server: any) => (
              <div key={server.id} className="border p-4 rounded">
                <h3 className="font-bold">{server.name}</h3>
                <p>URL: {server.url}</p>
                {server.githubStats ? (
                  <div className="mt-2">
                    <p>⭐ Stars: {server.githubStats.stars}</p>
                    <p>🔱 Forks: {server.githubStats.forks}</p>
                    <p>📅 Updated: {new Date(server.githubStats.updatedAt).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <p className="text-red-500">No GitHub Stats available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
