# eRPC with Alchemy

Local [eRPC](https://docs.erpc.cloud/) proxy (v0.4.0) in front of one or more Alchemy API keys.

## Setup

1. Put your keys in `secrets/alchemy-api-keys.json` as a JSON array of strings:

   ```json
   ["key-1", "key-2", "key-3"]
   ```

   The file is gitignored. Each key becomes its own upstream on every Alchemy chain, and eRPC
   balances and fails over between them.

2. Start it:

   ```bash
   docker compose up -d
   ```

   After editing the keys file, run `docker compose restart`. The file is read only at startup.

## Use

```bash
curl -X POST http://localhost:4000/main/ethereum \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

- Configured chains, by alias or at `/main/evm/<chainId>`:

  | Chain ID | Alias | Chain ID | Alias |
  | --- | --- | --- | --- |
  | 1 | `ethereum` | 2020 | `ronin` |
  | 56 | `bsc` | 130 | `unichain` |
  | 42161 | `arbitrum` | 999 | `hyperevm` |
  | 137 | `polygon` | 9745 | `plasma` |
  | 10 | `optimism` | 42793 | `etherlink` |
  | 43114 | `avalanche` | 143 | `monad` |
  | 8453 | `base` | 4326 | `megaeth` |
  | 59144 | `linea` | 4663 | `robinhood` |
  | 146 | `sonic` | 5042 | `arc` |
  | 80094 | `berachain` | | |

- Any other chain in eRPC's Alchemy chain map: `http://localhost:4000/main/evm/<chainId>`.
- Etherlink, Robinhood Chain and Arc are missing from eRPC's Alchemy chain map, so `erpc.ts` adds
  them as explicit Alchemy upstreams (`alchemyDirectChains`). Add a chain there if eRPC answers
  `network 'evm:<id>' is not supported` for a chain Alchemy serves.
- Prometheus metrics: `http://localhost:4001/metrics`.
- Logs: `docker compose logs -f erpc`.

Both ports are bound to `127.0.0.1` only.

## Files

| File | Purpose |
| --- | --- |
| `erpc.ts` | eRPC config: one Alchemy provider per key, memory cache, retries, aliases |
| `docker-compose.yml` | Runs the pinned image and mounts the keys file as a secret |
| `secrets/alchemy-api-keys.json` | Your keys (private, gitignored) |
| `secrets/alchemy-api-keys.example.json` | Format reference |
