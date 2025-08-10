/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle missing environment variables during build
  experimental: {
    // This allows the build to continue even with missing env vars
    missingSuspenseWithCSRError: false,
  },
  
  // Optimize build process
  swcMinify: true,
  
  // Handle static generation errors gracefully
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
  // Ensure proper handling of environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig 