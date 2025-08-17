export interface OidcBasicUserInfo {
	sub: string;
	updated_at?: number;
}
export interface OidcProfile {
	name: string;
	given_name: string;
	family_name: string;
	nickname: string;
	preferred_username: string;
	profile?: string; // TODO: public profile ができたらやる
	picture: string;
	website?: string;
	gender?: string; // まだ持ってない
	zoneinfo: string; // 持ってないがみんな Asia/Tokyo でよさそう
	birthdate?: string; // まだ持ってない
	locale: string; // 持ってないが現状みんな ja-JP
}
export interface OidcEmail {
	email: string;
	email_verified: false; // メールアドレス検証はしていないので false 固定
}
// // まだ持ってない
// interface OidcPhone {
// 	phone_number?: string;
// 	phone_number_verified?: boolean;
// }
// interface OidcAddress {
// 	address?: {
// 		formatted?: string;
// 		street_address?: string;
// 		locality: string; // 市町村
// 		region?: string; // 都道府県
// 		postal_code?: string;
// 		country?: string;
// 	};
// }
export type OidcUserInfo = OidcBasicUserInfo &
	Partial<OidcProfile> &
	Partial<OidcEmail>;

export const claimsSupported: (keyof OidcUserInfo)[] = [
	"sub",
	"updated_at",
	"name",
	"given_name",
	"family_name",
	"nickname",
	"preferred_username",
	"profile",
	"picture",
	"website",
	"gender",
	"zoneinfo",
	"birthdate",
	"locale",
	"email",
	"email_verified",
] as const;

export const iss = "https://api.id.maximum.vc" as const;
