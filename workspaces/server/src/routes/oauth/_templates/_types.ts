import type { FC } from "hono/jsx";

export type NonNullableFC<P> = {
	(props: P): NonNullable<ReturnType<FC<P>>>;
	defaultProps?: Partial<P> | undefined;
	displayName?: string | undefined;
};
