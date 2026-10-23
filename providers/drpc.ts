// dRPC upstreams. API keys are read from secrets/drpc-api-keys.json, a JSON array of strings (see
// secrets/drpc-api-keys.example.json). An empty array adds no dRPC upstreams.
import drpcApiKeysFile from "../secrets/drpc-api-keys.json";
import { parseApiKeys } from "./keys";

const apiKeys = parseApiKeys(drpcApiKeysFile, "secrets/drpc-api-keys.json", false);

// Chains dRPC serves that are missing from eRPC's built-in dRPC chain map, keyed by chain ID with
// dRPC's network name as value. The providers ignore them and they are added as explicit upstreams.
const directChains: Record<number, string> = {
  42793: "etherlink",
  4663: "robinhood",
  5042: "arc",
};

const directNetworkIds = Object.keys(directChains).map((chainId) => `evm:${chainId}`);

// dRPC's free plan rejects these chains with "chain is not available on free plan".
const freePlanUnavailable = ["evm:9745"];

// One provider per key. Each provider generates one upstream per dRPC-supported chain. They are
// primaries alongside the Alchemy upstreams, and eRPC orders primaries by latency.
export const providers = apiKeys.map((apiKey, i) => ({
  id: `drpc-${i + 1}`,
  vendor: "drpc",
  settings: { apiKey },
  ignoreNetworks: [...directNetworkIds, ...freePlanUnavailable],
}));

export const upstreams = apiKeys.flatMap((apiKey, i) =>
  Object.entries(directChains).map(([chainId, network]) => ({
    id: `drpc-${i + 1}-evm:${chainId}`,
    endpoint: `https://lb.drpc.org/ogrpc?network=${network}&dkey=${apiKey}`,
    evm: { chainId: Number(chainId) },
  })),
);
