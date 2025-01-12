import { client } from "~/utils/hono";

export interface IMemberRepository {
	getMembers: () => Promise<
		{
			id: string;
			initialized: boolean;
			displayName?: string;
			realName?: string;
			realNameKana?: string;
			displayId?: string;
			profileImageURL?: string;
			academicEmail?: string;
			email?: string;
			studentId?: string;
			grade?: string;
		}[]
	>;
	getMembers$$key(): unknown[];
}

export class MemberRepositoryImpl implements IMemberRepository {
	async getMembers() {
		const res = await client.member.list.$get();
		if (!res.ok) {
			throw new Error("Failed to fetch members");
		}
		return res.json();
	}

	getMembers$$key() {
		return ["members"];
	}
}
