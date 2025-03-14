import { and, eq } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	ICertification,
	ICertificationRepository,
	ICertificationRequest,
	ICertificationRequestWithUser,
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

	async getAllCertificationRequests(): Promise<
		ICertificationRequestWithUser[]
	> {
		const res = await this.client.query.userCertifications.findMany({
			where: (cert, { eq }) => eq(cert.isApproved, false),
			with: {
				user: {
					with: {
						profile: {
							columns: {
								displayId: true,
								displayName: true,
								profileImageURL: true,
							},
						},
					},
				},
			},
		});
		return res.map((req) => ({
			user: {
				id: req.user.id,
				...req.user.profile,
			},
			certificationId: req.certificationId,
			certifiedIn: req.certifiedIn,
		}));
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

	async createCertification(params: Omit<ICertification, "id">): Promise<void> {
		const id = crypto.randomUUID();
		await this.client.insert(schema.certifications).values({ ...params, id });
	}

	async deleteCertification(certificationId: string): Promise<void> {
		await this.client.batch([
			this.client
				.delete(schema.userCertifications)
				.where(eq(schema.userCertifications.certificationId, certificationId)),
			this.client
				.delete(schema.certifications)
				.where(eq(schema.certifications.id, certificationId)),
		]);
	}

	async deleteUserCertification(
		params: Omit<ICertificationRequest, "certifiedIn">,
	): Promise<void> {
		await this.client
			.delete(schema.userCertifications)
			.where(
				and(
					eq(schema.userCertifications.userId, params.userId),
					eq(schema.userCertifications.certificationId, params.certificationId),
				),
			);
	}
}
