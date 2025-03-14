import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { ROLE_IDS } from "../constants/role";
import { factory } from "../factory";
import {
	authMiddleware,
	roleAuthorizationMiddleware,
} from "../middleware/auth";

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
	description: v.optional(v.string()),
});

const route = app
	.get("/all", async (c) => {
		const { CertificationRepository } = c.var;
		const certifications = await CertificationRepository.getAllCertifications();
		return c.json(certifications);
	})
	.post(
		"/request",
		authMiddleware,
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

			return c.text("ok", 200);
		},
	)
	.get(
		"/request",
		authMiddleware,
		roleAuthorizationMiddleware({ ALLOWED_ROLES: [ROLE_IDS.ADMIN] }),
		async (c) => {
			const { CertificationRepository } = c.var;
			const requests =
				await CertificationRepository.getAllCertificationRequests();
			return c.json(requests);
		},
	)
	.put(
		"/review",
		authMiddleware,
		roleAuthorizationMiddleware({ ALLOWED_ROLES: [ROLE_IDS.ADMIN] }),
		vValidator("json", CertificationReviewSchema),
		async (c) => {
			const { CertificationRepository } = c.var;
			const { userId, certificationId, isApproved } = c.req.valid("json");
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
			return c.text("ok", 200);
		},
	)
	.post(
		"/create",
		authMiddleware,
		roleAuthorizationMiddleware({ ALLOWED_ROLES: [ROLE_IDS.ADMIN] }),
		vValidator("json", CertificationCreateSchema),
		async (c) => {
			const { CertificationRepository } = c.var;
			const { title, description } = c.req.valid("json");
			await CertificationRepository.createCertification({
				title,
				description: description ?? null,
			});
			return c.text("ok", 200);
		},
	)
	.delete(
		"/:certificationId",
		authMiddleware,
		roleAuthorizationMiddleware({ ALLOWED_ROLES: [ROLE_IDS.ADMIN] }),
		async (c) => {
			const { CertificationRepository } = c.var;
			const certificationId = c.req.param("certificationId");
			await CertificationRepository.deleteCertification(certificationId);
			return c.text("ok", 200);
		},
	)
	.delete("/:certificationId/my", authMiddleware, async (c) => {
		const { CertificationRepository } = c.var;
		const { userId } = c.get("jwtPayload");
		const certificationId = c.req.param("certificationId");
		await CertificationRepository.deleteUserCertification({
			userId,
			certificationId,
		});
		return c.text("ok", 200);
	});

export { route as certificationRoute };
