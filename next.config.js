/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  // Updated experimental config
  serverExternalPackages: ['@octokit/rest'],
}

module.exports = nextConfig
