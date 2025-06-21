import { factory } from "../factory";

const app = factory.createApp();

const route = app.get("/members/:userDisplayId", async (c) => {
	const userDisplayId = c.req.param("userDisplayId");
	const { UserRepository } = c.var;

	try {
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
	} catch (e) {
		return c.json(
			{
				error: true,
				message: e instanceof Error ? e.message : String(e),
			},
			500,
		);
	}
});

export { route as publicRoute };
