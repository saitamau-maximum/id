import { factory } from "../factory";

const app = factory.createApp();

const route = app.get("/all", async (c) => {
	const { CertificationRepository } = c.var;
	const certifications = await CertificationRepository.getAllCertifications();
	return c.json(certifications);
});

export { route as certificationRoute };
