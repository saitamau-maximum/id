import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	ICertification,
	ICertificationRepository,
} from "../../../repository/certification";

export class CloudflareCertificationRepository
	implements ICertificationRepository
{
	private client: DrizzleD1Database<typeof schema>;

	constructor(db: D1Database) {
		this.client = drizzle(db, { schema });
	}

	async getAllCertifications(): Promise<ICertification[]> {
		const res = await this.client.query.certifications.findMany();
		return res;
	}
}
