import type { Contribitions } from "./contribution";

export interface ICacheRepository<T, Options = unknown> {
	get: (identifier: string) => Promise<T | null>;
	set: (identifier: string, value: T, options?: Options) => Promise<void>;
}

export type IContributionCacheRepository = ICacheRepository<Contribitions>;
