import type { FC } from "hono/jsx";

// なんか型的に FC の戻り値が null になることがあるので、それを除去した型
export type NonNullableFC<P> = {
	(props: P): NonNullable<ReturnType<FC<P>>>;
	defaultProps?: Partial<P> | undefined;
	displayName?: string | undefined;
};

// T or Promise<T>
export type Awaitable<T> = Promise<T> | T;
