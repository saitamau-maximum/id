import { type InferInsertModel, and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type { IOauthRepository } from "./../../../usecase/repository/oauth";

export class CloudflareOauthRepository implements IOauthRepository {
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}
}
