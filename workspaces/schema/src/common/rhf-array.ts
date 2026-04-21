import * as v from "valibot";

export const RHFableArray = <
	T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
	schema: T,
) =>
	v.union([
		// 非 RHF からのデータ向け
		v.array(schema),
		// RHF からのデータ向け
		// FieldArray は { value: T } の形をしている
		v.pipe(
			v.array(
				v.object({
					value: schema,
				}),
			),
			// { value: T } の形から T の形に変換
			v.transform((arr) => arr.map((item) => item.value as v.InferOutput<T>)),
		),
	]);
