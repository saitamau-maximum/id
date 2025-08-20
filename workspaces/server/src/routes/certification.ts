import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { adminOnlyMiddleware, memberOnlyMiddleware } from "../middleware/auth";

const app = factory.createApp();

const CertificationRequestSchema = v.object({
	certificationId: v.pipe(v.string(), v.nonEmpty()),
	certifiedIn: v.pipe(v.number(), v.minValue(2000)),
});

const CertificationReviewSchema = v.object({
	userId: v.pipe(v.string(), v.nonEmpty()),
	certificationId: v.pipe(v.string(), v.nonEmpty()),
	isApproved: v.boolean(),
});

const CertificationCreateSchema = v.object({
	title: v.pipe(v.string(), v.nonEmpty()),
	description: v.string(),
});

const CertificationUpdateSchema = v.object({
	description: v.string(),
});

const route = app
	.get("/all", async (c) => {
		const { CertificationRepository } = c.var;
		const certifications = await CertificationRepository.getAllCertifications();
		return c.json(certifications);
	})
	.post(
		"/request",
		memberOnlyMiddleware,
		vValidator("json", CertificationRequestSchema),
		async (c) => {
			const payload = c.get("jwtPayload");
			const { CertificationRepository } = c.var;

			const { certificationId, certifiedIn } = c.req.valid("json");
			await CertificationRepository.requestCertification({
				userId: payload.userId,
				certificationId,
				certifiedIn,
			});

			return c.body(null, 201);
		},
	)
	.get("/request", adminOnlyMiddleware, async (c) => {
		const { CertificationRepository } = c.var;
		const requests =
			await CertificationRepository.getAllCertificationRequests();
		return c.json(requests);
	})
	.put(
		"/review",
		adminOnlyMiddleware,
		vValidator("json", CertificationReviewSchema),
		async (c) => {
			const { CertificationRepository } = c.var;
			const { userId, certificationId, isApproved } = c.req.valid("json");

			// 存在チェック
			const certificationExists =
				await CertificationRepository.existsUserCertification({
					userId,
					certificationId,
				});
			if (!certificationExists) {
				return c.body(null, 404);
			}

			if (isApproved) {
				await CertificationRepository.approveCertificationRequest(
					userId,
					certificationId,
				);
			} else {
				await CertificationRepository.rejectCertificationRequest(
					userId,
					certificationId,
				);
			}
			return c.body(null, 204);
		},
	)
	.post(
		"/create",
		adminOnlyMiddleware,
		vValidator("json", CertificationCreateSchema),
		async (c) => {
			const { CertificationRepository } = c.var;
			const { title, description } = c.req.valid("json");
			await CertificationRepository.createCertification({
				title,
				description,
			});
			return c.body(null, 201);
		},
	)
	.put(
		"/:certificationId",
		adminOnlyMiddleware,
		vValidator("json", CertificationUpdateSchema),
		async (c) => {
			const { CertificationRepository } = c.var;
			const certificationId = c.req.param("certificationId");
			const { description } = c.req.valid("json");

			// 存在チェック
			const certificationExists =
				await CertificationRepository.existsCertification(certificationId);
			if (!certificationExists) {
				return c.body(null, 404);
			}

			await CertificationRepository.updateCertification({
				certificationId,
				description,
			});
			return c.body(null, 204);
		},
	)
	.delete("/:certificationId", adminOnlyMiddleware, async (c) => {
		const { CertificationRepository } = c.var;
		const certificationId = c.req.param("certificationId");

		// 存在チェック
		const certificationExists =
			await CertificationRepository.existsCertification(certificationId);
		if (!certificationExists) {
			return c.body(null, 404);
		}

		await CertificationRepository.deleteCertification(certificationId);
		return c.body(null, 204);
	})
	.delete("/:certificationId/my", memberOnlyMiddleware, async (c) => {
		const { CertificationRepository } = c.var;
		const { userId } = c.get("jwtPayload");
		const certificationId = c.req.param("certificationId");

		// 存在チェック
		const certificationExists =
			await CertificationRepository.existsUserCertification({
				userId,
				certificationId,
			});
		if (!certificationExists) {
			return c.body(null, 404);
		}

		await CertificationRepository.deleteUserCertification({
			userId,
			certificationId,
		});
		return c.body(null, 204);
	});

export { route as certificationRoute };
