// Keyless public endpoints, keyed by chain ID.

// Serve chains that no keyed provider serves.
const primary: Record<number, string[]> = {
  42793: ["https://node.mainnet.etherlink.com"],
};

// Tagged tier:fallback. The selection policy in erpc.ts lists them after the primary upstreams.
// Endpoints that serve historical (archive) state are listed first. eRPC ranks fallbacks by latency
// rather than by this order, and moves on to the next fallback when one lacks the requested state.
// No keyless endpoint tested for BSC, Arbitrum or Ronin serves historical state.
const fallback: Record<number, string[]> = {
  1: ["https://eth.drpc.org", "https://mainnet.gateway.tenderly.co"],
  56: ["https://bsc-dataseed1.bnbchain.org", "https://bsc-rpc.publicnode.com"],
  42161: ["https://arb1.arbitrum.io/rpc", "https://arbitrum.drpc.org"],
  137: ["https://polygon.drpc.org", "https://polygon.gateway.tenderly.co"],
  10: ["https://mainnet.optimism.io", "https://optimism.drpc.org"],
  43114: ["https://api.avax.network/ext/bc/C/rpc", "https://avalanche.drpc.org"],
  8453: ["https://mainnet.base.org", "https://base.drpc.org"],
  59144: ["https://rpc.linea.build", "https://linea.drpc.org"],
  146: ["https://rpc.soniclabs.com", "https://sonic.drpc.org"],
  80094: ["https://rpc.berachain.com", "https://berachain.drpc.org"],
  2020: ["https://api.roninchain.com/rpc"],
  130: ["https://mainnet.unichain.org", "https://unichain.drpc.org"],
  999: ["https://rpc.hyperliquid.xyz/evm", "https://hyperliquid.drpc.org"],
  9745: ["https://rpc.plasma.to"],
  42793: ["https://etherlink.drpc.org"],
  143: ["https://rpc-mainnet.monadinfra.com", "https://rpc.monad.xyz"],
  4326: ["https://mainnet.megaeth.com/rpc", "https://megaeth.drpc.org"],
  4663: ["https://robinhood.drpc.org", "https://rpc.mainnet.chain.robinhood.com"],
  5042: ["https://rpc.mainnet.arc.io", "https://arc.drpc.org"],
  5000: ["https://rpc.mantle.xyz", "https://mantle.drpc.org"],
};

// skipSyncingCheck: several public RPCs reject eth_syncing, which eRPC calls to detect syncing nodes.
const toUpstreams = (endpoints: Record<number, string[]>, idPrefix: string, tags: string[]) =>
  Object.entries(endpoints).flatMap(([chainId, urls]) =>
    urls.map((endpoint) => ({
      id: `${idPrefix}-${endpoint.split("/")[2]}-evm:${chainId}`,
      endpoint,
      evm: { chainId: Number(chainId), skipSyncingCheck: true },
      tags,
    })),
  );

export const providers = [];

export const upstreams = [
  ...toUpstreams(primary, "public", []),
  ...toUpstreams(fallback, "fallback", ["tier:fallback"]),
];
