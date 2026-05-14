import * as v from "valibot";

export const RHFableArray = <
	T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
	schema: T,
) =>
	v.array(
		v.pipe(
			v.union([
				// 非 RHF からのデータ向け
				schema,
				// RHF からのデータ向け
				// FieldArray は { value: T } の形をしている
				v.object({
					value: schema,
				}),
			]),
			v.transform((val) => {
				if (typeof val === "object" && val !== null && "value" in val) {
					return val.value as v.InferOutput<T>;
				}
				return val as v.InferOutput<T>;
			}),
		),
	);
