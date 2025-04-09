export interface GitHubRepoStats {
  stars: number;
  forks: number;
  updatedAt: string;
}

// Cache to avoid GitHub API rate limits
const statsCache: Record<string, GitHubRepoStats> = {};

// NO MOCK DATA - we'll only use real GitHub API data

export async function getGitHubStats(repoUrl: string): Promise<GitHubRepoStats | null> {
  try {
    // Return from cache if available
    const domainMatch = repoUrl.match(/github\.com\/[^\/]+\/[^\/\#\?]+/); 
    if (domainMatch && statsCache[domainMatch[0]]) {
      return statsCache[domainMatch[0]];
    }
    
    // We'll only use real GitHub API data - no mock data
    
    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\#\?]+)/);
    if (!match) return null;
    
    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
    // Add a GitHub token if available
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    // Use environment variable for GitHub token - must be added to .env.local file
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      console.log('Using GitHub token for API request');
    } else {
      console.log('No GitHub token found - rate limits will be low');
    }
    
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    const stats = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      updatedAt: data.updated_at,
    };
    
    // Cache the result
    if (domainMatch) {
      statsCache[domainMatch[0]] = stats;
    }
    
    return stats;
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    
    // Just return null if we can't get the data
    return null;
  }
}
