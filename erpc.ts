// eRPC config. Upstream sources are defined in providers/.
// Requests: POST http://localhost:4000/main/evm/<chainId>  or  /main/<alias>
import { providers, upstreams } from "./providers";

const networkAliases: Record<number, string> = {
  1: "ethereum",
  56: "bsc",
  42161: "arbitrum",
  137: "polygon",
  10: "optimism",
  43114: "avalanche",
  8453: "base",
  59144: "linea",
  146: "sonic",
  80094: "berachain",
  2020: "ronin",
  130: "unichain",
  999: "hyperevm",
  9745: "plasma",
  42793: "etherlink",
  143: "monad",
  4326: "megaeth",
  4663: "robinhood",
  5042: "arc",
  5000: "mantle",
};

const cachePolicy = (finality: string, ttl: string) => ({
  connector: "memory-cache",
  network: "*",
  method: "*",
  finality,
  ttl,
});

export default {
  logLevel: "info",

  server: {
    httpHostV4: "0.0.0.0",
    httpPortV4: 4000,
    maxTimeout: "60s",
  },

  metrics: {
    enabled: true,
    hostV4: "0.0.0.0",
    port: 4001,
  },

  database: {
    evmJsonRpcCache: {
      connectors: [
        {
          id: "memory-cache",
          driver: "memory",
          memory: { maxItems: 100000, maxTotalSize: "1GB" },
        },
      ],
      policies: [
        // Reorg-immune data is kept until evicted.
        cachePolicy("finalized", "0"),
        cachePolicy("unfinalized", "5s"),
        // eth_blockNumber, eth_gasPrice and other chain-tip reads.
        cachePolicy("realtime", "2s"),
        // Lookups by tx hash; the key is immutable.
        cachePolicy("unknown", "0"),
      ],
    },
  },

  projects: [
    {
      id: "main",
      providers,
      upstreams,

      networkDefaults: {
        failsafe: [
          {
            matchMethod: "*",
            timeout: { duration: "30s" },
            retry: {
              maxAttempts: 3,
              delay: "300ms",
              backoffFactor: 2,
              backoffMaxDelay: "5s",
            },
          },
        ],
      },

      // Any other chain a provider serves works at /main/evm/<chainId> without an entry here.
      networks: Object.entries(networkAliases).map(([chainId, alias]) => ({
        architecture: "evm",
        evm: { chainId: Number(chainId) },
        alias,
      })),
    },
  ],
};
