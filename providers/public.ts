// Keyless public endpoints for chains that no keyed provider serves, keyed by chain ID.
const endpoints: Record<number, string> = {
  // Etherlink's official RPC.
  42793: "https://node.mainnet.etherlink.com",
};

export const providers = [];

export const upstreams = Object.entries(endpoints).map(([chainId, endpoint]) => ({
  id: `public-evm:${chainId}`,
  endpoint,
  evm: { chainId: Number(chainId) },
}));
