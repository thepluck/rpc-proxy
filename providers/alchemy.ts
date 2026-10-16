// Alchemy upstreams. API keys are read from secrets/alchemy-api-keys.json, a JSON array of strings
// (see secrets/alchemy-api-keys.example.json). The file is inlined when eRPC bundles the config.
import alchemyApiKeysFile from "../secrets/alchemy-api-keys.json";
import { parseApiKeys } from "./keys";

const apiKeys = parseApiKeys(alchemyApiKeysFile, "secrets/alchemy-api-keys.json");

// Chains Alchemy serves that are missing from eRPC's Alchemy chain map, keyed by chain ID with the
// Alchemy subdomain as value. The providers ignore them and they are added as explicit upstreams.
const directChains: Record<number, string> = {
  42793: "etherlink-mainnet",
  4663: "robinhood-mainnet",
  5042: "arc-mainnet",
};

const directNetworkIds = Object.keys(directChains).map((chainId) => `evm:${chainId}`);

// One provider per key. Each provider generates one upstream per Alchemy-supported chain, so every
// chain gets one upstream per key and eRPC spreads load and fails over between them.
export const providers = apiKeys.map((apiKey, i) => ({
  id: `alchemy-${i + 1}`,
  vendor: "alchemy",
  settings: { apiKey },
  ignoreNetworks: directNetworkIds,
}));

export const upstreams = apiKeys.flatMap((apiKey, i) =>
  Object.entries(directChains).map(([chainId, subdomain]) => ({
    id: `alchemy-${i + 1}-evm:${chainId}`,
    endpoint: `https://${subdomain}.g.alchemy.com/v2/${apiKey}`,
    evm: { chainId: Number(chainId) },
  })),
);
