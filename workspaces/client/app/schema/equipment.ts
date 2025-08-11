import * as v from "valibot";

export const EquipmentSchemas = {
	Name: v.pipe(
		v.string(),
		v.nonEmpty("備品名を入力してください"),
		v.maxLength(100, "備品名は100文字以下で入力してください"),
	),
	Description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(500, "備品の説明は500文字以下で入力してください"),
		),
	),
	OwnerId: v.pipe(v.string(), v.nonEmpty("所有者を選択してください")),
};
