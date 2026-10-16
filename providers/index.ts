// Every upstream source. To add one, write a module next to alchemy.ts that exports `providers` and
// `upstreams`, then list it in `sources`.
import * as alchemy from "./alchemy";

const sources = [alchemy];

export const providers = sources.flatMap((source) => source.providers);
export const upstreams = sources.flatMap((source) => source.upstreams);
