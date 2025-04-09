/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  // Updated experimental config
  serverExternalPackages: ['@octokit/rest'],
  // Disable ESLint during production builds
  eslint: {
    // Only run ESLint during development
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during production builds
  typescript: {
    // Only run type checking during development
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
