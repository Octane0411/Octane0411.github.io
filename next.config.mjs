import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'export',
  outputFileTracingRoot: process.cwd(),
  images: {
    unoptimized: true,
  },
}

const withMDX = createMDX({
  options: {
    rehypePlugins: [],
    remarkPlugins: [],
  },
})

export default withMDX(nextConfig)
