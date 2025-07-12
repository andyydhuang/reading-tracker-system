// next.config.js
/** @type {import('next').NextConfig} */ // Add JSDoc for type checking
const nextConfig = {
  // your config options
  output: 'standalone', // Example

  // Add the images configuration here
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/**', // Changed this line to match any path under /books/
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/**', // Changed this line to match any path under /books/
      },
      // It's also very common for Google Books to serve images from lh3.googleusercontent.com
      // You should add this domain as well, as Google Books API responses often use it for thumbnails.
      {
        protocol: 'http', // Sometimes it can be http too
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // This means any path
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**', // This means any path
      },
    ],
  },
};

module.exports = nextConfig;