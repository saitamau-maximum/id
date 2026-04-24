import * as v from "valibot";

export const OIDCBasicUserInfo = v.object({
	sub: v.pipe(v.string(), v.nonEmpty()),
	updated_at: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
});
export type OIDCBasicUserInfo = v.InferOutput<typeof OIDCBasicUserInfo>;

export const OIDCProfile = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	given_name: v.pipe(v.string(), v.nonEmpty()),
	family_name: v.pipe(v.string(), v.nonEmpty()),
	nickname: v.pipe(v.string(), v.nonEmpty()),
	preferred_username: v.pipe(v.string(), v.nonEmpty()),
	profile: v.optional(v.pipe(v.string(), v.nonEmpty(), v.url())), // TODO: public profile ができたらやる
	picture: v.pipe(v.string(), v.nonEmpty(), v.url()),
	website: v.optional(v.pipe(v.string(), v.nonEmpty(), v.url())),
	gender: v.optional(v.pipe(v.string(), v.nonEmpty())), // 持ってない
	zoneinfo: v.pipe(v.string(), v.nonEmpty()), // 持ってないがみんな Asia/Tokyo でよさそう
	birthdate: v.optional(v.pipe(v.string(), v.nonEmpty(), v.isoDate())), // まだ持ってない
	locale: v.pipe(v.string(), v.nonEmpty()), // 持ってないが現状みんな ja-JP
});
export type OIDCProfile = v.InferOutput<typeof OIDCProfile>;

export const OIDCEmail = v.object({
	email: v.pipe(v.string(), v.nonEmpty(), v.email()),
	email_verified: v.literal(false), // メールアドレス検証はしていないので false 固定
});
export type OIDCEmail = v.InferOutput<typeof OIDCEmail>;

// まだ持ってない
// export const OIDCPhone = v.object({
// 	phone_number: v.pipe(v.string(), v.nonEmpty()),
// 	phone_number_verified: v.boolean(),
// });
// export type OIDCPhone = v.InferOutput<typeof OIDCPhone>;
//
// export const OIDCAddress = v.object({
// 	address: v.object({
// 		formatted: v.optional(v.pipe(v.string(), v.nonEmpty())),
// 		street_address: v.optional(v.pipe(v.string(), v.nonEmpty())),
// 		locality: v.pipe(v.string(), v.nonEmpty()), // 市町村
// 		region: v.optional(v.pipe(v.string(), v.nonEmpty())), // 都道府県
// 		postal_code: v.optional(v.pipe(v.string(), v.nonEmpty())),
// 		country: v.optional(v.pipe(v.string(), v.nonEmpty())),
// 	}),
// });
// export type OIDCAddress = v.InferOutput<typeof OIDCAddress>;

export const OIDCUserInfo = v.intersect([
	OIDCBasicUserInfo,
	v.partial(OIDCProfile),
	v.partial(OIDCEmail),
]);
export type OIDCUserInfo = v.InferOutput<typeof OIDCUserInfo>;
