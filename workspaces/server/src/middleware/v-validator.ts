// FormData の配列は length = 1 の場合に string として受け取ってしまうので、常に配列になるようにする
// base impl: https://github.com/honojs/middleware/blob/bde8a44ebaf6b70b66960c7b061bf39638df0679/packages/valibot-validator/src/index.ts

import type { FailedResponse, Hook } from "@hono/valibot-validator";
import type {
	Env,
	Handler,
	Input,
	TypedResponse,
	ValidationTargets,
} from "hono";
import { validator } from "hono/validator";
import type {
	GenericSchema,
	GenericSchemaAsync,
	InferInput,
	InferOutput,
} from "valibot";
import { safeParseAsync } from "valibot";

type MustBeResponse<T, Schema extends GenericSchema | GenericSchemaAsync> =
	T extends Promise<infer U>
		? Promise<MustBeResponse<U, Schema>>
		: T extends Response | TypedResponse<unknown>
			? T
			: never;

type HasUndefined<T> = undefined extends T ? true : false;

export const vValidatorForFormdata = <
	T extends GenericSchema | GenericSchemaAsync,
	Target extends keyof ValidationTargets,
	E extends Env,
	P extends string,
	In = InferInput<T>,
	Out = InferOutput<T>,
	I extends Input = {
		in: HasUndefined<In> extends true
			? {
					[K in Target]?: In extends ValidationTargets[K]
						? In
						: { [K2 in keyof In]?: ValidationTargets[K][K2] };
				}
			: {
					[K in Target]: In extends ValidationTargets[K]
						? In
						: { [K2 in keyof In]: ValidationTargets[K][K2] };
				};
		out: { [K in Target]: Out };
	},
	V extends I = I,
	R extends
		| undefined
		| Response
		| TypedResponse<unknown>
		| Promise<
				Response | TypedResponse<unknown> | undefined
		  > = FailedResponse<T>,
>(
	target: Target,
	arrayKeys: (keyof In)[],
	schema: T,
	hook?: Hook<T, E, P, Target, R>,
): Handler<E, P, V, MustBeResponse<R, T>> =>
	// @ts-expect-error not typed well
	validator(target, async (value, c) => {
		// ----- added ----- //
		// arrayKeys で指定された部分が string なら配列に変換する
		for (const key of arrayKeys) {
			if (typeof value[key] === "string") value[key] = [value[key]];
		}
		// ----------------- //

		const result = await safeParseAsync(schema, value);

		if (hook) {
			const hookResult = await hook({ ...result, target }, c);
			if (hookResult) {
				if (hookResult instanceof Response) {
					return hookResult;
				}

				if ("response" in hookResult) {
					return hookResult.response;
				}
			}
		}

		if (!result.success) {
			return c.json(result, 400);
		}

		return result.output;
	});
