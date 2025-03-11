import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../../schema";
import { DUMMY_USER_IDS } from "./register-user";

export const DUMMY_CERTS = [
	{
		id: "fe",
		title: "基本情報技術者試験",
		description: "Fundamental Information Technology Engineer Examination",
	},
	{
		id: "ap",
		title: "応用情報技術者試験",
		description: "Applied Information Technology Engineer Examination",
	},
];

export const DUMMY_RECORDS = [
	{
		userId: DUMMY_USER_IDS.USER1,
		certificationId: "fe",
		certifiedIn: 2025,
	},
	{
		userId: DUMMY_USER_IDS.USER2,
		certificationId: "fe",
		certifiedIn: 2024,
	},
	{
		userId: DUMMY_USER_IDS.USER2,
		certificationId: "ap",
		certifiedIn: 2025,
	},
];

export const registerCertificationSeed = async (
	client: DrizzleD1Database<typeof schema>,
) => {
	await client.batch([
		client.insert(schema.certifications).values(DUMMY_CERTS),
		client.insert(schema.userCertifications).values(DUMMY_RECORDS),
	]);
};
