import type { DrizzleD1Database } from "drizzle-orm/d1";
import { OAUTH_PROVIDER_IDS } from "../../../constants/oauth";
import { ROLE_IDS } from "../../../constants/role";
import * as schema from "../../schema";

const DUMMY_INITIALIZED_USERS = [
	{
		id: "user1",
		profile: {
			id: "profile1",
			displayName: "User One",
			realName: "Real User One",
			realNameKana: "リアルユーザー1",
			displayId: "userone",
			profileImageURL: "https://i.pravatar.cc/300?img=1",
			academicEmail: "user1@academic.edu",
			email: "user1@example.com",
			studentId: "12AB001",
			grade: "B1",
		},
		roles: [ROLE_IDS.ADMIN, ROLE_IDS.MEMBER],
	},
	{
		id: "user2",
		profile: {
			id: "profile2",
			displayName: "User Two",
			realName: "Real User Two",
			realNameKana: "リアルユーザー2",
			displayId: "usertwo",
			profileImageURL: "https://i.pravatar.cc/300?img=2",
			academicEmail: "user2@academic.edu",
			email: "user2@example.com",
			studentId: "12AC002",
			grade: "B2",
		},
		roles: [ROLE_IDS.MEMBER],
	},
	{
		id: "user3",
		profile: {
			id: "profile3",
			displayName: "User Three",
			realName: "Real User Three",
			realNameKana: "リアルユーザー3",
			displayId: "userthree",
			profileImageURL: "https://i.pravatar.cc/300?img=3",
			academicEmail: "user3@academic.edu",
			email: "user3@example.com",
			studentId: "12AD003",
			grade: "B3",
		},
		roles: [ROLE_IDS.MEMBER],
	},
];

const DUMMY_UNINITIALIZED_USERS = [
	{
		id: "user4",
		profile: {
			id: "profile4",
			profileImageURL: "https://i.pravatar.cc/300?img=4",
			displayName: "userfour",
			email: "user4@example.com",
		},
	},
	{
		id: "user5",
		profile: {
			id: "profile5",
			profileImageURL: "https://i.pravatar.cc/300?img=5",
			displayName: "userfive",
			email: "user5@example.com",
		},
	},
];

// user1~5まで全てのユーザーがGitHubでログインしているとする
const DUMMY_OAUTH_CONNECTIONS = [
	{
		userId: "user1",
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		providerUserId: "github-user1",
		login: "userone",
		email: "user1@example.com",
		avatar_url: "https://i.pravatar.cc/300?img=1",
	},
	{
		userId: "user2",
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		providerUserId: "github-user2",
		login: "usertwo",
		email: "https://i.pravatar.cc/300?img=2",
	},
	{
		userId: "user3",
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		providerUserId: "github-user3",
		login: "userthree",
		email: "https://i.pravatar.cc/300?img=3",
	},
	{
		userId: "user4",
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		providerUserId: "github-user4",
		login: "userfour",
		email: "https://i.pravatar.cc/300?img=4",
	},
	{
		userId: "user5",
		providerId: OAUTH_PROVIDER_IDS.GITHUB,
		providerUserId: "github-user5",
		login: "userfive",
		email: "https://i.pravatar.cc/300?img=5",
	},
];

export const registerUserSeed = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	for (const user of DUMMY_INITIALIZED_USERS) {
		await client.batch([
			client.insert(schema.users).values({
				id: user.id,
				initializedAt: new Date(),
			}),
			client.insert(schema.userProfiles).values({
				id: user.profile.id,
				userId: user.id,
				displayName: user.profile.displayName,
				realName: user.profile.realName,
				realNameKana: user.profile.realNameKana,
				displayId: user.profile.displayId,
				profileImageURL: user.profile.profileImageURL,
				academicEmail: user.profile.academicEmail,
				email: user.profile.email,
				studentId: user.profile.studentId,
				grade: user.profile.grade,
			}),
		]);
	}

	for (const user of DUMMY_UNINITIALIZED_USERS) {
		await client.batch([
			client.insert(schema.users).values({
				id: user.id,
			}),
			client.insert(schema.userProfiles).values({
				id: user.profile.id,
				userId: user.id,
				profileImageURL: user.profile.profileImageURL,
				email: user.profile.email,
				displayName: user.profile.displayName,
			}),
		]);
	}

	for (const connection of DUMMY_OAUTH_CONNECTIONS) {
		await client.insert(schema.oauthConnections).values(connection);
	}
};
