import { and, eq, sql } from "drizzle-orm";
import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import * as schema from "../../../db/schema";
import type {
	ICertification,
	ICertificationRepository,
	ICertificationRequest,
	ICertificationRequestWithUser,
	ICertificationSummary,
	ICertificationUpdateRequest,
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

	async existsCertification(certificationId: string): Promise<boolean> {
		const res = await this.client.query.certifications.findFirst({
			where: eq(schema.certifications.id, certificationId),
		});
		return !!res;
	}

	async createCertification(params: Omit<ICertification, "id">): Promise<void> {
		const id = crypto.randomUUID();
		await this.client.insert(schema.certifications).values({ ...params, id });
	}

	async updateCertification(
		params: ICertificationUpdateRequest,
	): Promise<void> {
		await this.client
			.update(schema.certifications)
			.set({ description: params.description })
			.where(eq(schema.certifications.id, params.certificationId));
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

	async existsUserCertification(
		params: Omit<ICertificationRequest, "certifiedIn">,
	): Promise<boolean> {
		const res = await this.client.query.userCertifications.findFirst({
			where: and(
				eq(schema.userCertifications.userId, params.userId),
				eq(schema.userCertifications.certificationId, params.certificationId),
			),
			columns: {
				certifiedIn: true,
				isApproved: true,
			},
		});
		return !!res;
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

	async getCertificationsSummary(): Promise<ICertificationSummary[]> {
		const res = await this.client
			.select({
				id: schema.certifications.id,
				title: schema.certifications.title,
				// count + where でやると「登録はされているが取得はしていない資格」「まだ承認された人がいない資格」の場合に
				// 0 人とならず、そもそも資格が存在しない扱いになってしまうため生 sql で対応
				// If you use count + where, certifications that are registered but not yet obtained, or certifications with no approved holders,
				// will not be counted as "0 people" but will be treated as if the certification does not exist at all, so we use raw SQL here.
				numberOfHolders: sql<number>`COUNT(CASE WHEN ${schema.userCertifications.isApproved} = TRUE THEN 1 END)`,
			})
			.from(schema.certifications)
			.leftJoin(
				schema.userCertifications,
				eq(schema.certifications.id, schema.userCertifications.certificationId),
			)
			.groupBy(schema.certifications.id);

		return res;
	}
}
