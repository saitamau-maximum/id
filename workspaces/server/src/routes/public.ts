import { factory } from "../factory";

const app = factory.createApp();

const route = app
	.get("/members/:userDisplayId", async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const { UserRepository } = c.var;

		const member =
			await UserRepository.fetchPublicMemberByDisplayId(userDisplayId);

		if (!member) {
			return c.json(
				{
					error: true,
					message: "Member not found",
				},
				404,
			);
		}

		return c.json({
			error: false,
			id: member.id,
			displayName: member.displayName,
			bio: member.bio,
			socialLinks: member.socialLinks,
			roles: member.roles,
		});
	})
	.get("/certifications", async (c) => {
		return c.json(
			await c.var.CertificationRepository.getCertificationsSummary(),
		);
	})
	.get("/affiliations-summary", async (c) => {
		const users = await c.var.UserRepository.fetchApprovedUsers();
		const res: Record<string, number> = {};
		for (const user of users) {
			let key = "unknown";
			if (user.grade?.startsWith("B")) {
				// B1, B2, B3, B4 の場合: B1-TI みたいな形式にする
				if (user.studentId) key = `${user.grade}-${user.studentId.slice(2, 4)}`;
			} else if (user.grade?.startsWith("M") || user.grade?.startsWith("D")) {
				// 学年だけ
				key = user.grade;
			}
			res[key] = (res[key] || 0) + 1;
		}
		return c.json(res);
	});

export { route as publicRoute };
