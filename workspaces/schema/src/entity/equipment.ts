import * as v from "valibot";
import { UserBasicInfo } from "./user";

const EQUIPMENT_NAME_MAX_LENGTH = 100;
const EQUIPMENT_DESCRIPTION_MAX_LENGTH = 500;

export const Equipment = v.object({
	id: v.string(),
	name: v.pipe(
		v.string(),
		v.nonEmpty("備品名を入力してください"),
		v.maxLength(
			EQUIPMENT_NAME_MAX_LENGTH,
			`備品名は${EQUIPMENT_NAME_MAX_LENGTH}文字以下で入力してください`,
		),
	),
	description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(
				EQUIPMENT_DESCRIPTION_MAX_LENGTH,
				`備品の説明は${EQUIPMENT_DESCRIPTION_MAX_LENGTH}文字以下で入力してください`,
			),
		),
	),
	createdAt: v.date(),
	updatedAt: v.date(),
	ownerId: v.pipe(v.string(), v.nonEmpty("所有者を選択してください")),
});
export type Equipment = v.InferOutput<typeof Equipment>;

export const EquipmentWithOwner = v.object({
	...Equipment.entries,
	owner: UserBasicInfo,
});
export type EquipmentWithOwner = v.InferOutput<typeof EquipmentWithOwner>;
