import minimist from "minimist";
import prompts from "prompts";

import { drizzle } from "drizzle-orm/d1";
import { Miniflare } from "miniflare";
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
}>(process.argv, {
	default: { help: false },
	alias: { h: "help" },
	string: ["_"],
});

// prettier-ignore
const helpMessage = `\
Usage: seed

Options:
	-h, --help     Display this message
`;

async function init() {
	const help = argv.help;
	if (help) {
		console.log(helpMessage);
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

	const mf = new Miniflare({
		// d1Persist には .wrangler/.../d1 が入る
		d1Persist: ".wrangler/state/v3/d1",
		// d1Databases.DB には wrangler.toml の database_id が入る
		d1Databases: { DB: "dev" },
		modules: true,
		script: "",
	});
	const d1database = await mf.getD1Database("DB");
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
				break;
		}
	} catch (e) {
		console.error(e);
	}
	await mf.dispose();
}

init().catch((e) => {
	console.error(e);
});
