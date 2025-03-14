import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../schema";
import { getUserFromDisplayIdPrompt } from "./common/get-user-from-display-id-prompt";
import { DUMMY_USER_IDS } from "./register-user";

const USER_ID_PLACEHOLDER = "<USER_ID>";

const DUMMY_OAUTH_CLIENT_IDS = {
	CLIENT1: "0f55641d-87c2-4a1f-b998-36886151cab3",
	CLIENT2: "038fbcef-5d8d-4125-bc6d-d1b6e1669a4f",
	CLIENT3: "8dfb4997-b193-4e5a-ad0b-a907027a78cd",
};

const DUMMY_OAUTH_CLIENTS = [
	{
		id: DUMMY_OAUTH_CLIENT_IDS.CLIENT1,
		name: "OAuth App Test 1",
		description: "Automatically generated OAuth App by seeder",
		logoUrl: `https://i.pravatar.cc/150?u=${DUMMY_OAUTH_CLIENT_IDS.CLIENT1}`,
		ownerId: USER_ID_PLACEHOLDER,
	},
	{
		id: DUMMY_OAUTH_CLIENT_IDS.CLIENT2,
		name: "OAuth App Test 2",
		description: "Automatically generated OAuth App by seeder",
		logoUrl: `https://i.pravatar.cc/150?u=${DUMMY_OAUTH_CLIENT_IDS.CLIENT2}`,
		ownerId: DUMMY_USER_IDS.USER1,
	},
	{
		id: DUMMY_OAUTH_CLIENT_IDS.CLIENT3,
		name: "OAuth App Test 3",
		description: "Automatically generated OAuth App by seeder",
		logoUrl: `https://i.pravatar.cc/150?u=${DUMMY_OAUTH_CLIENT_IDS.CLIENT3}`,
		ownerId: DUMMY_USER_IDS.USER2,
	},
];

const DUMMY_OAUTH_CLIENT_MANAGERS = [
	{
		clientId: DUMMY_OAUTH_CLIENT_IDS.CLIENT1,
		userId: USER_ID_PLACEHOLDER,
	},
	{
		clientId: DUMMY_OAUTH_CLIENT_IDS.CLIENT2,
		userId: DUMMY_USER_IDS.USER1,
	},
	{
		clientId: DUMMY_OAUTH_CLIENT_IDS.CLIENT2,
		userId: USER_ID_PLACEHOLDER,
	},
	{
		clientId: DUMMY_OAUTH_CLIENT_IDS.CLIENT3,
		userId: DUMMY_USER_IDS.USER2,
	},
];

export const registerOAuthAppSeed = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	const user = await getUserFromDisplayIdPrompt(client);
	if (!user) return;

	{
		// dummy user check
		const dummyUserIds = Object.values(DUMMY_USER_IDS);
		const dummyUser = await client.query.users.findMany({
			where: (users, { inArray }) => inArray(users.id, dummyUserIds),
		});
		if (dummyUser.length !== dummyUserIds.length) {
			console.error("ダミーユーザーが登録されていません");
			console.log(
				"`pnpm seed` > ユーザー登録 を実行してから、再度実行してください",
			);
			return;
		}
	}

	await client.batch([
		client.insert(schema.oauthClients).values(
			DUMMY_OAUTH_CLIENTS.map((c) => ({
				...c,
				ownerId: c.ownerId === USER_ID_PLACEHOLDER ? user.userId : c.ownerId,
			})),
		),
		client.insert(schema.oauthClientManagers).values(
			DUMMY_OAUTH_CLIENT_MANAGERS.map((m) => ({
				...m,
				userId: m.userId === USER_ID_PLACEHOLDER ? user.userId : m.userId,
			})),
		),
	]);
};
