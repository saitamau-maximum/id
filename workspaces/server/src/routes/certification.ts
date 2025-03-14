import { vValidator } from "@hono/valibot-validator";
import * as v from "valibot";
import { factory } from "../factory";
import { authMiddleware } from "../middleware/auth";

const app = factory.createApp();

const CertificationRequestSchema = v.object({
	certificationId: v.pipe(v.string(), v.nonEmpty()),
	certifiedIn: v.pipe(v.number(), v.minValue(2000)),
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
	);

export { route as certificationRoute };
