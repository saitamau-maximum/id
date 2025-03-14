import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	ICertification,
	ICertificationRepository,
	ICertificationRequest,
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

	async requestCertification(params: ICertificationRequest): Promise<void> {
		await this.client.insert(schema.userCertifications).values({
			userId: params.userId,
			certificationId: params.certificationId,
			certifiedIn: params.certifiedIn,
			isApproved: false,
		});
	}

	async getAllCertificationRequests(): Promise<ICertificationRequest[]> {
		const res = await this.client.query.userCertifications.findMany({
			where: (cert, { eq }) => eq(cert.isApproved, false),
		});
		return res;
	}

	async approveCertificationRequest(
		userId: string,
		certificationId: string,
	): Promise<void> {
		await this.client
			.update(schema.userCertifications)
			.set({
				isApproved: true,
			})
			.where(
				and(
					eq(schema.userCertifications.userId, userId),
					eq(schema.userCertifications.certificationId, certificationId),
				),
			);
	}

	async rejectCertificationRequest(
		userId: string,
		certificationId: string,
	): Promise<void> {
		await this.client
			.delete(schema.userCertifications)
			.where(
				and(
					eq(schema.userCertifications.userId, userId),
					eq(schema.userCertifications.certificationId, certificationId),
				),
			);
	}

	async createCertification(certification: ICertification): Promise<void> {
		await this.client.insert(schema.certifications).values(certification);
	}
}
