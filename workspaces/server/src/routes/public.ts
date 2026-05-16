import type {
	GetAffiliationsSummaryResponse,
	GetCertificationsResponse,
	GetPublicMemberResponse,
} from "@idp/schema/api/public";
import {
	GRADE_BY_ID,
	isGraduateGrade,
	isUndergraduateGrade,
} from "@idp/schema/entity/grade";
import { ROLE_BY_ID } from "@idp/schema/entity/role";
import { factory } from "../factory";

const app = factory.createApp();

const route = app
	.get("/members/:userDisplayId", async (c) => {
		const userDisplayId = c.req.param("userDisplayId");
		const { UserRepository } = c.var;

		const member =
			await UserRepository.fetchPublicMemberByDisplayId(userDisplayId);

		if (!member) {
			return c.json<GetPublicMemberResponse>(
				{
					error: true,
					message: "Member not found",
				},
				404,
			);
		}

		return c.json<GetPublicMemberResponse>({
			error: false,
			id: member.id,
			displayName: member.displayName,
			profileImageURL: member.profileImageURL,
			bio: member.bio,
			socialLinks: member.socialLinks,
			roles: member.roles.map((role) => role.name),
		});
	})
	.get("/certifications", async (c) => {
		return c.json<GetCertificationsResponse>(
			await c.var.CertificationRepository.getCertificationsSummary(),
		);
	})
	.get("/roles", async (c) => {
		return c.json(
			Object.values(ROLE_BY_ID).map((r) => ({
				id: r.id,
				slug: r.slug,
				name: r.name,
				color: r.color,
			})),
		);
	})
	.get("/affiliations-summary", async (c) => {
		const users = await c.var.UserRepository.fetchApprovedUsers();
		const res: Record<string, number> = {};
		for (const user of users) {
			let key = "unknown";
			if (!user.grade) continue; // 仮登録ユーザーは集計から除外する
			if (isUndergraduateGrade(user.grade)) {
				// B1, B2, B3, B4 の場合: B1-TI みたいな形式にする
				if (user.studentId)
					key = `${GRADE_BY_ID[user.grade].name}-${user.studentId.slice(2, 4)}`;
			} else if (isGraduateGrade(user.grade)) {
				// 学年だけ
				key = GRADE_BY_ID[user.grade].name;
			}
			res[key] = (res[key] || 0) + 1;
		}
		return c.json<GetAffiliationsSummaryResponse>(res);
	});

export { route as publicRoute };
