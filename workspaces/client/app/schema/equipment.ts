import * as v from "valibot";

const EQUIPMENT_NAME_MAX_LENGTH = 100;
const EQUIPMENT_DESCRIPTION_MAX_LENGTH = 500;

export const EquipmentSchemas = {
	Name: v.pipe(
		v.string(),
		v.nonEmpty("備品名を入力してください"),
		v.maxLength(
			EQUIPMENT_NAME_MAX_LENGTH,
			`備品名は${EQUIPMENT_NAME_MAX_LENGTH}文字以下で入力してください`,
		),
	),
	Description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(
				EQUIPMENT_DESCRIPTION_MAX_LENGTH,
				`備品の説明は${EQUIPMENT_DESCRIPTION_MAX_LENGTH}文字以下で入力してください`,
			),
		),
	),
	OwnerId: v.pipe(v.string(), v.nonEmpty("所有者を選択してください")),
};
