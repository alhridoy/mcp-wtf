export interface GitHubRepoStats {
  stars: number;
  forks: number;
  updatedAt: string;
}

export async function getGitHubStats(repoUrl: string): Promise<GitHubRepoStats | null> {
  try {
    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\#\?]+)/);
    if (!match) return null;
    
    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
    // Add a GitHub token if available
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(apiUrl, { headers });
    
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return null;
  }
}
