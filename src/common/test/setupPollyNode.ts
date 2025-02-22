import { Context, setupPolly } from "setup-polly-jest"
import path from "path"

export default function setupPollyNode(recordingsDir: string): Context {
  return setupPolly({
    /* default configuration options */
    adapters: [require("@pollyjs/adapter-node-http"), require("@pollyjs/adapter-fetch")],
    persister: require("@pollyjs/persister-fs"),
    persisterOptions: {
      fs: {
        recordingsDir: path.resolve(recordingsDir, "__recordings__"),
      },
    },
  })
}
