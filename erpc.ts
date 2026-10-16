// eRPC config. Alchemy API keys are read from secrets/alchemy-api-keys.json, a JSON array of
// strings (see secrets/alchemy-api-keys.example.json). The file is inlined when eRPC bundles this
// config.
// Requests: POST http://localhost:4000/main/evm/<chainId>  or  /main/<alias>
import alchemyApiKeysFile from "./secrets/alchemy-api-keys.json";

const keysFile: unknown = alchemyApiKeysFile;

if (!Array.isArray(keysFile) || !keysFile.every((key) => typeof key === "string")) {
  throw new Error("secrets/alchemy-api-keys.json must be a JSON array of strings");
}

const alchemyApiKeys = keysFile.map((key: string) => key.trim()).filter((key) => key.length > 0);

if (alchemyApiKeys.length === 0) {
  throw new Error("secrets/alchemy-api-keys.json has no keys");
}

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
};

// Chains Alchemy serves that are missing from eRPC's Alchemy chain map, keyed by chain ID with the
// Alchemy subdomain as value. The providers ignore them and they are added as explicit upstreams.
const alchemyDirectChains: Record<number, string> = {
  42793: "etherlink-mainnet",
  4663: "robinhood-mainnet",
  5042: "arc-mainnet",
};

const directNetworkIds = Object.keys(alchemyDirectChains).map((chainId) => `evm:${chainId}`);

// One provider per key. Each provider generates one upstream per Alchemy-supported chain, so every
// chain gets one upstream per key and eRPC spreads load and fails over between them.
const alchemyProviders = alchemyApiKeys.map((apiKey, i) => ({
  id: `alchemy-${i + 1}`,
  vendor: "alchemy",
  settings: { apiKey },
  ignoreNetworks: directNetworkIds,
}));

const alchemyDirectUpstreams = alchemyApiKeys.flatMap((apiKey, i) =>
  Object.entries(alchemyDirectChains).map(([chainId, subdomain]) => ({
    id: `alchemy-${i + 1}-evm:${chainId}`,
    endpoint: `https://${subdomain}.g.alchemy.com/v2/${apiKey}`,
    evm: { chainId: Number(chainId) },
  })),
);

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
      providers: alchemyProviders,
      upstreams: alchemyDirectUpstreams,

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

      // Any other chain in eRPC's Alchemy chain map works at /main/evm/<chainId> without an entry
      // here.
      networks: Object.entries(networkAliases).map(([chainId, alias]) => ({
        architecture: "evm",
        evm: { chainId: Number(chainId) },
        alias,
      })),
    },
  ],
};
