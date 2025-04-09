/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  // Ensure we don't expose tokens in client-side code
  experimental: {
    serverComponentsExternalPackages: ['@octokit/rest'],
  },
}

module.exports = nextConfig
