import minimist from "minimist";
import prompts from "prompts";

import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import { createSQLiteDB } from "@miniflare/shared";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../schema";
import { editUserRole } from "./senario/edit-user-role";
import { registerCalendarSeed } from "./senario/register-calendar";
import { registerCertificationSeed } from "./senario/register-certification";
import { registerLocationSeed } from "./senario/register-location";
import { registerOAuthAppSeed } from "./senario/register-oauth-app";
import { registerUserSeed } from "./senario/register-user";
import { reset } from "./senario/reset";
import { resetRegister } from "./senario/reset-register";

const argv = minimist<{
	help?: boolean;
	url: string;
}>(process.argv, {
	default: { help: false },
	alias: { h: "help", u: "url" },
	string: ["_"],
});

// prettier-ignore
const helpMessage = `\
Usage: seed [DATABASE_URL]

Options:
	-h, --help     Display this message
`;

async function init() {
	const help = argv.help;
	if (help) {
		console.log(helpMessage);
		return;
	}

	const DATABASE_URL = argv.url;
	if (!DATABASE_URL) {
		console.error("DATABASE_URL is required");
		console.log(
			"`pnpm apply:migrations:local` を実行していない可能性があります",
		);
		return;
	}

	prompts.override({
		overwrite: argv.overwrite,
	});

	const result = await prompts(
		{
			type: "select",
			name: "senario",
			message: "Seedするシナリオを選択してください",
			choices: [
				{ title: "ユーザー登録", value: "register-user" },
				{ title: "OAuth アプリケーション登録", value: "register-oauth-app" },
				{ title: "カレンダーイベント登録", value: "register-calendar" },
				{ title: "資格一覧登録", value: "register-certification" },
				{ title: "活動場所登録", value: "register-location" },
				{ title: "ユーザーロール編集", value: "edit-user-role" },
				{ title: "ユーザー初期登録リセット", value: "reset-register" },
				{ title: "DBリセット", value: "reset" },
			],
		},
		{
			onCancel() {
				console.error("Prompt canceled");
				process.exit(1);
			},
		},
	);

	const sqliteDb = await createSQLiteDB(DATABASE_URL);
	const d1database = new D1Database(new D1DatabaseAPI(sqliteDb));
	const client = drizzle(d1database, { schema });

	try {
		switch (result.senario) {
			case "register-user":
				await registerUserSeed(client);
				break;
			case "register-oauth-app":
				await registerOAuthAppSeed(client);
				break;
			case "register-calendar":
				await registerCalendarSeed(client);
				break;
			case "register-certification":
				await registerCertificationSeed(client);
				break;
			case "register-location":
				await registerLocationSeed(client);
				break;
			case "edit-user-role":
				await editUserRole(client);
				break;
			case "reset-register":
				await resetRegister(client);
				break;
			case "reset":
				await reset(client);
				break;
			default:
				console.error("Invalid senario");
				return;
		}
	} catch (e) {
		console.error(e);
		return;
	}
}

init().catch((e) => {
	console.error(e);
});
