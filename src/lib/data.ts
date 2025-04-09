import { MCPServer } from './parser';

// Pre-parsed MCP server data
export const mcpServers: MCPServer[] = [
  {
    id: 1,
    name: "aws-mcp",
    url: "https://github.com/lspaccatrosi16/aws-mcp",
    description: "AWS services integration enabling management and access via standardized MCP interfaces",
    language: "Go",
    type: "Cloud",
    hostingType: "Cloud"
  },
  {
    id: 2,
    name: "azure-mcp",
    url: "https://github.com/Azure-Samples/azure-mcp",
    description: "Azure integration server for accessing Microsoft Cloud resources via MCP protocol",
    language: "TypeScript",
    type: "Cloud",
    hostingType: "Cloud"
  },
  {
    id: 3,
    name: "mcp-firestore",
    url: "https://github.com/3p3v/mcp-firestore",
    description: "Firestore database integration for MCP",
    language: "TypeScript",
    type: "Cloud",
    hostingType: "Cloud"
  },
  {
    id: 4,
    name: "mcp-server-google-drive",
    url: "https://github.com/MarkusPfundstein/mcp-server-google-drive",
    description: "Google Drive integration with folder and file management capabilities",
    language: "Python",
    type: "Cloud",
    hostingType: "Cloud"
  },
  {
    id: 5,
    name: "chroma-mcp",
    url: "https://github.com/chroma-core/chroma-mcp",
    description: "Chroma MCP server to access local and cloud Chroma instances for retrieval capabilities",
    language: "Python",
    type: "Database",
    hostingType: "Self-hosted"
  },
  {
    id: 6,
    name: "mcp-clickhouse",
    url: "https://github.com/ClickHouse/mcp-clickhouse",
    description: "ClickHouse database integration with schema inspection and query capabilities",
    language: "Python",
    type: "Database",
    hostingType: "Cloud"
  },
  {
    id: 7,
    name: "mcp-confluent",
    url: "https://github.com/confluentinc/mcp-confluent",
    description: "Confluent integration to interact with Confluent Kafka and Confluent Cloud REST APIs",
    language: "Python",
    type: "Database",
    hostingType: "Cloud"
  },
  {
    id: 8,
    name: "elasticsearch-mcp-server",
    url: "https://github.com/cr7258/elasticsearch-mcp-server",
    description: "MCP Server implementation that provides Elasticsearch interaction",
    language: "Python",
    type: "Database",
    hostingType: "Self-hosted"
  },
  {
    id: 9,
    name: "mcp-neo4j",
    url: "https://github.com/neo4j-contrib/mcp-neo4j",
    description: "Model Context Protocol with Neo4j (Run queries, Knowledge Graph Memory, Manaage Neo4j Aura Instances)",
    language: "Python",
    type: "Database",
    hostingType: "Self-hosted"
  },
  {
    id: 10,
    name: "surrealdb-mcp",
    url: "https://github.com/abhijeet1994/surrealdb-mcp",
    description: "SurrealDB integration enabling storage and retrieval in the multi-model database",
    language: "TypeScript",
    type: "Database",
    hostingType: "Self-hosted"
  },
  {
    id: 11,
    name: "jetbrains/mcpProxy",
    url: "https://github.com/JetBrains/mcpProxy",
    description: "Connect to JetBrains IDE",
    language: "TypeScript",
    type: "Developer Tools",
    hostingType: "Self-hosted"
  },
  {
    id: 12,
    name: "jmeter-mcp-server",
    url: "https://github.com/QAInsights/jmeter-mcp-server",
    description: "JMeter MCP Server for performance testing",
    language: "Python",
    type: "Developer Tools",
    hostingType: "Self-hosted"
  },
  {
    id: 13,
    name: "scsys/mcp.servo",
    url: "https://github.com/scsys/servo",
    description: "A plugin for VSCode and JetBrains IDEs to interact with LLMs via MCP",
    language: "TypeScript",
    type: "Developer Tools",
    hostingType: "Self-hosted"
  },
  {
    id: 14,
    name: "openapi-mcp-server",
    url: "https://github.com/snaggle-ai/openapi-mcp-server",
    description: "Connect any HTTP/REST API server using an Open API spec (v3)",
    language: "Go",
    type: "Developer Tools",
    hostingType: "Self-hosted"
  },
  {
    id: 15,
    name: "lldb-mcp",
    url: "https://github.com/stass/lldb-mcp",
    description: "A MCP server for LLDB enabling AI binary and core file analysis, debugging, disassembling",
    language: "Python",
    type: "Developer Tools",
    hostingType: "Self-hosted"
  },
  {
    id: 16,
    name: "mcp-pandoc",
    url: "https://github.com/vivekVells/mcp-pandoc",
    description: "MCP server for seamless document format conversion using Pandoc",
    language: "JavaScript",
    type: "Developer Tools",
    hostingType: "Self-hosted"
  },
  {
    id: 17,
    name: "mcp-searxng",
    url: "https://github.com/ihor-sokoliuk/mcp-searxng",
    description: "A Model Context Protocol Server for SearXNG",
    language: "TypeScript",
    type: "Search",
    hostingType: "Self-hosted"
  },
  {
    id: 18,
    name: "g-search-mcp",
    url: "https://github.com/jae-jae/g-search-mcp",
    description: "A powerful MCP server for Google search that enables parallel searching with multiple keywords simultaneously",
    language: "TypeScript",
    type: "Search",
    hostingType: "Self-hosted"
  },
  {
    id: 19,
    name: "bing-search-mcp",
    url: "https://github.com/leehanchung/bing-search-mcp",
    description: "Web search capabilities using Microsoft Bing Search API",
    language: "TypeScript",
    type: "Search",
    hostingType: "Cloud"
  },
  {
    id: 20,
    name: "kagimcp",
    url: "https://github.com/kagisearch/kagimcp",
    description: "Official Kagi Search MCP Server",
    language: "TypeScript",
    type: "Search",
    hostingType: "Cloud"
  }
];
