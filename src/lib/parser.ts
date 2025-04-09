import fs from 'fs';
import path from 'path';

import { GitHubRepoStats } from './github';

export interface MCPServer {
  id: number;
  name: string;
  url: string;
  description: string;
  language: string;
  type: string;
  hostingType: string;
  githubStats?: GitHubRepoStats | null;
}

export function parseMCPServers(): MCPServer[] {
  try {
    // Read README.md file
    const filePath = path.join(process.cwd(), 'public', 'data', 'README.md');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse servers from README
    // This pattern matches the repo name, URL, and captures everything after that as the description
    const regex = /^\s*[-*]\s+\[([^\]]+)\]\(([^\)]+)\)\s*(.+)?/gm;
    let match;
    let id = 1;
    const mcpServers: MCPServer[] = [];
    
    // Rules to identify non-implementation entries
    function shouldExcludeEntry(name: string, url: string, description: string) {
      // Skip section headers (internal links)
      if (url.startsWith('#')) return true;
      
      // Skip common documentation/info pages
      if (name.toLowerCase().includes('what is') ||
          name.toLowerCase().includes('quickstart') ||
          name.toLowerCase().includes('setup')) return true;
      
      // Skip community links
      if (url.includes('discord') ||
          url.includes('reddit.com') ||
          name.toLowerCase().includes('discord') ||
          name.toLowerCase().includes('reddit')) return true;
      
      // Skip if it's a video tutorial
      if (url.includes('youtu.be') || url.includes('youtube.com')) return true;
      
      // Skip if it's marked as Unknown implementation without a proper repo
      if (description?.includes('Implementation|Unknown') && 
          !url.includes('github.com') && 
          !url.includes('gitlab.com')) return true;
      
      return false;
    }
    
    // Enhanced emoji to language/type mapping
    const emojiMap: {[key: string]: string} = {
      '🐍': 'Python',
      '📇': 'JavaScript/TypeScript',
      '🏎️': 'Go',
      '☕': 'Java',
      '🦀': 'Rust',
      '🎖️': 'Multiple',
      '🏠': 'Self-hosted',
      '☁️': 'Cloud',
      '🪟': 'Windows',
      '🍎': 'macOS',
      '🐧': 'Linux'
    };
    
    while ((match = regex.exec(content)) !== null) {
      const name = match[1].trim();
      const url = match[2].trim();
      let description = match[3] ? match[3].trim() : '';
      
      // Fix inconsistent description formats
      // Some descriptions have emoji as "- 🐍 ☁️ - actual description"
      description = description.replace(/^\s*-\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*)+\s*-\s*/gu, '');
      
      // Some have emoji without the description dash "- 🐍 ☁️"
      if (/^\s*[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*$/gu.test(description)) {
        // If it's only emojis, check the next line in content
        const currentIndex = regex.lastIndex;
        const restOfContent = content.slice(currentIndex);
        const nextLineMatch = /^\s*-\s*(.+?)\s*$/m.exec(restOfContent);
        if (nextLineMatch) {
          description += ' - ' + nextLineMatch[1].trim();
        }
      }
      
      // Before emoji extraction, store the original description for later use
      const originalDescription = description;
      
      // Extract languages from emojis in description
      let languages: string[] = [];
      let platforms: string[] = [];
      
      // Extract emojis from description
      const emojiMatches = description.match(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/gu) || [];
      
      emojiMatches.forEach(emoji => {
        if (emojiMap[emoji]) {
          // Language emojis
          if (emoji === '🐍') languages.push('Python');
          else if (emoji === '📇') languages.push('JavaScript/TypeScript');
          else if (emoji === '🏎️') languages.push('Go');
          else if (emoji === '☕') languages.push('Java');
          else if (emoji === '🦀') languages.push('Rust');
          
          // Platform/hosting emojis
          else if (emoji === '🏠') platforms.push('Self-hosted');
          else if (emoji === '☁️') platforms.push('Cloud');
          else if (emoji === '🪟') platforms.push('Windows');
          else if (emoji === '🍎') platforms.push('macOS');
          else if (emoji === '🐧') platforms.push('Linux');
        }
      });
      
      // Skip non-implementation entries
      if (shouldExcludeEntry(name, url, description)) {
        continue;
      }

      // Extract language from backticks as fallback
      if (languages.length === 0 && description.includes('`')) {
        const langMatches = description.match(/`([^`]+)`/g) || [];
        langMatches.forEach(match => {
          const lang = match.replace(/`/g, '').trim();
          if (lang && lang.length > 1) {
            // Capitalize first letter of each word
            const formattedLang = lang.split('/').map(
              word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join('/');
            languages.push(formattedLang);
          }
        });
      }
      
      // Infer language from name or description if still empty
      if (languages.length === 0) {
        const nameLower = name.toLowerCase();
        const descLower = description.toLowerCase();
        
        if (nameLower.includes('python') || descLower.includes('python')) {
          languages.push('Python');
        } else if (nameLower.includes('typescript') || descLower.includes('typescript')) {
          languages.push('TypeScript');
        } else if (nameLower.includes('javascript') || descLower.includes('javascript') || nameLower.includes('js') || descLower.includes(' js ')) {
          languages.push('JavaScript');
        } else if (nameLower.includes('golang') || nameLower.includes(' go ') || descLower.includes('golang') || descLower.includes(' go ')) {
          languages.push('Go');
        } else if (nameLower.includes('rust') || descLower.includes('rust')) {
          languages.push('Rust');
        }
      }
      
      // If no language is detected, try to parse it from the description
      if (languages.length === 0) {
        // Look for language names in description
        const langKeywords = ['python', 'javascript', 'typescript', 'go', 'golang', 'rust', 'java', 'c++', 'cpp', 'c#', 'csharp', 'php', 'ruby'];
        const descLower = description.toLowerCase();
        
        for (const lang of langKeywords) {
          if (descLower.includes(lang)) {
            switch (lang) {
              case 'golang':
                languages.push('Go');
                break;
              case 'cpp':
                languages.push('C++');
                break;
              case 'csharp':
                languages.push('C#');
                break;
              default:
                languages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
                break;
            }
          }
        }
      }
      
      // If still no language is found, leave it empty
      if (languages.length === 0) {
        languages.push('Unknown');
      }
      
      // Determine type more precisely
      let type = 'Implementation';
      if (description.toLowerCase().includes('framework')) {
        type = 'Framework';
      } else if (description.toLowerCase().includes('utility') || description.toLowerCase().includes('tool')) {
        type = 'Utility';
      } else if (description.toLowerCase().includes('sdk') || description.toLowerCase().includes('library')) {
        type = 'Library/SDK';
      }
      
      // Clean repository name if it's a GitHub URL
      let displayName = name;
      if (url.includes('github.com')) {
        const urlParts = url.split('github.com/');
        if (urlParts.length > 1) {
          const repoPath = urlParts[1].split('#')[0].split('?')[0];
          // Only use the repo path if it looks like a valid username/repo format
          if (repoPath.split('/').length >= 2 && !repoPath.includes('/tree/') && !repoPath.includes('/blob/')) {
            displayName = repoPath;
          }
        }
      }
      
      // Make sure we have a clean, usable description
      let finalDescription = originalDescription;
      
      // Use more robust patterns to extract the real description text
      if (finalDescription) {
        // First handle emoji patterns
        const emojiOnlyPrefix = /^\s*([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*)+/gu;
        
        // Try to find descriptions after emoji + dash pattern: "🐍 ☁️ - Actual description"
        if (finalDescription.includes('-')) {
          // Different dash patterns to try
          const patterns = [
            // Pattern: "emoji emoji - Description"
            /^\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*)+\s*-\s*(.+)$/u,
            // Pattern: "- emoji emoji - Description"
            /^\s*-\s*(?:[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]\s*)+\s*-\s*(.+)$/u,
            // Simple dash: "- Description"
            /^\s*-\s*(.+)$/u
          ];
          
          // Try each pattern
          for (const pattern of patterns) {
            const match = pattern.exec(finalDescription);
            if (match && match[1]) {
              finalDescription = match[1].trim();
              break;
            }
          }
        }
        
        // If still no description, just remove emojis and dashes from the beginning
        if (finalDescription === originalDescription) {
          finalDescription = finalDescription
            .replace(/^\s*-\s*/g, '') // Remove leading dash
            .replace(emojiOnlyPrefix, '') // Remove leading emojis
            .trim();
        }
      }
      
      mcpServers.push({
        id: id++,
        name: displayName,
        url,
        description: finalDescription, // Use the cleaned description
        language: languages.join(', '),
        type,
        hostingType: platforms.join(', ') || 'Cross-platform'
      });
    }
    
    return mcpServers;
  } catch (error) {
    console.error('Error parsing MCP servers:', error);
    return [];
  }
}
