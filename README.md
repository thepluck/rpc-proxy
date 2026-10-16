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
  | 80094 | `berachain` | 5000 | `mantle` |

- Any other chain in eRPC's Alchemy chain map: `http://localhost:4000/main/evm/<chainId>`.
- Robinhood Chain and Arc are missing from eRPC's Alchemy chain map, so `providers/alchemy.ts` adds
  them as explicit Alchemy upstreams (`directChains`). Add a chain there if eRPC answers
  `network 'evm:<id>' is not supported` for a chain Alchemy serves.
- Alchemy does not serve Etherlink. It goes through Etherlink's official public RPC, set in
  `providers/public.ts`, which is keyless and rate limited.
- Prometheus metrics: `http://localhost:4001/metrics`.
- Logs: `docker compose logs -f erpc`.

Both ports are bound to `127.0.0.1` only.

## Adding a provider

1. Write `providers/<name>.ts` that exports `providers` and `upstreams`, using
   `providers/alchemy.ts` as the model. Read its keys with `parseApiKeys` from
   `secrets/<name>-api-keys.json`.
2. List the module in `sources` in `providers/index.ts`.
3. Add the keys file as a secret in `docker-compose.yml`, with target `/secrets/<name>-api-keys.json`,
   and an example file next to it. Allow the example in `.gitignore`.

## Files

| File | Purpose |
| --- | --- |
| `erpc.ts` | eRPC config: server, memory cache, retries, chain aliases |
| `providers/index.ts` | Collects the providers and upstreams of every source |
| `providers/alchemy.ts` | One Alchemy provider per key, plus explicit upstreams for unmapped chains |
| `providers/public.ts` | Keyless public endpoints for chains no keyed provider serves (Etherlink) |
| `providers/keys.ts` | Validates a keys file |
| `docker-compose.yml` | Runs the pinned image and mounts the config and keys files |
| `secrets/alchemy-api-keys.json` | Your keys (private, gitignored) |
| `secrets/alchemy-api-keys.example.json` | Format reference |
