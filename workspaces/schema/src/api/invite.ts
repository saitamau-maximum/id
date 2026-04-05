import * as v from "valibot";
import { InviteWithIssuer } from "../entity/invite";

export const InviteCreateParams = v.pipe(
	v.object({
		title: v.pipe(
			v.string(),
			v.nonEmpty("タイトルを入力してください"),
			v.maxLength(64, "タイトルは64文字以下で入力してください"),
		),
		expiresAt: v.optional(
			v.pipe(
				v.string(),
				v.isoTimestamp(),
				v.toDate(),
				v.check(
					(date) => date > new Date(),
					"有効期限は未来の日付を指定してください",
				),
			),
		),
		remainingUse: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
	}),
	v.check((data) => {
		// 招待リンクは expiresAt と remainingUse のどちらか一方が必須（共存可能）
		if (!data.expiresAt && !data.remainingUse) return false;
		return true;
	}),
);
export type InviteCreateParams = v.InferOutput<typeof InviteCreateParams>;

export const InviteCreateParamsForForm = v.object({
	title: InviteCreateParams.entries.title,
	// form では string として受け取るので
	expiresAt: v.optional(
		v.pipe(
			v.string(),
			v.isoDateTime("有効期限は日時で入力してください"),
			v.toDate(),
			v.check(
				(date) => date > new Date(),
				"有効期限は未来の日時を指定してください",
			),
		),
	),
	remainingUse: v.optional(
		v.pipe(
			v.string(),
			v.toNumber(),
			v.integer("使用可能回数は整数で入力してください"),
			v.minValue(1, "使用可能回数は1以上で入力してください"),
		),
	),
});

export const GetInvitesResponse = v.array(InviteWithIssuer);
export type GetInvitesResponse = v.InferOutput<typeof GetInvitesResponse>;
