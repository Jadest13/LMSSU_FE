/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    FRONT_BASE_URL: process.env.NEXT_PUBLIC_FRONT_BASE_URL,
    BACK_BASE_URL: process.env.NEXT_PUBLIC_BACK_BASE_URL,
  },
}

module.exports = nextConfig
