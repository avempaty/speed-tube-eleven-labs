/** @type {import('next').NextConfig} */
const nextConfig = {
  // extend webpack config to always bundle hnswlib-node
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("hnswlib-node")
      // config.module.rules.push({
      //   test: /node:(fs|streams)/,
      //   use: "node-loader",
      // })
    }
    config.module.rules.push({
      test: /\.txt$/i,
      type: "asset/source",
    })

    return config
  },
  async headers() {
    return [
      {
        source: "/v/[videoId]",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src *;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
